/**
 * Payment 서비스
 */
import { paymentStorage } from '@/lib/db/storage';
import { userStorage } from '@/lib/db/storage';
import type { Payment, CreatePaymentInput, PlanType } from '@/lib/models/Payment';
import type { User } from '@/lib/models/User';

export class PaymentService {
  /**
   * 플랜 가격 정보
   */
  private readonly PLAN_PRICES: Record<PlanType, number> = {
    free: 0,
    personal: 9900, // 월 9,900원
    pro: 29900, // 월 29,900원
    enterprise: 99000, // 월 99,000원
  };

  /**
   * 플랜별 제한 사항
   */
  private readonly PLAN_LIMITS = {
    free: {
      maxProjects: 3,
      maxStepsPerProject: 3, // PLAN, STRUCTURE, DRAFT까지만
      platformConversion: false,
    },
    personal: {
      maxProjects: 10,
      maxStepsPerProject: 5, // 모든 단계
      platformConversion: true,
    },
    pro: {
      maxProjects: -1, // 무제한
      maxStepsPerProject: 5,
      platformConversion: true,
    },
    enterprise: {
      maxProjects: -1,
      maxStepsPerProject: 5,
      platformConversion: true,
    },
  };

  /**
   * 결제 생성
   */
  createPayment(input: CreatePaymentInput): Payment {
    return paymentStorage.create({
      ...input,
      status: input.status || 'pending',
    });
  }

  /**
   * 활성 플랜 조회
   */
  getActivePlan(userId: string): { plan: PlanType; payment?: Payment } {
    const user = userStorage.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 활성 결제 확인
    const activePayment = paymentStorage.findActiveByUserId(userId);
    
    if (activePayment) {
      return {
        plan: activePayment.plan,
        payment: activePayment,
      };
    }

    // 활성 결제가 없으면 사용자의 기본 플랜 반환
    return {
      plan: user.plan,
    };
  }

  /**
   * 플랜 제한 확인
   */
  checkPlanLimit(userId: string, limitType: 'maxProjects' | 'maxStepsPerProject' | 'platformConversion'): boolean {
    const { plan } = this.getActivePlan(userId);
    const limit = this.PLAN_LIMITS[plan][limitType];

    if (limitType === 'platformConversion') {
      return limit as boolean;
    }

    if (limitType === 'maxProjects') {
      // 실제 프로젝트 수 확인 필요 (projectService 사용)
      // 여기서는 일단 true 반환
      return true;
    }

    // maxStepsPerProject는 단계별로 확인
    return true;
  }

  /**
   * 플랜 업그레이드 필요 여부 확인
   */
  checkUpgradeRequired(userId: string, stepType: string): boolean {
    const { plan } = this.getActivePlan(userId);

    // 무료 플랜은 3단계까지만 (PLAN, STRUCTURE, DRAFT)
    if (plan === 'free' && (stepType === 'QUALITY' || stepType === 'PLATFORM')) {
      return true;
    }

    return false;
  }

  /**
   * 플랜 가격 조회
   */
  getPlanPrice(plan: PlanType): number {
    return this.PLAN_PRICES[plan];
  }

  /**
   * 결제 정보 조회
   */
  getPaymentById(id: string): Payment | undefined {
    return paymentStorage.findById(id);
  }

  /**
   * 사용자의 결제 내역 조회
   */
  getUserPayments(userId: string): Payment[] {
    return paymentStorage.findByUserId(userId);
  }

  /**
   * 결제 상태 업데이트
   */
  updatePaymentStatus(id: string, status: Payment['status']): Payment | undefined {
    const payment = paymentStorage.update(id, { status });

    // 결제 완료 시 사용자 플랜 업데이트
    if (status === 'completed' && payment) {
      userStorage.update(payment.user_id, { plan: payment.plan });
    }

    return payment;
  }
}

export const paymentService = new PaymentService();

