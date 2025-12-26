/**
 * 스케줄 데이터베이스 저장소
 */

import { prisma } from '@/lib/db';
import type { ScheduleConfig, ScheduledJob } from './scheduler';

/**
 * DB에서 스케줄을 ScheduledJob 타입으로 변환
 */
function dbToSchedule(dbSchedule: any): ScheduledJob {
  return {
    id: dbSchedule.id,
    config: {
      topic: dbSchedule.topic,
      contentType: dbSchedule.contentType,
      frequency: dbSchedule.frequency as 'daily' | 'weekly' | 'monthly' | 'custom',
      time: dbSchedule.time || undefined,
      dayOfWeek: dbSchedule.dayOfWeek || undefined,
      dayOfMonth: dbSchedule.dayOfMonth || undefined,
      multilingual: dbSchedule.multilingual || false,
      languages: (dbSchedule.languages as any) || undefined,
      options: (dbSchedule.options as any) || undefined,
    },
    nextRun: dbSchedule.nextRun,
    lastRun: dbSchedule.lastRun || undefined,
    status: dbSchedule.status as 'active' | 'paused' | 'completed',
    runCount: dbSchedule.runCount || 0,
  };
}

/**
 * 모든 스케줄 조회
 */
export async function getAllSchedulesFromDB(): Promise<ScheduledJob[]> {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return schedules.map(dbToSchedule);
  } catch (error) {
    console.error('스케줄 조회 실패:', error);
    return [];
  }
}

/**
 * 스케줄 조회
 */
export async function getScheduleFromDB(id: string): Promise<ScheduledJob | null> {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });
    return schedule ? dbToSchedule(schedule) : null;
  } catch (error) {
    console.error('스케줄 조회 실패:', error);
    return null;
  }
}

/**
 * 스케줄 생성
 */
export async function createScheduleInDB(
  config: ScheduleConfig,
  nextRun: Date
): Promise<ScheduledJob> {
  try {
    const schedule = await prisma.schedule.create({
      data: {
        topic: config.topic,
        contentType: config.contentType,
        frequency: config.frequency,
        time: config.time,
        dayOfWeek: config.dayOfWeek,
        dayOfMonth: config.dayOfMonth,
        multilingual: config.multilingual || false,
        languages: config.languages as any,
        options: config.options as any,
        nextRun,
        status: 'active',
        runCount: 0,
      },
    });
    return dbToSchedule(schedule);
  } catch (error) {
    console.error('스케줄 생성 실패:', error);
    throw error;
  }
}

/**
 * 스케줄 업데이트
 */
export async function updateScheduleInDB(
  id: string,
  updates: Partial<{
    config: ScheduleConfig;
    nextRun: Date;
    lastRun: Date;
    status: 'active' | 'paused' | 'completed';
    runCount: number;
  }>
): Promise<ScheduledJob | null> {
  try {
    const updateData: any = {};
    if (updates.config !== undefined) {
      updateData.topic = updates.config.topic;
      updateData.contentType = updates.config.contentType;
      updateData.frequency = updates.config.frequency;
      updateData.time = updates.config.time;
      updateData.dayOfWeek = updates.config.dayOfWeek;
      updateData.dayOfMonth = updates.config.dayOfMonth;
      updateData.multilingual = updates.config.multilingual;
      updateData.languages = updates.config.languages as any;
      updateData.options = updates.config.options as any;
    }
    if (updates.nextRun !== undefined) updateData.nextRun = updates.nextRun;
    if (updates.lastRun !== undefined) updateData.lastRun = updates.lastRun;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.runCount !== undefined) updateData.runCount = updates.runCount;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
    });
    return dbToSchedule(schedule);
  } catch (error) {
    console.error('스케줄 업데이트 실패:', error);
    return null;
  }
}

/**
 * 스케줄 삭제
 */
export async function deleteScheduleFromDB(id: string): Promise<boolean> {
  try {
    await prisma.schedule.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('스케줄 삭제 실패:', error);
    return false;
  }
}

/**
 * 실행 예정 스케줄 조회
 */
export async function getDueSchedulesFromDB(): Promise<ScheduledJob[]> {
  try {
    const now = new Date();
    const schedules = await prisma.schedule.findMany({
      where: {
        status: 'active',
        nextRun: { lte: now },
      },
    });
    return schedules.map(dbToSchedule);
  } catch (error) {
    console.error('실행 예정 스케줄 조회 실패:', error);
    return [];
  }
}

