import { NextRequest, NextResponse } from 'next/server';
import { aiComparison } from '@/lib/ai-comparison';

/**
 * AI 비교 분석 API
 * Cursor AI와 우리 AI를 비교하여 차이점과 강점 분석
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // AI 비교 분석
    const comparison = await aiComparison.compareWithCursor(prompt);

    return NextResponse.json({
      success: true,
      comparison,
      message: 'AI 비교 분석이 완료되었습니다.',
    });
  } catch (error: any) {
    console.error('[AI Comparison] 오류:', error);
    return NextResponse.json(
      {
        error: 'AI 비교 분석 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

