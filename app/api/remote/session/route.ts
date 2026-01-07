import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/lib/session-storage';

/**
 * 원격 세션 관리 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, permissions } = body;

    console.log('[Remote Session] Action:', action, 'Code:', code, 'Sessions count:', sessionStorage.getSessionCount());

    if (action === 'create') {
      // TeamViewer 스타일: autoApprove 옵션 지원
      const autoApprove = body.autoApprove === true;
      const session = sessionStorage.createSession(
        autoApprove ? {
          screenShare: true,
          mouseControl: true,
          keyboardControl: true,
          recording: true,
        } : permissions
      );
      
      // autoApprove 플래그 저장
      if (autoApprove) {
        (session as any).autoApprove = true;
      }
      
      console.log('[Remote Session] Created:', session.code, 'AutoApprove:', autoApprove, 'Total sessions:', sessionStorage.getSessionCount());
      return NextResponse.json({ success: true, session });
    }

    if (action === 'join') {
      if (!code || code.length !== 6) {
        console.log('[Remote Session] Invalid code format:', code);
        return NextResponse.json(
          { error: '유효하지 않은 연결 코드입니다. 6자리 숫자를 입력해주세요.' },
          { status: 400 }
        );
      }

      console.log('[Remote Session] Joining with code:', code);
      const allSessions = sessionStorage.getAllSessions();
      console.log('[Remote Session] Available codes:', allSessions.map(s => s.code));
      
      const session = sessionStorage.getSession(code);
      if (!session) {
        console.log('[Remote Session] Session not found for code:', code);
        return NextResponse.json(
          { 
            error: '연결 코드를 찾을 수 없습니다.',
            message: '연결 코드가 만료되었거나 잘못 입력되었습니다. 호스트가 새로 생성한 코드를 확인해주세요.',
            debug: {
              requestedCode: code,
              availableCodes: allSessions.map(s => s.code),
              totalSessions: sessionStorage.getSessionCount(),
            },
          },
          { status: 404 }
        );
      }

      // 세션 상태를 'connected'로 업데이트하여 호스트가 감지할 수 있도록 함
      const updatedSession = sessionStorage.updateSession(code, {
        status: 'connected',
        clientConnectedAt: new Date().toISOString(),
      });
      
      if (!updatedSession) {
        return NextResponse.json(
          { error: '세션 업데이트에 실패했습니다.' },
          { status: 500 }
        );
      }
      
      console.log('[Remote Session] Client joined:', code, 'Session status:', updatedSession.status);

      return NextResponse.json({ success: true, session: updatedSession });
    }

    if (action === 'update') {
      if (!code) {
        return NextResponse.json(
          { error: '연결 코드가 필요합니다.' },
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

      const updates: any = {};
      if (permissions) {
        updates.permissions = { ...session.permissions, ...permissions };
      }
      if (body.status) {
        updates.status = body.status;
      }
      // 채팅 메시지 추가
      if (body.chatMessage) {
        if (!session.chatMessages) {
          session.chatMessages = [];
        }
        session.chatMessages.push(body.chatMessage);
        updates.chatMessages = session.chatMessages;
      }

      const updatedSession = sessionStorage.updateSession(code, updates);
      if (!updatedSession) {
        return NextResponse.json(
          { error: '세션 업데이트에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, session: updatedSession });
    }

    return NextResponse.json(
      { error: '알 수 없는 액션입니다.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: '세션 관리 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: '연결 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('[Remote Session] GET request for code:', code, 'Total sessions:', sessionStorage.getSessionCount());
    const allSessions = sessionStorage.getAllSessions();
    console.log('[Remote Session] Available codes:', allSessions.map(s => s.code));

    const session = sessionStorage.getSession(code);
    if (!session) {
      console.log('[Remote Session] Session not found for code:', code);
      return NextResponse.json(
        { 
          error: '세션을 찾을 수 없습니다.',
          debug: {
            requestedCode: code,
            availableCodes: allSessions.map(s => s.code),
            totalSessions: sessionStorage.getSessionCount(),
          },
        },
        { status: 404 }
      );
    }

    console.log('[Remote Session] Session found:', code, 'Status:', session.status);
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error('[Remote Session] GET error:', error);
    return NextResponse.json(
      { error: '세션 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

