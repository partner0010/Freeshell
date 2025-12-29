import { NextRequest, NextResponse } from 'next/server';

/**
 * 관리자 토큰 검증 API
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // 간단한 토큰 검증 (실제로는 JWT 검증 사용 권장)
    // 여기서는 토큰이 존재하면 유효한 것으로 간주
    if (token && token.length > 0) {
      return NextResponse.json({
        valid: true,
        message: '인증 성공',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Admin verify error:', error);
    return NextResponse.json(
      { error: '인증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

