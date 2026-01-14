/**
 * 올인원 스튜디오 - 콘텐츠 생성 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { generateWithFreeAI } from '@/lib/free-ai-services';
import { AI_ROLES } from '@/lib/allinone-studio/ai-roles';

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
    const { type, prompt, step, previousResults } = body;

    if (!prompt || !step) {
      return NextResponse.json(
        { error: '프롬프트와 단계가 필요합니다.' },
        { status: 400 }
      );
    }

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

    // 단계별 AI 역할 선택
    let systemPrompt = '';
    let userPrompt = '';

    switch (step) {
      case 'story':
        systemPrompt = AI_ROLES['story-script'];
        userPrompt = `다음 요구사항에 맞는 스토리와 스크립트를 생성해주세요:\n\n${prompt}`;
        break;
      case 'character':
        systemPrompt = AI_ROLES['character-generator'];
        const characterContext = previousResults?.[0] || {};
        userPrompt = `다음 스토리 정보를 바탕으로 캐릭터를 생성해주세요:\n\n스토리: ${JSON.stringify(characterContext)}\n\n요구사항: ${prompt}`;
        break;
      case 'scene':
        systemPrompt = AI_ROLES['scene-composer'];
        const sceneContext = previousResults?.slice(0, 2) || [];
        userPrompt = `다음 정보를 바탕으로 장면을 구성해주세요:\n\n${JSON.stringify(sceneContext)}\n\n요구사항: ${prompt}`;
        break;
      case 'animation':
        systemPrompt = AI_ROLES['animation-expression'];
        const animationContext = previousResults || [];
        userPrompt = `다음 정보를 바탕으로 애니메이션과 표현을 생성해주세요:\n\n${JSON.stringify(animationContext)}\n\n요구사항: ${prompt}`;
        break;
      case 'voice':
        systemPrompt = AI_ROLES['voice-music'];
        const voiceContext = previousResults || [];
        userPrompt = `다음 정보를 바탕으로 음성과 음악을 생성해주세요:\n\n${JSON.stringify(voiceContext)}\n\n요구사항: ${prompt}`;
        break;
      default:
        return NextResponse.json(
          { error: '지원하지 않는 단계입니다.' },
          { status: 400 }
        );
    }

    // AI 응답 생성
    const finalPrompt = `${systemPrompt}\n\n## 사용자 요구사항\n${userPrompt}\n\n위 요구사항에 따라 JSON 형식으로 응답해주세요. 설명 없이 순수 JSON만 출력해주세요.`;

    let aiResponse = '';
    let aiSource = 'fallback';

    try {
      const freeAIResult = await generateWithFreeAI(finalPrompt);
      if (freeAIResult.success && freeAIResult.text) {
        aiResponse = freeAIResult.text;
        aiSource = freeAIResult.source;
      } else {
        return NextResponse.json(
          { error: 'AI 응답 생성 실패' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('AI 생성 오류:', error);
      return NextResponse.json(
        { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // JSON 파싱
    let result;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(aiResponse);
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

    return NextResponse.json({
      success: true,
      step,
      result,
      source: aiSource,
    });
  } catch (error: any) {
    console.error('콘텐츠 생성 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
