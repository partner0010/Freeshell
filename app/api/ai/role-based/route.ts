/**
 * 역할 기반 AI 생성 API
 * 각 역할에 맞는 프롬프트를 사용하여 응답 생성
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { generateWithFreeAI } from '@/lib/free-ai-services';
import { getRolePrompt, getAllRoles } from '@/lib/prompts/role-based-prompts';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { role, userPrompt, context } = body;

    if (!role) {
      return NextResponse.json(
        { error: '역할(role)이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!userPrompt) {
      return NextResponse.json(
        { error: '사용자 프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 입력 검증
    const validation = validateInput(userPrompt, {
      maxLength: 10000,
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

    // 역할 프롬프트 가져오기
    const rolePrompt = getRolePrompt(role);
    if (!rolePrompt) {
      return NextResponse.json(
        { 
          error: '지원하지 않는 역할입니다.',
          availableRoles: getAllRoles()
        },
        { status: 400 }
      );
    }

    // 최종 프롬프트 구성
    const finalPrompt = `${rolePrompt.systemPrompt}

## 현재 작업
${userPrompt}

${context ? `## 컨텍스트\n${context}\n` : ''}

위 요구사항에 따라 ${rolePrompt.outputFormat === 'json' ? 'JSON 형식으로' : 'Markdown 코드 블록으로'} 응답해주세요.`;

    // AI 응답 생성
    let aiResponse = '';
    let aiSource = 'fallback';

    try {
      const freeAIResult = await generateWithFreeAI(finalPrompt);
      if (freeAIResult.success && freeAIResult.text) {
        aiResponse = freeAIResult.text;
        aiSource = freeAIResult.source;
      } else {
        aiResponse = '응답을 생성할 수 없습니다.';
      }
    } catch (error) {
      console.error('[Role-Based AI] 오류:', error);
      aiResponse = 'AI 응답 생성 중 오류가 발생했습니다.';
    }

    return NextResponse.json({
      success: true,
      role: role,
      content: aiResponse,
      source: aiSource,
      outputFormat: rolePrompt.outputFormat,
    });
  } catch (error: any) {
    console.error('Role-Based AI API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 사용 가능한 역할 목록 조회
 */
export async function GET() {
  return NextResponse.json({
    roles: getAllRoles(),
    descriptions: {
      'service-planner': '서비스 기획자 - 요구사항 분석, 기능 명세',
      'web-developer': '웹 개발자 - HTML/CSS/JS 코드 생성',
      'app-developer': '앱 개발자 - React Native/Flutter 코드 생성',
      'uiux-designer': 'UI/UX 디자이너 - 디자인 시스템 설계',
      'editor-assistant': '에디터 도우미 - 코드 분석 및 개선 제안',
    }
  });
}
