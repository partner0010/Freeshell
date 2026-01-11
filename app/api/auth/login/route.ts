/**
 * 로그인 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';
import { createSession } from '@/lib/auth';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { validateInput } from '@/lib/security/input-validation';

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting (브루트포스 공격 방지) - 1분에 5회
    const rateLimit = await rateLimitCheck(req, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts', 
          message: '로그인 시도가 너무 많습니다. 1분 후 다시 시도해주세요.' 
        },
        { 
          status: 429, 
          headers: Object.fromEntries(rateLimit.headers.entries()) 
        }
      );
    }

    const { email, password } = await req.json();

    // 입력 검증
    const emailValidation = validateInput(email, {
      type: 'email',
      required: true,
      maxLength: 255,
    });

    const passwordValidation = validateInput(password, {
      required: true,
      minLength: 8,
      maxLength: 128,
    });

    if (!emailValidation.valid || !passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: emailValidation.error || passwordValidation.error || '입력값이 올바르지 않습니다.' 
        },
        { status: 400 }
      );
    }

    // 사용자 인증 (userService가 비밀번호 검증 처리)
    const user = await userService.authenticate(email, password);
    if (!user) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 세션 생성
    await createSession(user.id, user.email, user.plan as 'free' | 'personal' | 'pro' | 'enterprise');

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
        },
        message: '로그인되었습니다.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Login API] 오류:', error);
    return NextResponse.json(
      {
        error: '로그인 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

