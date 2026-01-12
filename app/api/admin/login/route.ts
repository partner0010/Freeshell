import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { cookies } from 'next/headers';
import { loginUser } from '@/lib/security/auth-enhanced';

/**
 * 관리자 로그인 API
 * 관리자 계정: admin@freeshell.co.kr / Admin123!@#
 * 테스트 계정: test@freeshell.co.kr / Test123!@#
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting (관리자 로그인은 더 엄격하게)
    const rateLimit = await rateLimitCheck(request, 5, 300000); // 5분에 5회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: '너무 많은 로그인 시도입니다. 5분 후 다시 시도해주세요.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // 입력 검증
    const emailValidation = validateInput(email, {
      maxLength: 100,
      required: true,
      type: 'email',
      allowHtml: false,
    });

    const passwordValidation = validateInput(password, {
      maxLength: 100,
      required: true,
      allowHtml: false,
    });

    if (!emailValidation.valid || !passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // auth-enhanced의 loginUser 사용 (관리자 계정도 일반 로그인과 동일하게 처리)
    const sanitizedEmail = emailValidation.sanitized!;
    const sanitizedPassword = passwordValidation.sanitized!;
    
    const result = await loginUser(sanitizedEmail, sanitizedPassword, request);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 세션 쿠키 설정
    const cookieStore = await cookies();
    cookieStore.set('session', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });
    
    return NextResponse.json({
      success: true,
      token: result.token,
      message: '로그인 성공',
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

