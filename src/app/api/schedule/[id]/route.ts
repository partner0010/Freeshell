/**
 * 스케줄 개별 관리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentScheduler } from '@/lib/scheduling/scheduler';

export const runtime = 'nodejs';

// 스케줄 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const job = contentScheduler.getSchedule(id);
    
    if (!job) {
      return NextResponse.json(
        { error: '스케줄을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json(
      { error: '스케줄 조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 스케줄 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const job = contentScheduler.getSchedule(id);
    if (!job) {
      return NextResponse.json(
        { error: '스케줄을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 스케줄 업데이트
    if (body.status !== undefined) {
      if (body.status === 'active') {
        contentScheduler.resumeSchedule(id);
      } else if (body.status === 'paused') {
        contentScheduler.pauseSchedule(id);
      }
    }
    
    const updated = contentScheduler.getSchedule(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: '스케줄 업데이트 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 스케줄 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const job = contentScheduler.getSchedule(id);
    if (!job) {
      return NextResponse.json(
        { error: '스케줄을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    contentScheduler.removeSchedule(id);
    return NextResponse.json({ success: true, message: '스케줄이 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: '스케줄 삭제 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

