import { NextRequest, NextResponse } from 'next/server';
import { aiComparison, AIProvider, AVAILABLE_AIS } from '@/lib/ai-comparison';

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

    // 우리 AI에게 다른 AI들의 답변을 학습시키기
    try {
      const { aiKnowledgeBase } = await import('@/lib/ai-knowledge-base');
      
      // 다른 AI들의 답변을 정리
      const otherAIResponses: Array<{ aiName: string; response: string }> = [];
      const ourResponse = comparison.responses?.our?.response;
      
      Object.entries(comparison.responses || {}).forEach(([aiId, response]: [string, any]) => {
        if (aiId !== 'our' && response?.response) {
          const aiInfo = AVAILABLE_AIS.find(a => a.id === aiId);
          const aiName = aiInfo?.name || aiId;
          otherAIResponses.push({ aiName, response: response.response });
        }
      });

      if (otherAIResponses.length > 0) {
        // learnFromAIComparison 메서드 사용
        aiKnowledgeBase.learnFromAIComparison(prompt, otherAIResponses, ourResponse);

        console.log('[AI Comparison] ✅ 우리 AI에게 다른 AI들의 답변을 학습시켰습니다:', {
          prompt: prompt.substring(0, 50),
          otherAIResponsesCount: otherAIResponses.length,
          learnedAIs: otherAIResponses.map(r => r.aiName),
        });
      }
    } catch (error) {
      console.warn('[AI Comparison] 학습 저장 실패:', error);
      // 학습 실패해도 비교 결과는 반환
    }

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

