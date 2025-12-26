/**
 * 멀티 에이전트 시스템 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { multiAgentSystem } from '@/lib/ai/multi-agent-system';
import { eventStreamManager } from '@/lib/realtime/event-stream';

export const runtime = 'nodejs';

// 멀티 에이전트 작업 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, coordination } = body;

    if (!goal) {
      return NextResponse.json(
        { error: 'goal이 필요합니다.' },
        { status: 400 }
      );
    }

    const task = multiAgentSystem.createTask(goal, coordination || 'hierarchical');

    // 실시간 이벤트 전송
    eventStreamManager.taskEvent('created', { type: 'multi-agent', ...task });

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
      const task = multiAgentSystem.getTask(id);
      if (!task) {
        return NextResponse.json(
          { error: '작업을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: task });
    }

    const allTasks = multiAgentSystem.getAllTasks();
    return NextResponse.json({ success: true, data: allTasks });
  } catch (error: any) {
    return NextResponse.json(
      { error: '작업 조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

