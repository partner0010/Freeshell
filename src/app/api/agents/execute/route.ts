/**
 * 에이전트 작업 실행 API
 * 실제 에이전트 작업을 실행하고 결과를 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentManager } from '@/lib/ai/agents';

export const runtime = 'nodejs';

// 에이전트 작업 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, task, type, input } = body;

    if (!agentId || !task) {
      return NextResponse.json(
        { error: 'agentId와 task가 필요합니다.' },
        { status: 400 }
      );
    }

    // 작업 생성
    const agentTask = agentManager.createTask({
      agentId,
      type: type || 'generate',
      input: { task, ...input },
    });

    // 작업 실행
    const result = await agentManager.executeTask(agentTask.id);

    return NextResponse.json({
      success: true,
      message: '작업이 성공적으로 실행되었습니다.',
      data: {
        taskId: agentTask.id,
        result,
        status: agentTask.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '작업 실행 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 에이전트 작업 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId가 필요합니다.' },
        { status: 400 }
      );
    }

    const task = agentManager.getTask(taskId);
    if (!task) {
      return NextResponse.json(
        { error: '작업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '작업 조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

