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

/**
 * 폴백 템플릿 생성 (JSON 파싱 실패 시)
 */
function createFallbackTemplate(options: TemplateGenerationOptions, rawResponse: string): any {
  const templateId = `template-${Date.now()}`;
  const now = Date.now();
  
  return {
    metadata: {
      id: templateId,
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      author: 'AI (Fallback)',
      tags: [options.category || 'other'],
      description: options.description?.substring(0, 200) || '생성된 템플릿',
    },
    type: options.type || 'web',
    category: options.category || 'other',
    blocks: [
      {
        id: 'block-header-1',
        type: 'heading',
        content: {
          text: options.description?.substring(0, 50) || '제목',
          level: 1,
        },
        style: {
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '2rem',
        },
      },
      {
        id: 'block-content-1',
        type: 'text',
        content: {
          text: rawResponse.substring(0, 500) || '콘텐츠',
        },
        style: {
          padding: '1rem',
          lineHeight: '1.6',
        },
      },
    ],
    editableFields: [],
    previewInfo: {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff',
      deviceType: 'desktop',
    },
    styles: {
      global: {
        fontFamily: 'system-ui, sans-serif',
        color: '#333333',
        backgroundColor: '#ffffff',
      },
    },
  };
}

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

    // JSON 파싱 (강화된 로직)
    let template;
    try {
      // 1. 코드 블록 제거 (```json ... ```)
      let cleanedResponse = aiResponse;
      const codeBlockMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        cleanedResponse = codeBlockMatch[1];
      }
      
      // 2. JSON 객체 추출 (여러 시도)
      let jsonString = null;
      
      // 시도 1: 코드 블록 내부에서 JSON 찾기
      const jsonInCodeBlock = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonInCodeBlock) {
        jsonString = jsonInCodeBlock[0];
      }
      
      // 시도 2: 전체 응답에서 JSON 찾기
      if (!jsonString) {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
      }
      
      // 시도 3: 직접 파싱 시도
      if (!jsonString) {
        jsonString = cleanedResponse.trim();
      }
      
      // 시도 4: 첫 번째 { 부터 마지막 } 까지 추출
      if (!jsonString) {
        const firstBrace = aiResponse.indexOf('{');
        const lastBrace = aiResponse.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = aiResponse.substring(firstBrace, lastBrace + 1);
        }
      }
      
      // JSON 파싱
      if (jsonString) {
        // JSON 문자열 정리 (주석 제거, 후행 쉼표 제거 등)
        jsonString = jsonString
          .replace(/\/\*[\s\S]*?\*\//g, '') // 블록 주석 제거
          .replace(/\/\/.*$/gm, '') // 라인 주석 제거
          .replace(/,(\s*[}\]])/g, '$1'); // 후행 쉼표 제거
        
        template = JSON.parse(jsonString);
      } else {
        throw new Error('JSON을 찾을 수 없습니다');
      }
    } catch (error: any) {
      console.error('[Template Generate] JSON 파싱 오류:', {
        error: error.message,
        responseLength: aiResponse.length,
        responsePreview: aiResponse.substring(0, 200),
      });
      
      // 폴백: 기본 템플릿 구조 생성
      template = createFallbackTemplate(options, aiResponse);
      console.log('[Template Generate] 폴백 템플릿 사용');
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
