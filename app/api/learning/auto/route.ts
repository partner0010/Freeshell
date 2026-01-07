import { NextRequest, NextResponse } from 'next/server';
import { autoLearningSystem } from '@/lib/auto-learning-system';

/**
 * 자동 학습 API
 * 네트워크를 이용하여 자연스럽게 학습
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { duration = 60, action = 'start' } = body;

    if (action === 'start') {
      // 비동기로 학습 시작 (백그라운드에서 실행)
      autoLearningSystem.startAutoLearning(duration).catch(error => {
        console.error('[Auto Learning API] 학습 오류:', error);
      });

      return NextResponse.json({
        success: true,
        message: `자동 학습이 시작되었습니다. (${duration}분)`,
        duration,
        status: 'started',
      });
    }

    if (action === 'status') {
      const isLearning = autoLearningSystem.isLearning();
      const stats = autoLearningSystem.getStats();
      const schedule = autoLearningSystem.getSchedule();

      return NextResponse.json({
        success: true,
        isLearning,
        stats,
        schedule,
      });
    }

    if (action === 'schedule') {
      const { schedule } = body;
      if (schedule) {
        autoLearningSystem.setSchedule(schedule);
        return NextResponse.json({
          success: true,
          message: '학습 스케줄이 업데이트되었습니다.',
          schedule: autoLearningSystem.getSchedule(),
        });
      }
    }

    return NextResponse.json(
      { error: '알 수 없는 액션입니다.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Auto Learning API] 오류:', error);
    return NextResponse.json(
      { error: '자동 학습 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 학습 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const isLearning = autoLearningSystem.isLearning();
    const stats = autoLearningSystem.getStats();
    const schedule = autoLearningSystem.getSchedule();

    return NextResponse.json({
      success: true,
      isLearning,
      stats,
      schedule,
    });
  } catch (error: any) {
    console.error('[Auto Learning API] 오류:', error);
    return NextResponse.json(
      { error: '학습 상태 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

