/**
 * 스케줄 유틸리티 함수
 */

import type { ScheduleConfig } from './scheduler';

/**
 * 다음 실행 시간 계산
 */
export function calculateNextRun(config: ScheduleConfig): Date {
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
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
  }

  return next;
}

