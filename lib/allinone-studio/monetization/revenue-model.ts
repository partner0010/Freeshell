/**
 * STEP 4: 무료 + 유료 하이브리드 수익 구조
 * 지속 가능한 수익 모델 설계
 */

/**
 * ============================================
 * 무료/유료 기능 분리 기준
 * ============================================
 */

export interface FeatureTier {
  free: {
    features: string[];
    limits: {
      maxProjects: number;
      maxScenesPerProject: number;
      maxRenderMinutes: number;
      maxStorageGB: number;
      maxCharacters: number;
    };
  };
  paid: {
    features: string[];
    limits: {
      maxProjects: number | 'unlimited';
      maxScenesPerProject: number | 'unlimited';
      maxRenderMinutes: number | 'unlimited';
      maxStorageGB: number | 'unlimited';
      maxCharacters: number | 'unlimited';
    };
  };
}

export const FeatureSeparation: FeatureTier = {
  free: {
    features: [
      'basic-editor',
      'template-library',
      'character-creation',
      'scene-editing',
      'preview',
      'basic-rendering',
      'community-plugins',
    ],
    limits: {
      maxProjects: 5,
      maxScenesPerProject: 10,
      maxRenderMinutes: 30,  // 월 30분
      maxStorageGB: 1,
      maxCharacters: 3,
    },
  },
  paid: {
    features: [
      'advanced-editor',
      'premium-templates',
      'unlimited-characters',
      'unlimited-scenes',
      'advanced-rendering',
      'premium-plugins',
      'team-collaboration',
      'priority-support',
      'custom-styles',
      'api-access',
    ],
    limits: {
      maxProjects: 'unlimited',
      maxScenesPerProject: 'unlimited',
      maxRenderMinutes: 'unlimited',
      maxStorageGB: 'unlimited',
      maxCharacters: 'unlimited',
    },
  },
};

/**
 * ============================================
 * 과금 단위 설계
 * ============================================
 */

export interface PricingUnit {
  id: string;
  name: string;
  type: 'one-time' | 'subscription' | 'usage-based' | 'credit';
  unit: string;
  price: number;
  currency: string;
}

export const PricingUnits: Record<string, PricingUnit[]> = {
  'rendering-time': [
    {
      id: 'render-10min',
      name: '렌더링 10분',
      type: 'usage-based',
      unit: '10 minutes',
      price: 1.0,
      currency: 'USD',
    },
    {
      id: 'render-60min',
      name: '렌더링 60분',
      type: 'usage-based',
      unit: '60 minutes',
      price: 5.0,
      currency: 'USD',
    },
  ],
  'premium-characters': [
    {
      id: 'character-pack-1',
      name: '프리미엄 캐릭터 팩 1',
      type: 'one-time',
      unit: 'pack',
      price: 9.99,
      currency: 'USD',
    },
  ],
  'plugins': [
    {
      id: 'plugin-premium',
      name: '프리미엄 플러그인',
      type: 'one-time',
      unit: 'plugin',
      price: 4.99,
      currency: 'USD',
    },
  ],
  'storage': [
    {
      id: 'storage-10gb',
      name: '저장 공간 10GB',
      type: 'subscription',
      unit: 'month',
      price: 2.99,
      currency: 'USD',
    },
  ],
  'team-collaboration': [
    {
      id: 'team-5',
      name: '팀 협업 (5명)',
      type: 'subscription',
      unit: 'month',
      price: 19.99,
      currency: 'USD',
    },
  ],
};

/**
 * ============================================
 * 사용자 성장 → 과금 전환 흐름
 * ============================================
 */

export interface UserGrowthFlow {
  stages: [
    {
      stage: 'discovery',
      action: 'signup',
      trigger: 'free-trial',
      next: 'engagement',
    },
    {
      stage: 'engagement',
      action: 'create-first-project',
      trigger: 'project-created',
      next: 'limitation',
    },
    {
      stage: 'limitation',
      action: 'hit-free-limit',
      trigger: 'limit-reached',
      next: 'upsell',
    },
    {
      stage: 'upsell',
      action: 'show-upgrade-option',
      trigger: 'user-interested',
      next: 'conversion',
    },
    {
      stage: 'conversion',
      action: 'purchase',
      trigger: 'payment-success',
      next: 'retention',
    },
    {
      stage: 'retention',
      action: 'continue-usage',
      trigger: 'monthly-renewal',
      next: 'expansion',
    },
    {
      stage: 'expansion',
      action: 'purchase-additional',
      trigger: 'need-more',
      next: 'retention',
    },
  ];
}

/**
 * 전환 트리거 포인트
 */
export const ConversionTriggers = {
  // 무료 한도 도달
  limitReached: {
    projects: {
      message: '프로젝트 생성 한도에 도달했습니다. 업그레이드하여 무제한으로 사용하세요.',
      cta: '업그레이드',
    },
    renderTime: {
      message: '렌더링 시간이 부족합니다. 추가 시간을 구매하거나 무제한 플랜으로 업그레이드하세요.',
      cta: '시간 구매',
    },
    storage: {
      message: '저장 공간이 부족합니다. 추가 공간을 구매하거나 무제한 플랜으로 업그레이드하세요.',
      cta: '공간 구매',
    },
  },
  
  // 프리미엄 기능 사용 시도
  premiumFeature: {
    message: '이 기능은 프리미엄 플랜에서만 사용할 수 있습니다.',
    cta: '프리미엄으로 업그레이드',
  },
  
  // 성능 향상 제안
  performanceUpgrade: {
    message: '더 빠른 렌더링과 고품질 출력을 위해 프리미엄 플랜을 추천합니다.',
    cta: '프리미엄 체험',
  },
};

/**
 * ============================================
 * 플러그인 마켓 수익 분배
 * ============================================
 */

export interface MarketplaceRevenueShare {
  // 수익 분배 비율
  split: {
    platform: number;  // 플랫폼 수수료 (예: 30%)
    developer: number;  // 개발자 수익 (예: 70%)
  };
  
  // 결제 구조
  payment: {
    method: 'stripe' | 'paypal' | 'crypto';
    frequency: 'immediate' | 'monthly' | 'quarterly';
    minimumPayout: number;
  };
  
  // 통계 제공
  analytics: {
    sales: number;
    downloads: number;
    revenue: number;
    period: 'daily' | 'weekly' | 'monthly';
  };
}

export const DefaultRevenueShare: MarketplaceRevenueShare = {
  split: {
    platform: 30,
    developer: 70,
  },
  payment: {
    method: 'stripe',
    frequency: 'monthly',
    minimumPayout: 50,
  },
  analytics: {
    sales: 0,
    downloads: 0,
    revenue: 0,
    period: 'monthly',
  },
};

/**
 * ============================================
 * 과금 UX 주의 사항
 * ============================================
 */

export const BillingUXGuidelines = {
  // 명확한 가격 표시
  pricing: {
    display: 'transparent',
    showComparison: true,
    highlightValue: true,
  },
  
  // 무료 체험
  freeTrial: {
    duration: 14,  // days
    noCreditCard: true,
    easyCancel: true,
  },
  
  // 업그레이드 유도
  upgrade: {
    timing: 'non-intrusive',
    valueProposition: 'clear',
    socialProof: true,
  },
  
  // 결제 프로세스
  checkout: {
    steps: 3,  // 최대 3단계
    saveProgress: true,
    multiplePaymentMethods: true,
  },
  
  // 취소 정책
  cancellation: {
    easy: true,
    immediate: false,  // 기간 종료 시 취소
    refundPolicy: 'prorated',
  },
};

/**
 * ============================================
 * 수익 모델 시뮬레이션
 * ============================================
 */

export interface RevenueProjection {
  freeUsers: number;
  paidUsers: number;
  conversionRate: number;  // %
  averageRevenuePerUser: number;  // ARPU
  monthlyRecurringRevenue: number;  // MRR
  annualRecurringRevenue: number;  // ARR
}

export function calculateRevenue(
  freeUsers: number,
  conversionRate: number,
  arpu: number
): RevenueProjection {
  const paidUsers = Math.floor(freeUsers * (conversionRate / 100));
  const mrr = paidUsers * arpu;
  const arr = mrr * 12;
  
  return {
    freeUsers,
    paidUsers,
    conversionRate,
    averageRevenuePerUser: arpu,
    monthlyRecurringRevenue: mrr,
    annualRecurringRevenue: arr,
  };
}

/**
 * 예시: 10,000명 무료 사용자, 5% 전환율, $10 ARPU
 * → 500명 유료 사용자, $5,000 MRR, $60,000 ARR
 */
