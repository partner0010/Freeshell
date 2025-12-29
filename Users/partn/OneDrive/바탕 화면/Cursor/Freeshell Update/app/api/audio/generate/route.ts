import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 20, 60000); // 1분에 20회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { prompt, type, duration } = body;

    // 입력 검증
    const promptValidation = validateInput(prompt, {
      maxLength: 2000,
      required: true,
      allowHtml: false,
    });

    if (!promptValidation.valid) {
      return NextResponse.json(
        { error: promptValidation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    // MMAudio AI 스타일로 오디오 생성
    // 실제로는 MMAudio AI API를 호출하지만, 여기서는 시뮬레이션
    // 향후 MMAudio AI API 키가 있으면 실제 호출

    // 폴백: 기본 오디오 URL 반환
    return NextResponse.json({
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      type: type || 'background',
      duration: duration || 30,
      prompt: prompt,
    });
  } catch (error) {
    console.error('오디오 생성 오류:', error);
    return NextResponse.json(
      { error: '오디오 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

