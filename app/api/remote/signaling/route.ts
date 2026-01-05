import { NextRequest, NextResponse } from 'next/server';

// 시그널링 데이터 저장소 (실제로는 Redis 사용 권장)
const signalingData = new Map<string, any>();

/**
 * WebRTC 시그널링 서버
 * Offer/Answer 및 ICE Candidate 교환
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, offer, answer, candidate, type } = body;

    if (!code) {
      return NextResponse.json(
        { error: '연결 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    const sessionKey = `signaling:${code}`;

    if (action === 'offer') {
      // Offer 저장
      signalingData.set(`${sessionKey}:offer`, {
        offer,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        message: 'Offer가 저장되었습니다.',
      });
    }

    if (action === 'answer') {
      // Answer 저장
      signalingData.set(`${sessionKey}:answer`, {
        answer,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        message: 'Answer가 저장되었습니다.',
      });
    }

    if (action === 'ice-candidate') {
      // ICE Candidate 저장 (배열로 관리)
      const candidatesKey = `${sessionKey}:candidates`;
      const existing = signalingData.get(candidatesKey) || [];
      existing.push({
        candidate,
        timestamp: new Date().toISOString(),
      });
      signalingData.set(candidatesKey, existing);
      return NextResponse.json({
        success: true,
        message: 'ICE Candidate가 저장되었습니다.',
      });
    }

    if (action === 'get') {
      // 저장된 시그널링 데이터 조회
      const offer = signalingData.get(`${sessionKey}:offer`);
      const answer = signalingData.get(`${sessionKey}:answer`);
      const candidates = signalingData.get(`${sessionKey}:candidates`) || [];

      return NextResponse.json({
        success: true,
        offer: offer?.offer || null,
        answer: answer?.answer || null,
        candidates: candidates.map((c: any) => c.candidate),
      });
    }

    return NextResponse.json(
      { error: '알 수 없는 액션입니다.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: '시그널링 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const type = searchParams.get('type'); // 'offer' | 'answer' | 'candidates'

    if (!code) {
      return NextResponse.json(
        { error: '연결 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    const sessionKey = `signaling:${code}`;

    if (type === 'offer') {
      const offer = signalingData.get(`${sessionKey}:offer`);
      return NextResponse.json({
        success: true,
        data: offer?.offer || null,
      });
    }

    if (type === 'answer') {
      const answer = signalingData.get(`${sessionKey}:answer`);
      return NextResponse.json({
        success: true,
        data: answer?.answer || null,
      });
    }

    if (type === 'candidates') {
      const candidates = signalingData.get(`${sessionKey}:candidates`) || [];
      return NextResponse.json({
        success: true,
        data: candidates.map((c: any) => c.candidate),
      });
    }

    // 전체 데이터 반환
    const offer = signalingData.get(`${sessionKey}:offer`);
    const answer = signalingData.get(`${sessionKey}:answer`);
    const candidates = signalingData.get(`${sessionKey}:candidates`) || [];

    return NextResponse.json({
      success: true,
      offer: offer?.offer || null,
      answer: answer?.answer || null,
      candidates: candidates.map((c: any) => c.candidate),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '시그널링 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

