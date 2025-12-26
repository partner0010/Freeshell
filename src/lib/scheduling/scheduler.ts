/**
 * 콘텐츠 자동 생성 스케줄러
 */

export interface ScheduleConfig {
  topic: string;
  contentType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time?: string; // HH:MM 형식
  dayOfWeek?: number; // 0-6 (일-토)
  dayOfMonth?: number; // 1-31
  multilingual?: boolean;
  languages?: string[];
  options?: any;
}

export interface ScheduledJob {
  id: string;
  config: ScheduleConfig;
  nextRun: Date;
  lastRun?: Date;
  status: 'active' | 'paused' | 'completed';
  runCount: number;
}

/**
 * 스케줄 관리
 */
export class ContentScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();

  /**
   * 스케줄 추가
   */
  addSchedule(config: ScheduleConfig): ScheduledJob {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nextRun = this.calculateNextRun(config);

    const job: ScheduledJob = {
      id,
      config,
      nextRun,
      status: 'active',
      runCount: 0,
    };

    this.jobs.set(id, job);
    return job;
  }

  /**
   * 다음 실행 시간 계산
   */
  private calculateNextRun(config: ScheduleConfig): Date {
    const now = new Date();
    const next = new Date(now);

    switch (config.frequency) {
      case 'daily':
        if (config.time) {
          const [hours, minutes] = config.time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
          if (next <= now) {
            next.setDate(next.getDate() + 1);
          }
        } else {
          next.setDate(next.getDate() + 1);
          next.setHours(9, 0, 0, 0);
        }
        break;

      case 'weekly':
        if (config.dayOfWeek !== undefined) {
          const daysUntilNext = (config.dayOfWeek - now.getDay() + 7) % 7 || 7;
          next.setDate(now.getDate() + daysUntilNext);
          if (config.time) {
            const [hours, minutes] = config.time.split(':').map(Number);
            next.setHours(hours, minutes, 0, 0);
          } else {
            next.setHours(9, 0, 0, 0);
          }
        } else {
          next.setDate(now.getDate() + 7);
          next.setHours(9, 0, 0, 0);
        }
        break;

      case 'monthly':
        if (config.dayOfMonth !== undefined) {
          next.setMonth(now.getMonth() + 1);
          next.setDate(config.dayOfMonth);
          if (config.time) {
            const [hours, minutes] = config.time.split(':').map(Number);
            next.setHours(hours, minutes, 0, 0);
          } else {
            next.setHours(9, 0, 0, 0);
          }
        } else {
          next.setMonth(now.getMonth() + 1);
          next.setDate(1);
          next.setHours(9, 0, 0, 0);
        }
        break;

      default:
        next.setDate(now.getDate() + 1);
        next.setHours(9, 0, 0, 0);
    }

    return next;
  }

  /**
   * 스케줄 조회
   */
  getSchedule(id: string): ScheduledJob | undefined {
    return this.jobs.get(id);
  }

  /**
   * 모든 스케줄 조회
   */
  getAllSchedules(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * 스케줄 업데이트
   */
  updateSchedule(id: string, updates: Partial<ScheduleConfig>): ScheduledJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    job.config = { ...job.config, ...updates };
    job.nextRun = this.calculateNextRun(job.config);
    this.jobs.set(id, job);

    return job;
  }

  /**
   * 스케줄 삭제
   */
  deleteSchedule(id: string): boolean {
    return this.jobs.delete(id);
  }

  /**
   * 스케줄 일시정지/재개
   */
  toggleSchedule(id: string): ScheduledJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    job.status = job.status === 'active' ? 'paused' : 'active';
    this.jobs.set(id, job);

    return job;
  }

  /**
   * 스케줄 일시정지
   */
  pauseSchedule(id: string): ScheduledJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    job.status = 'paused';
    this.jobs.set(id, job);

    return job;
  }

  /**
   * 스케줄 재개
   */
  resumeSchedule(id: string): ScheduledJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    job.status = 'active';
    this.jobs.set(id, job);

    return job;
  }

  /**
   * 스케줄 삭제
   */
  removeSchedule(id: string): boolean {
    return this.jobs.delete(id);
  }

  /**
   * 실행할 작업 조회
   */
  getDueJobs(): ScheduledJob[] {
    const now = new Date();
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === 'active' && job.nextRun <= now
    );
  }

  /**
   * 작업 실행 완료 처리
   */
  markJobCompleted(id: string): ScheduledJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    job.lastRun = new Date();
    job.runCount += 1;
    job.nextRun = this.calculateNextRun(job.config);
    this.jobs.set(id, job);

    return job;
  }
}

export const contentScheduler = new ContentScheduler();

