import { NextRequest, NextResponse } from 'next/server';
import { aiComparison, AIProvider } from '@/lib/ai-comparison';

/**
 * AI 비교 분석 API
 * 여러 AI들을 비교하여 차이점과 강점 분석
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, selectedAIs } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 선택된 AI들 (기본값: 모든 AI)
    const ais: AIProvider[] = selectedAIs && Array.isArray(selectedAIs) 
      ? selectedAIs.filter((ai: string) => ['chatgpt', 'claude', 'gemini', 'cursor', 'our'].includes(ai)) as AIProvider[]
      : ['chatgpt', 'claude', 'gemini', 'cursor', 'our'];

    // AI 비교 분석
    const comparison = await aiComparison.compareAIs(prompt, ais);

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

