/**
 * 로그인 API (보안 강화)
 */
import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/security/auth-enhanced';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password, request);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // 세션 쿠키 설정 (보안 강화)
    const cookieStore = await cookies();
    cookieStore.set('session', result.token!, {
      httpOnly: true, // XSS 방지
      secure: process.env.NODE_ENV === 'production', // HTTPS만
      sameSite: 'strict', // CSRF 방지
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: '로그인되었습니다.',
    });
  } catch (error: any) {
    console.error('[Login API] 오류:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
