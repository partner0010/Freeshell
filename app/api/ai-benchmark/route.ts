import { NextRequest, NextResponse } from 'next/server';
import { aiBenchmark } from '@/lib/ai-benchmark';

/**
 * AI 벤치마크 및 비교 API
 */
export async function GET(request: NextRequest) {
  try {
    const comparison = await aiBenchmark.compareWithOtherAIs();

    return NextResponse.json({
      success: true,
      comparison,
      message: 'AI 벤치마크 및 비교가 완료되었습니다.',
    });
  } catch (error: any) {
    console.error('[AI Benchmark] 오류:', error);
    return NextResponse.json(
      {
        error: 'AI 벤치마크 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

