/**
 * 워크플로우 관리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowManager, type Workflow, type WorkflowStep } from '@/lib/automation/workflow-manager';
import * as workflowDB from '@/lib/automation/workflow-db';

export const runtime = 'nodejs';

// 워크플로우 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // DB에서 먼저 조회 시도
    try {
      if (id) {
        const workflow = await workflowDB.getWorkflowFromDB(id);
        if (workflow) {
          return NextResponse.json({ success: true, data: workflow });
        }
      } else {
        const workflows = await workflowDB.getAllWorkflowsFromDB();
        if (workflows.length > 0) {
          return NextResponse.json({ success: true, data: workflows });
        }
      }
    } catch (dbError) {
      console.warn('DB 조회 실패, 메모리 매니저로 폴백:', dbError);
    }

    // 폴백: 메모리 매니저 사용
    if (!workflowManager) {
      return NextResponse.json(
        { error: '워크플로우 관리자를 사용할 수 없습니다.' },
        { status: 503 }
      );
    }

    if (id) {
      const workflow = workflowManager.getWorkflow(id);
      if (!workflow) {
        return NextResponse.json(
          { error: '워크플로우를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: workflow });
    }

    const allWorkflows = workflowManager.getAllWorkflows();
    return NextResponse.json({ success: true, data: allWorkflows });
  } catch (error: any) {
    return NextResponse.json(
      { error: '워크플로우 조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 워크플로우 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, steps } = body;

    if (!name || !steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: 'name과 steps 배열이 필요합니다.' },
        { status: 400 }
      );
    }

    // DB에 저장 시도
    try {
      const workflow = await workflowDB.createWorkflowInDB(name, description || '', steps);
      
      // 실시간 이벤트 전송
      const { eventStreamManager } = await import('@/lib/realtime/event-stream');
      eventStreamManager.workflowEvent('created', workflow);
      
      return NextResponse.json({ success: true, data: workflow });
    } catch (dbError) {
      console.warn('DB 저장 실패, 메모리 매니저로 폴백:', dbError);
      
      // 폴백: 메모리 매니저 사용
      if (!workflowManager) {
        return NextResponse.json(
          { error: '워크플로우 관리자를 사용할 수 없습니다.' },
          { status: 503 }
        );
      }
      
      const workflow = workflowManager.createWorkflow(name, description || '', steps);
      return NextResponse.json({ success: true, data: workflow });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: '워크플로우 생성 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 워크플로우 업데이트
export async function PUT(request: NextRequest) {
  try {
    if (!workflowManager) {
      return NextResponse.json(
        { error: '워크플로우 관리자를 사용할 수 없습니다.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
    }

    const workflow = workflowManager.updateWorkflow(id, updates);
    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: workflow });
  } catch (error: any) {
    return NextResponse.json(
      { error: '워크플로우 업데이트 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 워크플로우 삭제
export async function DELETE(request: NextRequest) {
  try {
    if (!workflowManager) {
      return NextResponse.json(
        { error: '워크플로우 관리자를 사용할 수 없습니다.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
    }

    const deleted = workflowManager.deleteWorkflow(id);
    if (!deleted) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '워크플로우가 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: '워크플로우 삭제 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

