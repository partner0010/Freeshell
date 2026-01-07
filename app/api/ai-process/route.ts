import { NextRequest, NextResponse } from 'next/server';
import { processTracker } from '@/lib/ai-process-tracker';

/**
 * AI 처리 과정 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const processId = searchParams.get('id');

    if (processId) {
      const process = processTracker.getProcess(processId);
      if (!process) {
        return NextResponse.json(
          { error: '처리 과정을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, process });
    }

    // 모든 처리 과정 반환
    const processes = processTracker.getAllProcesses();
    return NextResponse.json({ success: true, processes });
  } catch (error: any) {
    return NextResponse.json(
      { error: '처리 과정 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

