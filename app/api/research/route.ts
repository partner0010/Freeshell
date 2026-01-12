import { NextRequest, NextResponse } from 'next/server';
import { researchEngine } from '@/lib/research';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 20, 60000); // 연구는 비용이 높음
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { topic, depth } = body;

    // 입력 검증
    const topicValidation = validateInput(topic, {
      maxLength: 500,
      required: true,
      allowHtml: false,
    });

    if (!topicValidation.valid) {
      return NextResponse.json(
        { error: topicValidation.error || 'Invalid topic' },
        { status: 400 }
      );
    }

    // depth 검증 (research.ts의 타입과 일치)
    const validDepths = ['basic', 'intermediate', 'deep'];
    const sanitizedDepth = depth && validDepths.includes(depth) ? depth : 'intermediate';

    const sanitizedTopic = topicValidation.sanitized || topic || '';

    const result = await researchEngine.conductResearch({
      topic: sanitizedTopic,
      depth: sanitizedDepth,
    });

    // API 상태 정보 추가
    const hasApiKey = !!process.env.GOOGLE_API_KEY;
    const isRealApiCall = hasApiKey && 
                         !result.analysis.includes('시뮬레이션') && 
                         !result.analysis.includes('API 키를 설정');

    return NextResponse.json({
      ...result,
      apiInfo: {
        isRealApiCall: isRealApiCall,
        hasApiKey: hasApiKey,
        message: isRealApiCall 
          ? '✅ 실제 Google Gemini API를 사용하여 생성된 연구 결과입니다.' 
          : '⚠️ 시뮬레이션된 연구 결과입니다. GOOGLE_API_KEY를 설정하면 실제 AI 연구 결과를 받을 수 있습니다.',
      },
    });
  } catch (error: any) {
    console.error('[Research API] 연구 수행 오류:', {
      error: error.message,
      stack: error.stack,
      hasApiKey: !!process.env.GOOGLE_API_KEY,
    });
    
    return NextResponse.json(
      { 
        error: '연구 수행 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
        details: 'Google Gemini API 호출이 실패했습니다. API 키가 유효한지 확인하세요.',
      },
      { status: 500 }
    );
  }
}

