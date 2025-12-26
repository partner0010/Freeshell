/**
 * 실시간 사용자 활동 추적
 * 사용자 행동 분석 및 실시간 통계
 */

interface ActivityEvent {
  type: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class ActivityTracker {
  private activities: ActivityEvent[] = [];
  private maxActivities = 1000;
  private flushInterval: NodeJS.Timeout | null = null;

  /**
   * 활동 기록
   */
  track(type: string, metadata?: Record<string, any>): void {
    const event: ActivityEvent = {
      type,
      timestamp: Date.now(),
      metadata,
    };

    this.activities.push(event);

    // 최대 개수 제한
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(-this.maxActivities);
    }

    // 주기적으로 서버에 전송
    this.scheduleFlush();
  }

  /**
   * 플러시 스케줄링
   */
  private scheduleFlush(): void {
    if (this.flushInterval) {
      return;
    }

    this.flushInterval = setTimeout(() => {
      this.flush();
    }, 5000); // 5초마다
  }

  /**
   * 활동 데이터 서버 전송
   */
  private async flush(): Promise<void> {
    if (this.activities.length === 0) {
      this.flushInterval = null;
      return;
    }

    const activitiesToSend = [...this.activities];
    this.activities = [];

    try {
      await fetch('/api/analytics/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities: activitiesToSend }),
      });

      this.flushInterval = null;
    } catch (error) {
      // 실패 시 다시 큐에 추가
      this.activities.unshift(...activitiesToSend);
      console.error('활동 추적 전송 실패:', error);
    }
  }

  /**
   * 활동 통계 가져오기
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    recent: ActivityEvent[];
  } {
    const byType: Record<string, number> = {};

    this.activities.forEach((activity) => {
      byType[activity.type] = (byType[activity.type] || 0) + 1;
    });

    return {
      total: this.activities.length,
      byType,
      recent: this.activities.slice(-10),
    };
  }

  /**
   * 정리
   */
  cleanup(): void {
    if (this.flushInterval) {
      clearTimeout(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }
}

// 싱글톤 인스턴스
export const activityTracker = typeof window !== 'undefined' ? new ActivityTracker() : null;

/**
 * React 훅: 활동 추적
 */
export function useActivityTracking(): {
  track: (type: string, metadata?: Record<string, any>) => void;
} {
  const React = require('react');
  const { useCallback } = React;

  const track = useCallback((type: string, metadata?: Record<string, any>) => {
    activityTracker?.track(type, metadata);
  }, []);

  return { track };
}

