import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 20, 60000); // 1분에 20회 (이미지 생성은 비용이 높음)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { type, prompt } = body;

    // 입력 검증
    const typeValidation = validateInput(type, {
      maxLength: 20,
      required: true,
      allowHtml: false,
    });

    const promptValidation = validateInput(prompt, {
      maxLength: 1000,
      required: true,
      allowHtml: false,
    });

    if (!typeValidation.valid || !promptValidation.valid) {
      return NextResponse.json(
        { error: typeValidation.error || promptValidation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    const sanitizedType = typeValidation.sanitized;
    const sanitizedPrompt = promptValidation.sanitized;

    // 이미지 생성인 경우
    if (sanitizedType === 'image') {
      try {
        const imageUrl = await openai.generateImage(sanitizedPrompt);
        return NextResponse.json({
          type: sanitizedType,
          prompt: sanitizedPrompt,
          image: imageUrl,
          generatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Image generation error:', error);
        // 폴백: 플레이스홀더 이미지
        return NextResponse.json({
          type,
          prompt,
          image: `https://via.placeholder.com/512?text=${encodeURIComponent(prompt)}`,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    // 텍스트 기반 콘텐츠 생성
    let content: string;
    try {
      const aiPrompt = `${sanitizedType} 형식으로 "${sanitizedPrompt}"에 대한 콘텐츠를 생성해주세요.`;
      content = await openai.generateText(aiPrompt, {
        maxTokens: 2000,
        temperature: 0.7,
      });
    } catch (error) {
      console.error('OpenAI API error, using fallback:', error);
      // API 키가 없거나 오류 발생 시 시뮬레이션된 응답
      content = `${prompt}에 대한 ${type} 콘텐츠가 생성되었습니다.`;
    }

    const responses: Record<string, any> = {
      video: {
        url: `https://example.com/videos/${Date.now()}.mp4`,
        thumbnail: `https://example.com/thumbnails/${Date.now()}.jpg`,
        duration: '5:30',
        format: 'mp4',
        resolution: '1080p',
        content: content,
      },
      document: {
        url: `https://example.com/documents/${Date.now()}.pdf`,
        pages: 10,
        format: 'pdf',
        wordCount: 2500,
        content: content,
      },
      presentation: {
        url: `https://example.com/presentations/${Date.now()}.pptx`,
        slides: 15,
        format: 'pptx',
        content: content,
      },
      website: {
        url: `https://example.com/sites/${Date.now()}`,
        pages: 5,
        format: 'html',
        content: content,
      },
    };

    const response = {
      type: sanitizedType,
      prompt: sanitizedPrompt,
      result: responses[sanitizedType] || { ...responses.document, content: content },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: '콘텐츠 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

