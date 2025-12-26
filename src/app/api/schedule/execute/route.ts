/**
 * 스케줄 실행 API
 * 예약된 작업을 수동 또는 자동으로 실행
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentScheduler } from '@/lib/scheduling/scheduler';
import { agentManager } from '@/lib/ai/agents';
import * as scheduleDB from '@/lib/scheduling/schedule-db';
import { calculateNextRun } from '@/lib/scheduling/schedule-utils';

export const runtime = 'nodejs';

// 스케줄 실행 (수동)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'scheduleId가 필요합니다.' },
        { status: 400 }
      );
    }

    const job = contentScheduler.getSchedule(scheduleId);
    if (!job) {
      return NextResponse.json(
        { error: '스케줄을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { error: '스케줄이 활성화되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 스케줄 실행
    const result = await executeScheduleJob(job);
    
    // 실행 완료 처리 (다음 실행 시간 계산)
    try {
      // DB 업데이트 시도
      const nextRun = calculateNextRun(job.config);
      await scheduleDB.updateScheduleInDB(scheduleId, {
        lastRun: new Date(),
        nextRun,
        runCount: job.runCount + 1,
      });
    } catch (dbError) {
      console.warn('DB 업데이트 실패, 메모리 스케줄러로 폴백:', dbError);
      contentScheduler.markJobCompleted(scheduleId);
    }
    
    // 알림 생성 (실제로는 알림 시스템에 추가)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'success',
          title: '스케줄 실행 완료',
          message: `${job.config.topic} 스케줄이 성공적으로 실행되었습니다.`,
        }),
      });
    } catch (error) {
      console.warn('알림 생성 실패:', error);
    }

    return NextResponse.json({
      success: true,
      message: '스케줄이 성공적으로 실행되었습니다.',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '스케줄 실행 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 스케줄 실행 함수
async function executeScheduleJob(job: any): Promise<any> {
  const { config } = job;
  
  try {
    // 콘텐츠 생성 API 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: config.topic,
        contentType: config.contentType,
        multilingual: config.multilingual || false,
        languages: config.languages || ['ko'],
        options: config.options || {},
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        content: data.content,
        metadata: data.metadata,
      };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || '콘텐츠 생성 실패');
    }
  } catch (error: any) {
    console.error('스케줄 실행 오류:', error);
    throw error;
  }
}

// 자동 실행 (cron job용)
export async function GET(request: NextRequest) {
  try {
    // 실행할 스케줄 조회 (DB 우선)
    let dueJobs: any[] = [];
    try {
      dueJobs = await scheduleDB.getDueSchedulesFromDB();
    } catch (dbError) {
      console.warn('DB 조회 실패, 메모리 스케줄러로 폴백:', dbError);
      dueJobs = contentScheduler.getDueJobs();
    }
    
    if (dueJobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: '실행할 스케줄이 없습니다.',
        executed: 0,
      });
    }

    const results = [];
    for (const job of dueJobs) {
      try {
        const result = await executeScheduleJob(job);
        
        // DB 업데이트 시도
        try {
          const nextRun = calculateNextRun(job.config);
          await scheduleDB.updateScheduleInDB(job.id, {
            lastRun: new Date(),
            nextRun,
            runCount: job.runCount + 1,
          });
        } catch (dbError) {
          console.warn('DB 업데이트 실패, 메모리 스케줄러로 폴백:', dbError);
          contentScheduler.markJobCompleted(job.id);
        }
        
        results.push({
          scheduleId: job.id,
          success: true,
          result,
        });
      } catch (error: any) {
        results.push({
          scheduleId: job.id,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}개의 스케줄이 실행되었습니다.`,
      executed: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '스케줄 자동 실행 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

