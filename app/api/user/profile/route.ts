/**
 * 사용자 프로필 API (보안 강화)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/security/auth-enhanced';
import { validateInput } from '@/lib/security/input-validation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Profile API] 오류:', error);
    return NextResponse.json(
      { error: '프로필을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (name) {
      const nameValidation = validateInput(name, {
        minLength: 2,
        maxLength: 50,
        required: true,
      });

      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 }
        );
      }

      // 실제로는 데이터베이스 업데이트
      user.name = nameValidation.sanitized!;
    }

    return NextResponse.json({
      success: true,
      message: '프로필이 업데이트되었습니다.',
    });
  } catch (error: any) {
    console.error('[Profile API] 오류:', error);
    return NextResponse.json(
      { error: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
