/**
 * 자율 AI 에이전트 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { autonomousAgentSystem } from '@/lib/ai/autonomous-agent';
import { eventStreamManager } from '@/lib/realtime/event-stream';

export const runtime = 'nodejs';

// 자율 작업 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, context, constraints } = body;

    if (!goal) {
      return NextResponse.json(
        { error: 'goal이 필요합니다.' },
        { status: 400 }
      );
    }

    const task = autonomousAgentSystem.createTask(goal, context, constraints);

    // 실시간 이벤트 전송
    eventStreamManager.taskEvent('created', task);

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    return NextResponse.json(
      { error: '작업 생성 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 작업 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const task = autonomousAgentSystem.getTask(id);
      if (!task) {
        return NextResponse.json(
          { error: '작업을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: task });
    }

    const allTasks = autonomousAgentSystem.getAllTasks();
    return NextResponse.json({ success: true, data: allTasks });
  } catch (error: any) {
    return NextResponse.json(
      { error: '작업 조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

