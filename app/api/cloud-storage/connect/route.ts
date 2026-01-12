/**
 * 클라우드 저장소 연결 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider, code } = body; // OAuth code

    if (!provider || !['google-drive', 'dropbox', 'github'].includes(provider)) {
      return NextResponse.json(
        { error: '유효하지 않은 제공자입니다.' },
        { status: 400 }
      );
    }

    // 실제로는 OAuth 토큰 교환 및 저장
    // 여기서는 시뮬레이션
    const token = `token_${provider}_${Date.now()}`;

    // 실제로는 데이터베이스에 토큰 저장
    // await saveCloudStorageToken(session.userId, provider, token);

    return NextResponse.json({
      success: true,
      provider,
      connected: true,
      message: `${provider} 연결이 완료되었습니다.`,
    });
  } catch (error: any) {
    console.error('[클라우드 저장소 연결 API] 오류:', error);
    return NextResponse.json(
      { error: '연결 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    // 실제로는 데이터베이스에서 연결 상태 조회
    const connected = false; // 임시

    return NextResponse.json({
      success: true,
      connected,
      provider: provider || null,
    });
  } catch (error: any) {
    console.error('[클라우드 저장소 상태 조회 API] 오류:', error);
    return NextResponse.json(
      { error: '상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
