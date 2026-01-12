/**
 * 비밀번호 변경 API (보안 강화)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/security/auth-enhanced';
import { compare, hash } from 'bcryptjs';
import { validateInput } from '@/lib/security/input-validation';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 현재 비밀번호 확인
    const passwordValid = await compare(currentPassword, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: '현재 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 새 비밀번호 검증
    const passwordValidation = validateInput(newPassword, {
      minLength: 8,
      maxLength: 128,
      required: true,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    });

    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: '비밀번호는 최소 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해싱 및 업데이트
    const newPasswordHash = await hash(newPassword, 12);
    user.passwordHash = newPasswordHash;

    return NextResponse.json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
    });
  } catch (error: any) {
    console.error('[Change Password API] 오류:', error);
    return NextResponse.json(
      { error: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
