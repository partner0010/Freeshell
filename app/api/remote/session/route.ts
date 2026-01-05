import { NextRequest, NextResponse } from 'next/server';

// 세션 저장소 (실제로는 데이터베이스 사용)
const sessions = new Map<string, any>();

/**
 * 원격 세션 관리 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, permissions } = body;

    if (action === 'create') {
      const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
      const session = {
        code: sessionCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: 'pending',
        permissions: permissions || {
          screenShare: false,
          mouseControl: false,
          keyboardControl: false,
          recording: false,
        },
      };
      sessions.set(sessionCode, session);
      return NextResponse.json({ success: true, session });
    }

    if (action === 'join') {
      if (!code || code.length !== 6) {
        return NextResponse.json(
          { error: '유효하지 않은 연결 코드입니다.' },
          { status: 400 }
        );
      }

      const session = sessions.get(code);
      if (!session) {
        return NextResponse.json(
          { error: '연결 코드를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (new Date(session.expiresAt) < new Date()) {
        sessions.delete(code);
        return NextResponse.json(
          { error: '연결 코드가 만료되었습니다.' },
          { status: 410 }
        );
      }

      return NextResponse.json({ success: true, session });
    }

    if (action === 'update') {
      if (!code) {
        return NextResponse.json(
          { error: '연결 코드가 필요합니다.' },
          { status: 400 }
        );
      }

      const session = sessions.get(code);
      if (!session) {
        return NextResponse.json(
          { error: '세션을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (permissions) {
        session.permissions = { ...session.permissions, ...permissions };
      }
      session.status = body.status || session.status;
      sessions.set(code, session);

      return NextResponse.json({ success: true, session });
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

    const session = sessions.get(code);
    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json(
      { error: '세션 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

