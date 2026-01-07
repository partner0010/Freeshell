import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/lib/session-storage';

/**
 * WebRTC 시그널링 서버
 * Offer/Answer/ICE candidate 교환
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, offer, answer, candidate, from } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: '유효하지 않은 연결 코드입니다.' },
        { status: 400 }
      );
    }

    const session = sessionStorage.getSession(code);
    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('[Signaling]', action, 'from', from, 'code', code);

    switch (action) {
      case 'offer':
        // 클라이언트가 Offer를 보냄
        if (!offer || from !== 'client') {
          return NextResponse.json(
            { error: 'Invalid offer' },
            { status: 400 }
          );
        }
        
        // 세션에 Offer 저장
        sessionStorage.updateSession(code, {
          webrtc: {
            ...session.webrtc,
            offer,
            offerFrom: 'client',
            offerTimestamp: new Date().toISOString(),
          },
        } as any);
        
        return NextResponse.json({ success: true, message: 'Offer received' });

      case 'answer':
        // 호스트가 Answer를 보냄
        if (!answer || from !== 'host') {
          return NextResponse.json(
            { error: 'Invalid answer' },
            { status: 400 }
          );
        }
        
        // 세션에 Answer 저장
        sessionStorage.updateSession(code, {
          webrtc: {
            ...session.webrtc,
            answer,
            answerFrom: 'host',
            answerTimestamp: new Date().toISOString(),
          },
        } as any);
        
        return NextResponse.json({ success: true, message: 'Answer received' });

      case 'ice-candidate':
        // ICE candidate 교환
        if (!candidate) {
          return NextResponse.json(
            { error: 'Invalid candidate' },
            { status: 400 }
          );
        }
        
        // 상대방에게 전달할 candidate 저장
        const updatedSession = sessionStorage.getSession(code);
        if (updatedSession) {
          const candidates = (updatedSession.webrtc as any)?.candidates || [];
          candidates.push({ candidate, from, timestamp: new Date().toISOString() });
          
          sessionStorage.updateSession(code, {
            webrtc: {
              ...(updatedSession.webrtc as any || {}),
              candidates,
            },
          } as any);
        }
        
        return NextResponse.json({ success: true, message: 'ICE candidate received' });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[Signaling] Error:', error);
    return NextResponse.json(
      { error: '시그널링 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 시그널링 데이터 조회 (폴링용)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const from = searchParams.get('from'); // 'host' or 'client'

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: '유효하지 않은 연결 코드입니다.' },
        { status: 400 }
      );
    }

    if (!from || (from !== 'host' && from !== 'client')) {
      return NextResponse.json(
        { error: 'from 파라미터는 host 또는 client여야 합니다.' },
        { status: 400 }
      );
    }

    const session = sessionStorage.getSession(code);
    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const webrtc = (session as any).webrtc || {};
    
    // 상대방이 보낸 데이터만 반환
    if (from === 'client') {
      // 클라이언트는 호스트의 Answer와 ICE candidates를 받음
      return NextResponse.json({
        success: true,
        answer: webrtc.answerFrom === 'host' ? webrtc.answer : null,
        candidates: (webrtc.candidates || []).filter((c: any) => c.from === 'host'),
      });
    } else {
      // 호스트는 클라이언트의 Offer와 ICE candidates를 받음
      return NextResponse.json({
        success: true,
        offer: webrtc.offerFrom === 'client' ? webrtc.offer : null,
        candidates: (webrtc.candidates || []).filter((c: any) => c.from === 'client'),
      });
    }
  } catch (error: any) {
    console.error('[Signaling] GET Error:', error);
    return NextResponse.json(
      { error: '시그널링 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}
