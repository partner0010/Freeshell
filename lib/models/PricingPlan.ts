/**
 * 가격 플랜 모델
 */
export type PlanType = 'free' | 'personal' | 'pro' | 'enterprise';

export interface PricingPlan {
  id: PlanType;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly?: number;
  };
  features: {
    // 콘텐츠 제작 관련
    contentCreation: {
      maxProjects: number; // -1은 무제한
      maxStepsPerProject: number; // 3 또는 5
      platformConversion: boolean; // 플랫폼 변환 기능
      premiumAIModels: boolean; // 고급 AI 모델 사용
      contentTemplates: number; // 템플릿 개수 (-1은 무제한)
    };
    // 관리자 기능 (유료 서비스)
    adminTools: {
      electronicSignature: boolean; // 전자결재
      systemDiagnostics: boolean; // 시스템 진단
      debugTools: boolean; // 디버그 도구
      siteCheck: boolean; // 사이트 검사
      remoteSolution: boolean; // 원격 솔루션
      maxScans: number; // 스캔 횟수 (-1은 무제한)
      maxRemoteSessions: number; // 원격 세션 수 (-1은 무제한)
      prioritySupport: boolean; // 우선 지원
    };
    // 일반 기능
    general: {
      storage: number; // 저장 공간 (GB, -1은 무제한)
      apiAccess: boolean; // API 접근
      whiteLabel: boolean; // 화이트라벨
      customBranding: boolean; // 커스텀 브랜딩
      dedicatedSupport: boolean; // 전담 지원
    };
    // 바이럴 기능 (2024-2025 트렌드)
    viralFeatures?: {
      hashtagGenerator: boolean; // AI 해시태그 생성기
      snsScheduler: boolean; // SNS 자동 포스팅 스케줄러
      shortFormContent: boolean; // 숏폼 콘텐츠 생성기
      trendingTopics: boolean; // 트렌딩 주제 추천
    };
  };
  limits: {
    apiCallsPerMonth: number; // -1은 무제한
    aiGenerationsPerMonth: number; // -1은 무제한
    concurrentUsers: number; // 동시 사용자 수
  };
}

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
  free: {
    id: 'free',
    name: '무료',
    description: '개인 사용자를 위한 기본 기능 (완전 무료)',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: {
      contentCreation: {
        maxProjects: 3,
        maxStepsPerProject: 3, // PLAN, STRUCTURE, DRAFT까지만
        platformConversion: false,
        premiumAIModels: false,
        contentTemplates: 5,
      },
      adminTools: {
        electronicSignature: false,
        systemDiagnostics: false,
        debugTools: false,
        siteCheck: false,
        remoteSolution: false,
        maxScans: 0,
        maxRemoteSessions: 0,
        prioritySupport: false,
      },
      // 무료 플랜 추가 기능
      viralFeatures: {
        hashtagGenerator: true, // 해시태그 생성기 (무료, 월 10회 제한)
        snsScheduler: false,
        shortFormContent: false,
        trendingTopics: true, // 트렌딩 주제 추천 (무료)
      },
      general: {
        storage: 1, // 1GB
        apiAccess: false,
        whiteLabel: false,
        customBranding: false,
        dedicatedSupport: false,
      },
    },
    limits: {
      apiCallsPerMonth: 100,
      aiGenerationsPerMonth: 10,
      concurrentUsers: 1,
    },
  },
  personal: {
    id: 'personal',
    name: '개인',
    description: '프리랜서 및 개인 창작자를 위한 플랜 (거의 무료)',
    price: {
      monthly: 4900, // 월 4,900원 (기존 9,900원에서 할인)
      yearly: 49000, // 연간 49,000원 (2개월 무료)
    },
    features: {
      contentCreation: {
        maxProjects: 10,
        maxStepsPerProject: 5, // 모든 단계
        platformConversion: true,
        premiumAIModels: false,
        contentTemplates: 20,
      },
      adminTools: {
        electronicSignature: true, // 기본 기능만
        systemDiagnostics: true, // 월 10회 제한
        debugTools: false,
        siteCheck: true, // 월 10회 제한
        remoteSolution: true, // 월 5회 제한
        maxScans: 10,
        maxRemoteSessions: 5,
        prioritySupport: false,
      },
      // 개인 플랜 바이럴 기능
      viralFeatures: {
        hashtagGenerator: true, // 해시태그 생성기 (월 100회)
        snsScheduler: true, // SNS 자동 포스팅 (월 30회)
        shortFormContent: true, // 숏폼 콘텐츠 생성기
        trendingTopics: true, // 트렌딩 주제 추천
      },
      general: {
        storage: 10, // 10GB
        apiAccess: true,
        whiteLabel: false,
        customBranding: false,
        dedicatedSupport: false,
      },
    },
    limits: {
      apiCallsPerMonth: 1000,
      aiGenerationsPerMonth: 100,
      concurrentUsers: 1,
    },
  },
  pro: {
    id: 'pro',
    name: '프로',
    description: '소규모 팀 및 전문가를 위한 플랜 (합리적 가격)',
    price: {
      monthly: 14900, // 월 14,900원 (기존 29,900원에서 할인)
      yearly: 149000, // 연간 149,000원 (2개월 무료)
    },
    features: {
      contentCreation: {
        maxProjects: -1, // 무제한
        maxStepsPerProject: 5,
        platformConversion: true,
        premiumAIModels: true, // 고급 AI 모델 사용
        contentTemplates: -1, // 무제한
      },
      adminTools: {
        electronicSignature: true, // 고급 기능
        systemDiagnostics: true, // 월 100회
        debugTools: true, // 디버그 도구 사용 가능
        siteCheck: true, // 월 100회
        remoteSolution: true, // 월 50회
        maxScans: 100,
        maxRemoteSessions: 50,
        prioritySupport: true,
      },
      // 프로 플랜 바이럴 기능
      viralFeatures: {
        hashtagGenerator: true, // 해시태그 생성기 (무제한)
        snsScheduler: true, // SNS 자동 포스팅 (무제한)
        shortFormContent: true, // 숏폼 콘텐츠 생성기
        trendingTopics: true, // 트렌딩 주제 추천
      },
      general: {
        storage: 50, // 50GB
        apiAccess: true,
        whiteLabel: false,
        customBranding: true, // 커스텀 브랜딩
        dedicatedSupport: false,
      },
    },
    limits: {
      apiCallsPerMonth: 10000,
      aiGenerationsPerMonth: 1000,
      concurrentUsers: 5,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: '엔터프라이즈',
    description: '대기업 및 대규모 조직을 위한 맞춤형 플랜',
    price: {
      monthly: 99000, // 월 99,000원 (기본)
      yearly: 990000, // 연간 990,000원 (기본)
    },
    features: {
      contentCreation: {
        maxProjects: -1,
        maxStepsPerProject: 5,
        platformConversion: true,
        premiumAIModels: true,
        contentTemplates: -1,
      },
      adminTools: {
        electronicSignature: true, // 모든 고급 기능
        systemDiagnostics: true, // 무제한
        debugTools: true,
        siteCheck: true, // 무제한
        remoteSolution: true, // 무제한
        maxScans: -1, // 무제한
        maxRemoteSessions: -1, // 무제한
        prioritySupport: true,
      },
      // 엔터프라이즈 플랜 바이럴 기능
      viralFeatures: {
        hashtagGenerator: true, // 해시태그 생성기 (무제한)
        snsScheduler: true, // SNS 자동 포스팅 (무제한)
        shortFormContent: true, // 숏폼 콘텐츠 생성기
        trendingTopics: true, // 트렌딩 주제 추천
      },
      general: {
        storage: -1, // 무제한
        apiAccess: true,
        whiteLabel: true, // 화이트라벨
        customBranding: true,
        dedicatedSupport: true, // 전담 지원
      },
    },
    limits: {
      apiCallsPerMonth: -1, // 무제한
      aiGenerationsPerMonth: -1, // 무제한
      concurrentUsers: -1, // 무제한
    },
  },
};

