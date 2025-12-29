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

    // depth 검증
    const validDepths = ['basic', 'intermediate', 'advanced'];
    const sanitizedDepth = depth && validDepths.includes(depth) ? depth : 'intermediate';

    const result = await researchEngine.conductResearch({
      topic: topicValidation.sanitized,
      depth: sanitizedDepth,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: '연구 수행 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

