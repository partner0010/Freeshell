/**
 * 사용량 추적 서비스
 */
import { userService } from './userService';

interface UsageRecord {
  userId: string;
  feature: string;
  count: number;
  period: 'daily' | 'monthly';
  resetAt: Date;
}

// 메모리 기반 사용량 저장 (실제로는 데이터베이스 사용 권장)
const usageStorage: Map<string, UsageRecord> = new Map();

class UsageTracker {
  /**
   * 사용량 키 생성
   */
  private getUsageKey(userId: string, feature: string, period: 'daily' | 'monthly'): string {
    const now = new Date();
    let resetAt: Date;

    if (period === 'daily') {
      resetAt = new Date(now);
      resetAt.setHours(23, 59, 59, 999);
    } else {
      resetAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return `${userId}:${feature}:${period}:${resetAt.getTime()}`;
  }

  /**
   * 사용량 기록
   */
  async recordUsage(
    userId: string,
    feature: string,
    amount: number = 1,
    period: 'daily' | 'monthly' = 'monthly'
  ): Promise<void> {
    const key = this.getUsageKey(userId, feature, period);
    const existing = usageStorage.get(key);

    if (existing) {
      // 기간이 지났는지 확인
      if (new Date() > existing.resetAt) {
        // 새 기간 시작
        usageStorage.set(key, {
          userId,
          feature,
          count: amount,
          period,
          resetAt: this.getResetDate(period),
        });
      } else {
        // 기존 기록 업데이트
        existing.count += amount;
        usageStorage.set(key, existing);
      }
    } else {
      // 새 기록 생성
      usageStorage.set(key, {
        userId,
        feature,
        count: amount,
        period,
        resetAt: this.getResetDate(period),
      });
    }
  }

  /**
   * 사용량 조회
   */
  async getUsage(
    userId: string,
    feature: string,
    period: 'daily' | 'monthly' = 'monthly'
  ): Promise<number> {
    const key = this.getUsageKey(userId, feature, period);
    const record = usageStorage.get(key);

    if (!record) {
      return 0;
    }

    // 기간이 지났는지 확인
    if (new Date() > record.resetAt) {
      return 0;
    }

    return record.count;
  }

  /**
   * 리셋 날짜 계산
   */
  private getResetDate(period: 'daily' | 'monthly'): Date {
    const now = new Date();

    if (period === 'daily') {
      const resetAt = new Date(now);
      resetAt.setHours(23, 59, 59, 999);
      return resetAt;
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
  }

  /**
   * 사용량 초기화 (테스트용)
   */
  async resetUsage(userId: string, feature?: string): Promise<void> {
    if (feature) {
      const keys = Array.from(usageStorage.keys()).filter(key => key.startsWith(`${userId}:${feature}:`));
      keys.forEach(key => usageStorage.delete(key));
    } else {
      const keys = Array.from(usageStorage.keys()).filter(key => key.startsWith(`${userId}:`));
      keys.forEach(key => usageStorage.delete(key));
    }
  }
}

export const usageTracker = new UsageTracker();
export default usageTracker;
