import { NextRequest, NextResponse } from 'next/server';
import { multimodalAI, ContentType } from '@/lib/multimodal-ai';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

/**
 * 멀티모달 콘텐츠 생성 API
 * 텍스트, 이미지, 영상, 코드 등 모든 형태의 콘텐츠 제작
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, prompt, style, format, requirements } = body;

    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'type과 prompt가 필요합니다.' },
        { status: 400 }
      );
    }

    // 입력 검증
    const validation = validateInput(prompt, {
      maxLength: 2000,
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

    const sanitizedPrompt = validation.sanitized || prompt || '';

    // 콘텐츠 생성
    const result = await multimodalAI.generateContent({
      type: type as ContentType,
      prompt: sanitizedPrompt,
      style,
      format,
      requirements,
    });

    return NextResponse.json({
      success: true,
      ...result,
      type,
      apiInfo: {
        isRealApiCall: result.metadata?.source === 'gemini',
        message: result.metadata?.source === 'gemini'
          ? '✅ 실제 AI API를 사용하여 콘텐츠를 생성했습니다.'
          : '⚠️ GOOGLE_API_KEY를 설정하면 더 고품질의 콘텐츠를 생성할 수 있습니다.',
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Multimodal API] 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠 생성 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

