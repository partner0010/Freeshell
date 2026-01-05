import { NextRequest, NextResponse } from 'next/server';

/**
 * 원격 접속 연결 코드 생성 API
 * 6자리 연결 코드를 생성하고 세션을 관리
 */
export async function POST(request: NextRequest) {
  try {
    // 6자리 숫자 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 세션 정보 (실제로는 데이터베이스에 저장)
    const session = {
      code,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30분 후 만료
      status: 'pending',
      permissions: {
        screenShare: false,
        mouseControl: false,
        keyboardControl: false,
        recording: false,
      },
    };

    return NextResponse.json({
      success: true,
      code,
      session,
      message: '연결 코드가 생성되었습니다.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '코드 생성 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 연결 코드 검증 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: '유효하지 않은 연결 코드입니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 세션 조회
    // 여기서는 시뮬레이션
    const isValid = /^\d{6}$/.test(code);

    return NextResponse.json({
      valid: isValid,
      code,
      message: isValid ? '유효한 연결 코드입니다.' : '유효하지 않은 연결 코드입니다.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '코드 검증 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

