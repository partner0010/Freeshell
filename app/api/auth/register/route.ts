/**
 * 회원가입 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';
import { createSession } from '@/lib/auth';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { validateInput } from '@/lib/security/input-validation';
import { validatePasswordStrength } from '@/lib/security/password-policy';

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting (스팸 계정 생성 방지) - 1분에 3회
    const rateLimit = await rateLimitCheck(req, 3, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many registration attempts', 
          message: '회원가입 시도가 너무 많습니다. 1분 후 다시 시도해주세요.' 
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

    // 비밀번호 복잡도 검증
    const passwordStrength = validatePasswordStrength(passwordValidation.sanitized);
    if (!passwordStrength.valid) {
      return NextResponse.json(
        { error: passwordStrength.error },
        { status: 400 }
      );
    }

    // 기존 사용자 확인
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 409 }
      );
    }

    // 사용자 생성 (userService가 비밀번호 해시 처리)
    const newUser = await userService.createUser({
      email,
      password,
      plan: 'free',
    });

    // 세션 생성
    await createSession(newUser.id, newUser.email, newUser.plan as 'free' | 'personal' | 'pro' | 'enterprise');

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          plan: newUser.plan,
        },
        message: '회원가입이 완료되었습니다.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Register API] 오류:', error);
    return NextResponse.json(
      {
        error: '회원가입 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

