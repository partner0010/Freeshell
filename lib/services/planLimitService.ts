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

    // 모든 기능 무료 사용 가능
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

    // 모든 단계 무료 사용 가능
    return true;
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
    // 프로젝트 생성 무제한
    return { allowed: true };
  }

  /**
   * 관리자 도구 접근 확인
   */
  async checkAdminToolAccess(
    userId: string,
    tool: 'electronicSignature' | 'systemDiagnostics' | 'debugTools' | 'siteCheck' | 'remoteSolution'
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiresUpgrade?: boolean;
    upgradePlan?: PlanType;
    remainingUsage?: number;
    maxUsage?: number;
  }> {
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

    // 모든 관리자 도구 무료 사용 가능

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
        // 사용량 추적
        if (plan === 'personal') {
          const { usageTracker } = await import('./usageTracker');
          const currentCount = await usageTracker.getUsage(userId, 'system-diagnostics', 'monthly');
          const maxUsage = 10; // 개인 플랜: 월 10회
          if (currentCount >= maxUsage) {
            return {
              allowed: false,
              reason: `월 사용량 한도에 도달했습니다. (${currentCount}/${maxUsage}회)`,
              requiresUpgrade: true,
              upgradePlan: 'pro',
              remainingUsage: 0,
              maxUsage,
            };
          }
        }
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
        // 사용량 추적
        if (plan === 'personal') {
          const { usageTracker } = await import('./usageTracker');
          const currentCount = await usageTracker.getUsage(userId, 'site-check', 'monthly');
          const maxUsage = 10; // 개인 플랜: 월 10회
          if (currentCount >= maxUsage) {
            return {
              allowed: false,
              reason: `월 사용량 한도에 도달했습니다. (${currentCount}/${maxUsage}회)`,
              requiresUpgrade: true,
              upgradePlan: 'pro',
              remainingUsage: 0,
              maxUsage,
            };
          }
        }
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
        // 사용량 추적
        if (plan === 'personal') {
          const { usageTracker } = await import('./usageTracker');
          const currentCount = await usageTracker.getUsage(userId, 'remote-solution', 'monthly');
          const maxUsage = 5; // 개인 플랜: 월 5회
          if (currentCount >= maxUsage) {
            return {
              allowed: false,
              reason: `월 사용량 한도에 도달했습니다. (${currentCount}/${maxUsage}회)`,
              requiresUpgrade: true,
              upgradePlan: 'pro',
              remainingUsage: 0,
              maxUsage,
            };
          }
        }
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

