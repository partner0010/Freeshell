/**
 * 올인원 스튜디오 - 콘텐츠 생성 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { generateWithFreeAI } from '@/lib/free-ai-services';
import { AI_ROLES } from '@/lib/allinone-studio/ai-roles';

export const dynamic = 'force-dynamic';

/**
 * 폴백 결과 생성 (JSON 파싱 실패 시)
 */
function createFallbackResult(step: string, prompt: string, rawResponse: string): any {
  const baseResult = {
    step,
    prompt,
    rawResponse: rawResponse.substring(0, 1000),
    note: 'AI 응답을 JSON으로 변환하지 못했습니다. 원본 응답을 포함합니다.',
  };

  switch (step) {
    case 'story':
      return {
        ...baseResult,
        title: prompt.substring(0, 50) || '생성된 스토리',
        summary: rawResponse.substring(0, 500) || '스토리 설명',
        scenes: [
          {
            id: 'scene-01',
            name: '첫 장면',
            description: rawResponse.substring(0, 200) || '장면 설명',
            background: '기본 배경',
            characters: [],
            dialogues: [],
            duration: 30,
          },
        ],
        characters: [],
      };
    case 'character':
      return {
        ...baseResult,
        id: 'char-01',
        name: '캐릭터',
        gender: 'male',
        style: 'anime',
        appearance: {
          face: rawResponse.substring(0, 100) || '얼굴 설명',
          hair: '기본 헤어',
          clothes: '기본 옷',
        },
        voice: {
          type: 'male',
          age: 'adult',
          tone: 'natural',
        },
        expressions: [],
        motions: [],
      };
    case 'scene':
      return {
        ...baseResult,
        scene_number: 1,
        description: rawResponse.substring(0, 400) || '장면 설명',
        elements: [],
        background: '기본 배경',
      };
    case 'animation':
      return {
        ...baseResult,
        animations: [],
        expressions: [],
        transitions: [],
      };
    case 'voice':
      return {
        ...baseResult,
        voice_style: 'natural',
        music: null,
        sound_effects: [],
      };
    default:
      return baseResult;
  }
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
      case 'render':
        // 렌더링 단계는 실제 렌더링 서버에서 처리해야 함
        // 임시로 시뮬레이션 결과 반환
        return NextResponse.json({
          success: true,
          step: 'render',
          result: {
            videoUrl: null, // 실제 렌더링 완료 시 URL 설정
            thumbnail: null,
            duration: 30,
            status: 'completed',
            message: '렌더링이 완료되었습니다. (시뮬레이션)',
          },
          source: 'fallback',
        });
      default:
        return NextResponse.json(
          { error: '지원하지 않는 단계입니다.' },
          { status: 400 }
        );
    }

    // AI 응답 생성 (더 명확한 JSON 요청)
    const finalPrompt = `${systemPrompt}\n\n## 사용자 요구사항\n${userPrompt}\n\n**중요**: 반드시 유효한 JSON 형식으로만 응답해주세요. 설명이나 추가 텍스트 없이 순수 JSON 객체만 출력해주세요. JSON은 { }로 시작하고 끝나야 합니다.`;

    let aiResponse = '';
    let aiSource = 'fallback';

    try {
      const freeAIResult = await generateWithFreeAI(finalPrompt);
      if (freeAIResult.success && freeAIResult.text) {
        aiResponse = freeAIResult.text;
        aiSource = freeAIResult.source;
      } else {
        console.error('[AllInOne Studio] AI 응답 생성 실패:', {
          success: freeAIResult.success,
          source: freeAIResult.source,
          hasText: !!freeAIResult.text,
        });
        return NextResponse.json(
          { 
            error: 'AI 응답 생성 실패',
            details: 'AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
            source: freeAIResult.source,
          },
          { status: 500 }
        );
      }
    } catch (error: any) {
      console.error('[AllInOne Studio] AI 생성 오류:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return NextResponse.json(
        { 
          error: 'AI 응답 생성 중 오류가 발생했습니다.',
          details: error.message || '네트워크 연결을 확인해주세요.',
        },
        { status: 500 }
      );
    }

    // JSON 파싱 (강화된 로직)
    let result;
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
        
        result = JSON.parse(jsonString);
      } else {
        throw new Error('JSON을 찾을 수 없습니다');
      }
    } catch (error: any) {
      console.error('[AllInOne Studio] JSON 파싱 오류:', {
        error: error.message,
        responseLength: aiResponse.length,
        responsePreview: aiResponse.substring(0, 200),
      });
      
      // 폴백: 기본 구조 생성
      result = createFallbackResult(step, prompt, aiResponse);
      
      console.log('[AllInOne Studio] 폴백 결과 사용:', result);
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
