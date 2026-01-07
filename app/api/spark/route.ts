import { NextRequest, NextResponse } from 'next/server';
import { aiModelManager } from '@/lib/ai-models';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 30, 60000); // 1분에 30회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    // 입력 검증
    const validation = validateInput(prompt, {
      maxLength: 5000,
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

    // 작업 타입 감지
    const detectType = (text: string): 'video' | 'document' | 'presentation' | 'website' | 'call' => {
      const lower = text.toLowerCase();
      if (lower.includes('비디오') || lower.includes('video') || lower.includes('영상')) return 'video';
      if (lower.includes('프레젠테이션') || lower.includes('presentation') || lower.includes('슬라이드')) return 'presentation';
      if (lower.includes('웹사이트') || lower.includes('website') || lower.includes('사이트')) return 'website';
      if (lower.includes('전화') || lower.includes('call') || lower.includes('통화')) return 'call';
      return 'document';
    };

    const type = detectType(prompt);

    // Google Gemini API를 사용하여 실제 콘텐츠 생성
    const sanitizedPrompt = validation.sanitized;
    let content: string;
    let isRealApiCall = false;
    let apiResponseTime = 0;
    
    try {
      const aiPrompt = `${sanitizedPrompt}에 대한 작업을 수행하고 결과를 생성해주세요. ${type} 형식으로 상세하게 작성해주세요.`;
      const startTime = Date.now();
      content = await aiModelManager.generateWithModel('gemini-pro', aiPrompt);
      const endTime = Date.now();
      apiResponseTime = endTime - startTime;
      
      // 실제 API 호출 여부 확인
      const hasApiKey = !!process.env.GOOGLE_API_KEY;
      isRealApiCall = hasApiKey && apiResponseTime > 100 && 
                     !content.includes('시뮬레이션') && 
                     !content.includes('API 키를 설정');
      
      console.log('[Spark API] API 호출 결과:', {
        hasApiKey,
        apiResponseTime,
        isRealApiCall,
        contentLength: content.length,
      });
    } catch (error: any) {
      console.error('[Spark API] Google Gemini API 오류:', {
        error: error.message,
        stack: error.stack,
        hasApiKey: !!process.env.GOOGLE_API_KEY,
      });
      
      // API 키가 있는데도 실패한 경우 실제 에러 반환
      if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '') {
        return NextResponse.json(
          { 
            error: '작업 처리 중 오류가 발생했습니다.',
            message: error.message || '알 수 없는 오류',
            details: 'Google Gemini API 호출이 실패했습니다. API 키가 유효한지 확인하세요.',
          },
          { status: 500 }
        );
      }
      
      // API 키가 없을 때만 시뮬레이션된 응답
      content = `${prompt}에 대한 작업이 성공적으로 완료되었습니다. (시뮬레이션 모드)`;
      isRealApiCall = false;
    }

    const response = {
      id: Date.now().toString(),
      prompt: validation.sanitized,
      status: 'completed',
      result: {
        type: type,
        content: content,
        url: `https://example.com/spark/${Date.now()}`,
        metadata: {
          createdAt: new Date().toISOString(),
          model: isRealApiCall ? 'Gemini Pro' : 'Simulation',
          tools: ['web-search', 'content-generation', 'data-analysis'],
        },
      },
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
    console.error('Spark task error:', error);
    return NextResponse.json(
      { error: '작업 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

