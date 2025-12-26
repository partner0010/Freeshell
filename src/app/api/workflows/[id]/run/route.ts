/**
 * 워크플로우 실행 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowManager } from '@/lib/automation/workflow-manager';
import * as workflowDB from '@/lib/automation/workflow-db';

export const runtime = 'nodejs';

// 워크플로우 실행
export async function POST(
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
    const body = await request.json();
    const input = body.input || {};
    
    // DB에서 워크플로우 조회 시도
    let workflow: any;
    let result: any;
    
    try {
      workflow = await workflowDB.getWorkflowFromDB(id);
      
      if (!workflow) {
        // 폴백: 메모리 매니저에서 조회
        workflow = await workflowManager.getWorkflow(id);
      }
      
      if (!workflow) {
        return NextResponse.json(
          { error: '워크플로우를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (workflow.status !== 'active') {
        return NextResponse.json(
          { error: '워크플로우가 활성화되지 않았습니다.' },
          { status: 400 }
        );
      }

      // 메모리 매니저로 실행 (실행 로직은 메모리 매니저에 있음)
      result = await workflowManager.runWorkflow(id, input);
      
      // DB 업데이트
      await workflowDB.updateWorkflowInDB(id, {
        lastRun: new Date(),
        runCount: (workflow.runCount || 0) + 1,
      });
      
      // 실시간 이벤트 전송
      const { eventStreamManager } = await import('@/lib/realtime/event-stream');
      eventStreamManager.workflowEvent('executed', { id, result });
    } catch (dbError) {
      console.warn('DB 조회/업데이트 실패, 메모리 매니저로 폴백:', dbError);
      
      // 폴백: 메모리 매니저 사용
      workflow = await workflowManager.getWorkflow(id);
      
      if (!workflow) {
        return NextResponse.json(
          { error: '워크플로우를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (workflow.status !== 'active') {
        return NextResponse.json(
          { error: '워크플로우가 활성화되지 않았습니다.' },
          { status: 400 }
        );
      }
      
      result = await workflowManager.runWorkflow(id, input);
    }
    
    return NextResponse.json({
      success: true,
      message: '워크플로우가 성공적으로 실행되었습니다.',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: '워크플로우 실행 중 오류가 발생했습니다.', 
        detail: error.message 
      },
      { status: 500 }
    );
  }
}

