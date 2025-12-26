/**
 * 스케줄 자동 실행 Cron Job
 * 주기적으로 실행할 스케줄을 확인하고 실행
 * 
 * 이 API는 cron job이나 스케줄러에 의해 주기적으로 호출됩니다.
 * 예: Vercel Cron Jobs, GitHub Actions, 또는 외부 cron 서비스
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentScheduler } from '@/lib/scheduling/scheduler';

export const runtime = 'nodejs';

// Cron job 실행
export async function GET(request: NextRequest) {
  try {
    // 인증 확인 (cron job 보안)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 실행할 스케줄 조회
    const dueJobs = contentScheduler.getDueJobs();
    
    if (dueJobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: '실행할 스케줄이 없습니다.',
        executed: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const results = [];
    for (const job of dueJobs) {
      try {
        // 스케줄 실행
        const executeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/schedule/execute`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheduleId: job.id }),
          }
        );

        if (executeResponse.ok) {
          const executeData = await executeResponse.json();
          results.push({
            scheduleId: job.id,
            scheduleName: `${job.config.topic} - ${job.config.contentType}`,
            success: true,
            result: executeData.data,
          });
        } else {
          const errorData = await executeResponse.json();
          results.push({
            scheduleId: job.id,
            scheduleName: `${job.config.topic} - ${job.config.contentType}`,
            success: false,
            error: errorData.error,
          });
        }
      } catch (error: any) {
        results.push({
          scheduleId: job.id,
          scheduleName: `${job.config.topic} - ${job.config.contentType}`,
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
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: '스케줄 자동 실행 중 오류가 발생했습니다.', 
        detail: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

