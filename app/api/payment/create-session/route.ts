/**
 * 결제 세션 생성 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 세션 확인
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: '플랜 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 유효한 플랜 ID 확인
    const validPlans = ['personal', 'pro', 'enterprise'];
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { error: '유효하지 않은 플랜 ID입니다.' },
        { status: 400 }
      );
    }

    // 현재 플랜 확인
    if (session.plan === planId) {
      return NextResponse.json(
        { error: '이미 해당 플랜을 사용 중입니다.' },
        { status: 400 }
      );
    }

    // 결제 세션 생성
    const baseUrl = req.nextUrl.origin;
    const checkoutSession = await createCheckoutSession({
      planId,
      userId: session.id,
      successUrl: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing?plan=${planId}&canceled=true`,
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('[Payment API] 오류:', error);
    return NextResponse.json(
      {
        error: '결제 세션 생성 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

