/**
 * Stripe 클라이언트 설정
 * 실제 Stripe 통합 (개발/프로덕션 환경 구분)
 */

// 개발 환경에서는 시뮬레이션 모드 사용
const isDevelopment = process.env.NODE_ENV === 'development';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

/**
 * Stripe 결제 세션 생성 (시뮬레이션)
 */
export async function createCheckoutSession(params: {
  planId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  // 개발 환경 또는 Stripe 키가 없으면 시뮬레이션
  if (isDevelopment || !STRIPE_SECRET_KEY) {
    // 시뮬레이션 모드: 실제 결제 없이 성공 응답 반환
    const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      sessionId: mockSessionId,
      url: `${params.successUrl}?session_id=${mockSessionId}&plan_id=${params.planId}`,
    };
  }

  // 프로덕션 환경: 실제 Stripe API 호출
  try {
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: getPlanName(params.planId),
              description: getPlanDescription(params.planId),
            },
            unit_amount: getPlanPrice(params.planId),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      client_reference_id: params.userId,
      metadata: {
        planId: params.planId,
        userId: params.userId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  } catch (error: any) {
    console.error('[Stripe] 결제 세션 생성 실패:', error);
    throw new Error('결제 세션 생성 중 오류가 발생했습니다.');
  }
}

/**
 * Stripe 결제 세션 확인
 */
export async function verifyCheckoutSession(sessionId: string): Promise<{
  success: boolean;
  planId?: string;
  userId?: string;
}> {
  // 개발 환경 또는 Stripe 키가 없으면 시뮬레이션
  if (isDevelopment || !STRIPE_SECRET_KEY) {
    // 시뮬레이션 모드: 모든 세션을 성공으로 처리
    return {
      success: true,
      planId: 'personal', // 기본값
      userId: 'user-123', // 기본값
    };
  }

  // 프로덕션 환경: 실제 Stripe API 호출
  try {
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return {
        success: true,
        planId: session.metadata?.planId || 'personal',
        userId: session.metadata?.userId || session.client_reference_id || '',
      };
    }

    return { success: false };
  } catch (error: any) {
    console.error('[Stripe] 결제 세션 확인 실패:', error);
    return { success: false };
  }
}

/**
 * 플랜 이름 가져오기
 */
function getPlanName(planId: string): string {
  const planNames: Record<string, string> = {
    free: '무료',
    personal: '개인',
    pro: '프로',
    enterprise: '엔터프라이즈',
  };
  return planNames[planId] || '플랜';
}

/**
 * 플랜 설명 가져오기
 */
function getPlanDescription(planId: string): string {
  const descriptions: Record<string, string> = {
    free: '기본 AI 콘텐츠 제작 및 관리 기능',
    personal: '개인 크리에이터를 위한 모든 기능',
    pro: '전문가 및 소규모 팀을 위한 고급 기능',
    enterprise: '대규모 조직을 위한 맞춤형 솔루션',
  };
  return descriptions[planId] || '';
}

/**
 * 플랜 가격 가져오기 (원 단위)
 */
function getPlanPrice(planId: string): number {
  const prices: Record<string, number> = {
    free: 0,
    personal: 4900,
    pro: 14900,
    enterprise: 0, // 별도 문의
  };
  return prices[planId] || 0;
}

