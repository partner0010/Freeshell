import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { getSecureEnv } from '@/lib/security/env-security';

/**
 * 관리자 로그인 API
 * 기본 관리자 계정: admin@freeshell.co.kr / Admin123!@#
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

    // 기본 관리자 계정 (환경 변수에서 가져오거나 기본값 사용)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@freeshell.co.kr';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';

    // 실제로는 bcrypt로 해시된 비밀번호와 비교해야 하지만, 여기서는 간단히 비교
    // 프로덕션에서는 반드시 해시된 비밀번호 사용
    if (emailValidation.sanitized === adminEmail && passwordValidation.sanitized === adminPassword) {
      // 간단한 토큰 생성 (실제로는 JWT 사용 권장)
      const token = Buffer.from(`${adminEmail}:${Date.now()}`).toString('base64');
      
      return NextResponse.json({
        success: true,
        token,
        message: '로그인 성공',
      });
    } else {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

