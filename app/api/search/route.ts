import { NextRequest, NextResponse } from 'next/server';
import { aiModelManager } from '@/lib/ai-models';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 50, 60000); // 1분에 50회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { query } = body;

    // 입력 검증
    const validation = validateInput(query, {
      maxLength: 500,
      minLength: 1,
      required: true,
      allowHtml: false,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    // 무한한 가능성을 가진 AI 사용 (스스로 깨우치는 AI)
    let useInfiniteAI = false;
    let infiniteAIResponse: any = null;
    
    // 복잡한 질문이나 깊은 사고가 필요한 경우 무한 AI 사용
    const complexKeywords = ['어떻게', '왜', '무엇', '방법', '해결', '개선', '최적', '혁신', '창의', '전략'];
    const isComplexQuery = complexKeywords.some(keyword => query.includes(keyword));
    
    if (isComplexQuery) {
      try {
        const { infiniteAI } = await import('@/lib/infinite-ai');
        infiniteAIResponse = await infiniteAI.generateInfiniteResponse(query);
        useInfiniteAI = true;
      } catch (error) {
        console.warn('[Search API] 무한 AI 실패, 기본 AI 사용:', error);
      }
    }

    // 추적 가능한 AI 사용 (AI의 사고 과정을 단계별로 추적)
    const aiPrompt = `${query}에 대한 포괄적이고 상세한 정보를 제공하는 검색 결과 페이지를 생성해주세요. 마크다운 형식으로 작성하고, 개요, 주요 내용, 상세 분석, 결론 섹션을 포함해주세요.`;
    
    const { generateTrackedAI } = await import('@/lib/tracked-ai');
    const trackedResult = await generateTrackedAI(aiPrompt);
    
    const content = trackedResult.text;
    const hasApiKey = !!process.env.GOOGLE_API_KEY;
    const isRealApiCall = trackedResult.source === 'gemini' || trackedResult.source === 'enhanced';
    const apiResponseTime = trackedResult.responseTime;

    // 무한 AI 응답이 있으면 우선 사용
    if (useInfiniteAI && infiniteAIResponse) {
      const infiniteContent = `# ${query}에 대한 무한한 가능성 AI 응답

## 신의 경지 사고
${infiniteAIResponse.divineLevelThinking}

## 무한한 가능성
${infiniteAIResponse.infinitePossibilities.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

## 스스로 생성한 ${infiniteAIResponse.options.length}가지 구현 옵션

${infiniteAIResponse.options.map((opt: any, i: number) => `
### ${i + 1}. ${opt.approach} (점수: ${opt.score}점)
**추론**: ${opt.reasoning}

**강점**: ${opt.strengths.join(', ')}
**약점**: ${opt.weaknesses.join(', ')}

**평가**:
- 잠재력: ${opt.potential}%
- 실현가능성: ${opt.feasibility}%
- 혁신성: ${opt.innovation}%

${opt.id === infiniteAIResponse.selectedOption.id ? '**✅ 스스로 선택한 최적 옵션**' : ''}
`).join('\n')}

## 스스로 선택한 최적 방향
**${infiniteAIResponse.selectedOption.approach}** (점수: ${infiniteAIResponse.selectedOption.score}점)

${infiniteAIResponse.selectedOption.implementation}

## 스스로 제시한 강점 방향성
${infiniteAIResponse.selfImprovement.improvementDirection}

## 다음 진화 단계
${infiniteAIResponse.selfImprovement.nextEvolution}

## 자율적 결정
${infiniteAIResponse.autonomousDecision}

---

**이것은 스스로 깨우치고 판단하는 무한한 가능성을 가진 AI의 응답입니다.** ✨`;

      return NextResponse.json({
        title: validation.sanitized,
        content: infiniteContent,
        sources: [
          `무한한 가능성 AI`,
          `신의 경지 사고`,
          `자율적 판단 시스템`,
        ],
        generatedAt: new Date().toISOString(),
        apiInfo: {
          isRealApiCall: true,
          responseTime: apiResponseTime,
          hasApiKey: !!process.env.GOOGLE_API_KEY,
          message: '✨ 무한한 가능성을 가진 자율 AI가 스스로 판단하여 생성한 응답입니다.',
          isInfiniteAI: true,
        },
        infiniteAI: {
          optionsCount: infiniteAIResponse.options.length,
          selectedOption: infiniteAIResponse.selectedOption.approach,
          innovationLevel: infiniteAIResponse.selectedOption.innovation,
        },
      });
    }

    const response = {
      title: validation.sanitized,
      content: content,
      sources: [
        `https://example.com/${encodeURIComponent(query)}/source1`,
        `https://example.com/${encodeURIComponent(query)}/source2`,
        `https://example.com/${encodeURIComponent(query)}/source3`,
      ],
      generatedAt: new Date().toISOString(),
      // API 호출 정보 추가
      apiInfo: {
        isRealApiCall: isRealApiCall,
        responseTime: apiResponseTime,
        hasApiKey: hasApiKey,
        message: isRealApiCall 
          ? '✅ 실제 Google Gemini API를 사용하여 생성된 응답입니다.' 
          : hasApiKey
          ? '⚠️ API 키가 올바르지 않거나 오류가 발생했습니다.'
          : '⚠️ GOOGLE_API_KEY를 설정하세요. 현재는 기본 응답을 제공합니다.',
      },
      // AI 처리 과정 추적 정보
      processId: trackedResult.processId,
      process: trackedResult.process,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

