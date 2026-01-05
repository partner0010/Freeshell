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

    // Google Gemini API를 사용하여 실제 AI 응답 생성
    const aiPrompt = `${query}에 대한 포괄적이고 상세한 정보를 제공하는 검색 결과 페이지를 생성해주세요. 마크다운 형식으로 작성하고, 개요, 주요 내용, 상세 분석, 결론 섹션을 포함해주세요.`;
    
    let content: string;
    let isRealApiCall = false;
    let apiResponseTime = 0;
    
    try {
      // Google Gemini API 호출
      const startTime = Date.now();
      content = await aiModelManager.generateWithModel('gemini-pro', aiPrompt);
      const endTime = Date.now();
      apiResponseTime = endTime - startTime;
      
      // 실제 API 호출 여부 확인 (응답 시간이 100ms 이상이면 실제 API 호출로 간주)
      // 시뮬레이션된 응답은 즉시 반환되므로 100ms 미만
      isRealApiCall = apiResponseTime > 100 && !content.includes('시뮬레이션');
      
      // 시뮬레이션 응답인지 확인
      if (content.includes('시뮬레이션') || content.includes('API 키를 설정')) {
        isRealApiCall = false;
      }
    } catch (error) {
      console.error('Google Gemini API error, using fallback:', error);
      // API 키가 없거나 오류 발생 시 시뮬레이션된 응답
      content = `# ${query}에 대한 종합 정보

## 개요

${query}에 대한 포괄적인 정보를 제공합니다. 이 주제는 다양한 측면에서 분석할 수 있으며, 최신 데이터와 통계를 바탕으로 정확한 정보를 제공합니다.

## 주요 내용

### 1. 기본 개념
${query}의 기본적인 개념과 정의를 설명합니다.

### 2. 현재 동향
최신 트렌드와 발전 방향을 분석합니다.

### 3. 실용적 활용
실제 적용 사례와 활용 방법을 제시합니다.

### 4. 미래 전망
앞으로의 발전 방향과 기대 효과를 전망합니다.

## 상세 분석

${query}에 대한 심층 분석 결과를 보면, 여러 중요한 요소들이 복합적으로 작용하고 있습니다. 전문가들의 의견과 최신 연구 결과를 종합하면 다음과 같은 특징을 확인할 수 있습니다.

### 핵심 포인트

- **혁신성**: 새로운 접근 방식과 기술의 융합
- **효율성**: 기존 방법 대비 개선된 성능
- **접근성**: 더 많은 사람들이 활용할 수 있는 환경

## 결론

${query}는 현재 빠르게 발전하고 있는 분야로, 앞으로 더욱 중요한 역할을 할 것으로 예상됩니다. 지속적인 관심과 투자가 필요하며, 이를 통해 더 나은 결과를 기대할 수 있습니다.`;
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
        hasApiKey: !!process.env.GOOGLE_API_KEY,
        message: isRealApiCall 
          ? '✅ 실제 Google Gemini API를 사용하여 생성된 응답입니다.' 
          : '⚠️ 시뮬레이션된 응답입니다. GOOGLE_API_KEY를 설정하면 실제 AI 응답을 받을 수 있습니다.',
      },
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

