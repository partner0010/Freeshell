/**
 * 자율 AI 작업 실행 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { autonomousAgentSystem } from '@/lib/ai/autonomous-agent';
import { eventStreamManager } from '@/lib/realtime/event-stream';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const task = autonomousAgentSystem.getTask(id);

    if (!task) {
      return NextResponse.json(
        { error: '작업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비동기로 실행 (백그라운드)
    autonomousAgentSystem.executeTask(id).then((result) => {
      eventStreamManager.taskEvent('completed', { id, result });
      eventStreamManager.notificationEvent(
        `자율 작업 "${task.goal}"이 완료되었습니다.`,
        'success'
      );
    }).catch((error) => {
      eventStreamManager.taskEvent('failed', { id, error: error.message });
      eventStreamManager.notificationEvent(
        `자율 작업 "${task.goal}" 실행 중 오류가 발생했습니다: ${error.message}`,
        'error'
      );
    });

    // 즉시 응답
    return NextResponse.json({
      success: true,
      message: '작업이 시작되었습니다. 실시간 스트림을 통해 진행 상황을 확인할 수 있습니다.',
      data: { taskId: id },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '작업 실행 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

