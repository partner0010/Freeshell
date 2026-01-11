/**
 * 플랜 제한 서비스
 * 사용자의 플랜에 따라 기능 접근 제한을 관리
 */
import { paymentService } from './paymentService';
import { userService } from './userService';
import { PRICING_PLANS, type PlanType } from '@/lib/models/PricingPlan';

export class PlanLimitService {
  /**
   * 콘텐츠 제작 기능 접근 확인
   */
  checkContentCreationAccess(userId: string, step: 'PLAN' | 'STRUCTURE' | 'DRAFT' | 'QUALITY' | 'PLATFORM'): {
    allowed: boolean;
    reason?: string;
    requiresUpgrade?: boolean;
    upgradePlan?: PlanType;
  } {
    const { plan } = paymentService.getActivePlan(userId);
    const planFeatures = PRICING_PLANS[plan].features.contentCreation;

    // 플랫폼 변환은 유료 플랜 전용
    if (step === 'PLATFORM' && !planFeatures.platformConversion) {
      return {
        allowed: false,
        reason: '플랫폼 변환 기능은 유료 플랜에서만 이용 가능합니다.',
        requiresUpgrade: true,
        upgradePlan: 'personal',
      };
    }

    // 무료 플랜은 3단계까지만 (PLAN, STRUCTURE, DRAFT)
    if (plan === 'free' && (step === 'QUALITY' || step === 'PLATFORM')) {
      return {
        allowed: false,
        reason: '품질 개선(4단계) 및 플랫폼 변환(5단계)은 유료 플랜에서만 이용 가능합니다.',
        requiresUpgrade: true,
        upgradePlan: 'personal',
      };
    }

    return { allowed: true };
  }

  /**
   * AI 단계 접근 확인 (간단한 버전)
   */
  canAccessAIStep(userPlan: PlanType, stepType: 'PLAN' | 'STRUCTURE' | 'DRAFT' | 'QUALITY' | 'PLATFORM'): boolean {
    const planFeatures = PRICING_PLANS[userPlan].features.contentCreation;
    const stepOrder: ('PLAN' | 'STRUCTURE' | 'DRAFT' | 'QUALITY' | 'PLATFORM')[] = ['PLAN', 'STRUCTURE', 'DRAFT', 'QUALITY', 'PLATFORM'];
    const stepIndex = stepOrder.indexOf(stepType);
    const maxAllowedStepIndex = planFeatures.maxStepsPerProject - 1;

    // 플랫폼 변환은 별도 확인
    if (stepType === 'PLATFORM' && !planFeatures.platformConversion) {
      return false;
    }

    return stepIndex <= maxAllowedStepIndex;
  }

  /**
   * 프로젝트 생성 제한 확인
   */
  checkProjectCreationLimit(userId: string, currentProjectCount: number): {
    allowed: boolean;
    reason?: string;
    requiresUpgrade?: boolean;
    upgradePlan?: PlanType;
  } {
    const { plan } = paymentService.getActivePlan(userId);
    const maxProjects = PRICING_PLANS[plan].features.contentCreation.maxProjects;

    if (maxProjects === -1) {
      return { allowed: true }; // 무제한
    }

    if (currentProjectCount >= maxProjects) {
      return {
        allowed: false,
        reason: `프로젝트 생성 한도를 초과했습니다. (현재: ${currentProjectCount}/${maxProjects})`,
        requiresUpgrade: true,
        upgradePlan: plan === 'free' ? 'personal' : 'pro',
      };
    }

    return { allowed: true };
  }

  /**
   * 관리자 도구 접근 확인
   */
  checkAdminToolAccess(
    userId: string,
    tool: 'electronicSignature' | 'systemDiagnostics' | 'debugTools' | 'siteCheck' | 'remoteSolution'
  ): {
    allowed: boolean;
    reason?: string;
    requiresUpgrade?: boolean;
    upgradePlan?: PlanType;
    remainingUsage?: number;
    maxUsage?: number;
  } {
    // TODO: 실제 사용자 플랜 가져오기 (데이터베이스 또는 세션에서)
    // 임시로 userService를 사용
    const user = userService.getUserById(userId);
    if (!user) {
      return {
        allowed: false,
        reason: '사용자를 찾을 수 없습니다.',
      };
    }
    const plan = user.plan;
    const planFeatures = PRICING_PLANS[plan].features.adminTools;

    // 무료 플랜은 모든 관리자 도구 접근 불가
    if (plan === 'free') {
      return {
        allowed: false,
        reason: '관리자 도구는 유료 플랜에서만 이용 가능합니다.',
        requiresUpgrade: true,
        upgradePlan: 'personal',
      };
    }

    // 디버그 도구는 프로 플랜 이상만
    if (tool === 'debugTools' && !planFeatures.debugTools) {
      return {
        allowed: false,
        reason: '디버그 도구는 프로 플랜 이상에서만 이용 가능합니다.',
        requiresUpgrade: true,
        upgradePlan: 'pro',
      };
    }

    // 각 도구별 접근 확인
    switch (tool) {
      case 'electronicSignature':
        if (!planFeatures.electronicSignature) {
          return {
            allowed: false,
            reason: '전자결재 기능은 유료 플랜에서만 이용 가능합니다.',
            requiresUpgrade: true,
            upgradePlan: 'personal',
          };
        }
        break;

      case 'systemDiagnostics':
        if (!planFeatures.systemDiagnostics) {
          return {
            allowed: false,
            reason: '시스템 진단 기능은 유료 플랜에서만 이용 가능합니다.',
            requiresUpgrade: true,
            upgradePlan: 'personal',
          };
        }
        // TODO: 사용량 추적 구현
        break;

      case 'siteCheck':
        if (!planFeatures.siteCheck) {
          return {
            allowed: false,
            reason: '사이트 검사 기능은 유료 플랜에서만 이용 가능합니다.',
            requiresUpgrade: true,
            upgradePlan: 'personal',
          };
        }
        // TODO: 사용량 추적 구현
        break;

      case 'remoteSolution':
        if (!planFeatures.remoteSolution) {
          return {
            allowed: false,
            reason: '원격 솔루션 기능은 유료 플랜에서만 이용 가능합니다.',
            requiresUpgrade: true,
            upgradePlan: 'personal',
          };
        }
        // TODO: 사용량 추적 구현
        break;
    }

    return { allowed: true };
  }

  /**
   * API 호출 제한 확인
   */
  checkAPICallLimit(userId: string, currentAPICalls: number): {
    allowed: boolean;
    reason?: string;
    requiresUpgrade?: boolean;
    upgradePlan?: PlanType;
  } {
    const { plan } = paymentService.getActivePlan(userId);
    const maxAPICalls = PRICING_PLANS[plan].limits.apiCallsPerMonth;

    if (maxAPICalls === -1) {
      return { allowed: true }; // 무제한
    }

    if (currentAPICalls >= maxAPICalls) {
      return {
        allowed: false,
        reason: `월간 API 호출 한도를 초과했습니다. (현재: ${currentAPICalls}/${maxAPICalls})`,
        requiresUpgrade: true,
        upgradePlan: plan === 'free' ? 'personal' : plan === 'personal' ? 'pro' : 'enterprise',
      };
    }

    return { allowed: true };
  }

  /**
   * AI 생성 제한 확인
   */
  checkAIGenerationLimit(userId: string, currentGenerations: number): {
    allowed: boolean;
    reason?: string;
    requiresUpgrade?: boolean;
    upgradePlan?: PlanType;
  } {
    const { plan } = paymentService.getActivePlan(userId);
    const maxGenerations = PRICING_PLANS[plan].limits.aiGenerationsPerMonth;

    if (maxGenerations === -1) {
      return { allowed: true }; // 무제한
    }

    if (currentGenerations >= maxGenerations) {
      return {
        allowed: false,
        reason: `월간 AI 생성 한도를 초과했습니다. (현재: ${currentGenerations}/${maxGenerations})`,
        requiresUpgrade: true,
        upgradePlan: plan === 'free' ? 'personal' : plan === 'personal' ? 'pro' : 'enterprise',
      };
    }

    return { allowed: true };
  }
}

export const planLimitService = new PlanLimitService();

