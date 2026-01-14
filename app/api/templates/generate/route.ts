/**
 * AI 템플릿 생성 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { generateWithFreeAI } from '@/lib/free-ai-services';
import { buildAIPrompt } from '@/lib/templates/template-ai-prompt';
import { TemplateGenerationOptions, validateTemplate } from '@/lib/templates/template-schema';
import { templateStorage } from '@/lib/templates/template-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const options: TemplateGenerationOptions = {
      type: body.type || 'web',
      category: body.category || 'other',
      description: body.description || '',
      style: body.style,
      features: body.features,
      blocks: body.blocks,
    };

    // 입력 검증
    if (!options.description || options.description.trim().length === 0) {
      return NextResponse.json(
        { error: '설명(description)이 필요합니다.' },
        { status: 400 }
      );
    }

    // AI 프롬프트 생성
    const { systemPrompt, userPrompt } = buildAIPrompt(options);

    // AI 응답 생성
    const finalPrompt = `${systemPrompt}\n\n## 사용자 요구사항\n${userPrompt}`;

    let aiResponse = '';
    let aiSource = 'fallback';

    try {
      const freeAIResult = await generateWithFreeAI(finalPrompt);
      if (freeAIResult.success && freeAIResult.text) {
        aiResponse = freeAIResult.text;
        aiSource = freeAIResult.source;
      } else {
        return NextResponse.json(
          { error: 'AI 템플릿 생성 실패' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('AI 템플릿 생성 오류:', error);
      return NextResponse.json(
        { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // JSON 파싱
    let template;
    try {
      // JSON 추출 (코드 블록 제거)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        template = JSON.parse(jsonMatch[0]);
      } else {
        template = JSON.parse(aiResponse);
      }
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return NextResponse.json(
        { 
          error: 'AI 응답을 파싱할 수 없습니다.',
          rawResponse: aiResponse.substring(0, 500),
        },
        { status: 500 }
      );
    }

    // 템플릿 유효성 검사
    const validation = validateTemplate(template);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: '템플릿 유효성 검사 실패',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // 템플릿 저장
    const saveResult = templateStorage.add(template);
    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      template: template,
      id: template.metadata.id,
      source: aiSource,
    });
  } catch (error: any) {
    console.error('템플릿 생성 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
