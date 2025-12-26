/**
 * 워크플로우 개별 관리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowManager } from '@/lib/automation/workflow-manager';
import * as workflowDB from '@/lib/automation/workflow-db';

export const runtime = 'nodejs';

// 워크플로우 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // DB에서 먼저 조회 시도
    try {
      const workflow = await workflowDB.getWorkflowFromDB(id);
      if (workflow) {
        return NextResponse.json({ success: true, data: workflow });
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

    const workflow = workflowManager.getWorkflow(id);
    
    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: workflow });
  } catch (error: any) {
    return NextResponse.json(
      { error: '워크플로우 조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 워크플로우 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // DB 업데이트 시도
    try {
      const existing = await workflowDB.getWorkflowFromDB(id);
      if (!existing) {
        return NextResponse.json(
          { error: '워크플로우를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      const updates: any = {};
      if (body.status !== undefined) {
        // 상태 토글
        updates.status = body.status === 'active' ? 'paused' : 'active';
      }
      if (body.name !== undefined) updates.name = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.steps !== undefined) updates.steps = body.steps;
      
      const updated = await workflowDB.updateWorkflowInDB(id, updates);
      if (updated) {
        // 실시간 이벤트 전송
        const { eventStreamManager } = await import('@/lib/realtime/event-stream');
        eventStreamManager.workflowEvent('updated', updated);
        
        return NextResponse.json({ success: true, data: updated });
      }
    } catch (dbError) {
      console.warn('DB 업데이트 실패, 메모리 매니저로 폴백:', dbError);
    }
    
    // 폴백: 메모리 매니저 사용
    if (!workflowManager) {
      return NextResponse.json(
        { error: '워크플로우 관리자를 사용할 수 없습니다.' },
        { status: 503 }
      );
    }

    const workflow = workflowManager.getWorkflow(id);
    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 상태 토글
    if (body.status !== undefined) {
      if (body.status === 'active' || body.status === 'paused') {
        workflowManager.toggleWorkflow(id);
      }
    }
    
    // 기타 업데이트
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.steps !== undefined) updates.steps = body.steps;
    
    if (Object.keys(updates).length > 0) {
      workflowManager.updateWorkflow(id, updates);
    }
    
    const updated = workflowManager.getWorkflow(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: '워크플로우 업데이트 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 워크플로우 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!workflowManager) {
      return NextResponse.json(
        { error: '워크플로우 관리자를 사용할 수 없습니다.' },
        { status: 503 }
      );
    }

    const { id } = params;
    
    const workflow = workflowManager.getWorkflow(id);
    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    workflowManager.deleteWorkflow(id);
    return NextResponse.json({ success: true, message: '워크플로우가 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: '워크플로우 삭제 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

