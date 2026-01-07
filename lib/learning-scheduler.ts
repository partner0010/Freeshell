/**
 * 학습 스케줄러
 * 매일 자동으로 학습을 실행
 */

import { autoLearningSystem } from './auto-learning-system';

export class LearningScheduler {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * 스케줄러 시작
   */
  start(): void {
    if (this.intervalId) {
      console.log('[LearningScheduler] 이미 실행 중입니다.');
      return;
    }

    console.log('[LearningScheduler] 스케줄러 시작');

    // 매일 체크 (1시간마다)
    this.intervalId = setInterval(() => {
      this.checkAndRun();
    }, 60 * 60 * 1000); // 1시간마다

    // 즉시 한 번 실행
    this.checkAndRun();
  }

  /**
   * 스케줄 확인 및 실행
   */
  private async checkAndRun(): Promise<void> {
    const schedule = autoLearningSystem.getSchedule();

    if (!schedule.enabled) {
      console.log('[LearningScheduler] 스케줄이 비활성화되어 있습니다.');
      return;
    }

    if (autoLearningSystem.isLearning()) {
      console.log('[LearningScheduler] 이미 학습 중입니다.');
      return;
    }

    const now = new Date();
    const [scheduleHour, scheduleMinute] = schedule.startTime.split(':').map(Number);
    const scheduleTime = new Date();
    scheduleTime.setHours(scheduleHour, scheduleMinute, 0, 0);

    // 스케줄 시간 확인
    const timeDiff = now.getTime() - scheduleTime.getTime();
    const isScheduledTime = timeDiff >= 0 && timeDiff < 60 * 60 * 1000; // 1시간 내

    if (isScheduledTime || process.env.FORCE_LEARNING === 'true') {
      console.log('[LearningScheduler] 자동 학습 시작');
      
      // 비동기로 학습 실행 (블로킹하지 않음)
      autoLearningSystem.startAutoLearning(schedule.duration).catch(error => {
        console.error('[LearningScheduler] 학습 오류:', error);
      });
    }
  }

  /**
   * 스케줄러 중지
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[LearningScheduler] 스케줄러 중지');
    }
  }
}

export const learningScheduler = new LearningScheduler();

// 서버 시작 시 스케줄러 자동 시작
if (typeof global !== 'undefined' && process.env.NODE_ENV !== 'development') {
  learningScheduler.start();
}

