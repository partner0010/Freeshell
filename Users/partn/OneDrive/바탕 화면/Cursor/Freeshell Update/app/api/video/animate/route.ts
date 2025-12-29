import { NextRequest, NextResponse } from 'next/server';
import { validateInput, validateUrl } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 10, 60000); // 1분에 10회 (비용이 높은 작업)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { imageUrl, prompt, duration, style } = body;

    // 입력 검증
    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: '이미지 URL과 프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // URL 검증
    if (!validateUrl(imageUrl)) {
      return NextResponse.json(
        { error: '올바른 이미지 URL이 아닙니다.' },
        { status: 400 }
      );
    }

    const promptValidation = validateInput(prompt, {
      maxLength: 1000,
      required: true,
      allowHtml: false,
    });

    if (!promptValidation.valid) {
      return NextResponse.json(
        { error: promptValidation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    // Kling AI 스타일로 이미지 애니메이션
    // 실제로는 Kling AI API를 호출하지만, 여기서는 시뮬레이션
    // 향후 Kling AI API 키가 있으면 실제 호출

    // 폴백: 이미지 URL 반환 (정적 이미지)
    return NextResponse.json({
      videoUrl: imageUrl, // 실제로는 애니메이션된 영상 URL
      thumbnail: imageUrl,
      duration: duration || 5,
      style: style || 'animation',
    });
  } catch (error) {
    console.error('영상 애니메이션 오류:', error);
    return NextResponse.json(
      { error: '영상 애니메이션 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

