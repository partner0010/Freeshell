/**
 * 결제 확인 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyCheckoutSession } from '@/lib/stripe';
import { userService } from '@/lib/services/userService';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Stripe 세션 확인
    const verification = await verifyCheckoutSession(sessionId);

    if (!verification.success || !verification.planId || !verification.userId) {
      return NextResponse.json(
        { error: '결제 확인에 실패했습니다.' },
        { status: 400 }
      );
    }

    // 사용자 플랜 업데이트
    const updatedUser = userService.upgradePlan(
      verification.userId,
      verification.planId as 'free' | 'personal' | 'pro' | 'enterprise'
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: '플랜 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        plan: updatedUser.plan,
      },
      message: '플랜이 성공적으로 업그레이드되었습니다.',
    });
  } catch (error: any) {
    console.error('[Payment Verify API] 오류:', error);
    return NextResponse.json(
      {
        error: '결제 확인 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

