/**
 * 2FA 설정 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/security/auth-enhanced';

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
    const { enabled } = body;

    // 실제로는 2FA 설정 로직 구현
    user.twoFactorEnabled = enabled === true;

    return NextResponse.json({
      success: true,
      message: enabled ? '2단계 인증이 활성화되었습니다.' : '2단계 인증이 비활성화되었습니다.',
    });
  } catch (error: any) {
    console.error('[2FA API] 오류:', error);
    return NextResponse.json(
      { error: '2FA 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
