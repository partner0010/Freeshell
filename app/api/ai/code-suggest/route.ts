import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { generateWithFreeAI } from '@/lib/free-ai-services';

/**
 * AI 코드 제안 API
 * 코드 분석 및 개선 제안
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimit = await rateLimitCheck(request, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { code, language, fileName } = body;

    if (!code) {
      return NextResponse.json(
        { error: '코드가 필요합니다.' },
        { status: 400 }
      );
    }

    // 입력 검증
    const validation = validateInput(code, {
      maxLength: 50000,
      minLength: 1,
      required: true,
      allowHtml: true,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    const sanitizedCode = validation.sanitized || code || '';

    // AI 코드 분석 프롬프트
    const analysisPrompt = `당신은 전문 코드 리뷰어입니다. 다음 ${language} 코드를 분석하여 개선 제안을 해주세요.

파일명: ${fileName}
코드:
\`\`\`${language}
${sanitizedCode.substring(0, 10000)}
\`\`\`

다음 항목을 분석해주세요:
1. 버그 및 잠재적 오류
2. 성능 최적화 기회
3. 코드 품질 개선 사항
4. 보안 취약점
5. 디자인/UI 개선 제안
6. 모범 사례 준수 여부

다음 JSON 형식으로 응답해주세요:
{
  "suggestions": [
    {
      "type": "bug|optimization|improvement|design",
      "message": "제안 내용 (한국어로 설명)",
      "code": "개선된 코드 (선택사항)",
      "line": 줄번호 (선택사항),
      "severity": "high|medium|low"
    }
  ]
}

중요:
- 실용적이고 구체적인 제안만 제공
- 코드가 이미 좋으면 제안을 적게 제공
- 각 제안은 명확하고 실행 가능해야 함`;

    let suggestions: any[] = [];
    const hasApiKey = !!process.env.GOOGLE_API_KEY;

    // Google Gemini API 시도
    if (hasApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: analysisPrompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            try {
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                suggestions = parsed.suggestions || [];
              }
            } catch (error) {
              console.warn('JSON 파싱 실패:', error);
            }
          }
        }
      } catch (error) {
        console.warn('[Code Suggest] Gemini 실패, 완전 무료 AI 시도:', error);
      }
    }

    // 완전 무료 AI 서비스 시도
    if (suggestions.length === 0) {
      try {
        const freeAIResult = await generateWithFreeAI(analysisPrompt);
        if (freeAIResult.success && freeAIResult.text) {
          try {
            const jsonMatch = freeAIResult.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              suggestions = parsed.suggestions || [];
            }
          } catch (error) {
            console.warn('JSON 파싱 실패:', error);
          }
        }
      } catch (error) {
        console.warn('[Code Suggest] 완전 무료 AI 실패:', error);
      }
    }

    // 기본 제안 (AI 실패 시)
    if (suggestions.length === 0) {
      // 간단한 코드 분석
      const codeLines = sanitizedCode.split('\n');
      
      // 기본 제안 생성
      if (language === 'html') {
        if (!sanitizedCode.includes('viewport')) {
          suggestions.push({
            type: 'improvement',
            message: '반응형 디자인을 위해 viewport meta 태그를 추가하는 것이 좋습니다.',
            code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            severity: 'medium',
          });
        }
        if (!sanitizedCode.includes('lang=')) {
          suggestions.push({
            type: 'improvement',
            message: '접근성을 위해 html 태그에 lang 속성을 추가하세요.',
            severity: 'low',
          });
        }
      } else if (language === 'css') {
        if (codeLines.length > 100) {
          suggestions.push({
            type: 'optimization',
            message: 'CSS 파일이 길어 보입니다. 모듈화를 고려해보세요.',
            severity: 'medium',
          });
        }
      } else if (language === 'javascript') {
        if (sanitizedCode.includes('var ')) {
          suggestions.push({
            type: 'improvement',
            message: 'var 대신 let 또는 const를 사용하는 것이 좋습니다.',
            severity: 'medium',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.slice(0, 10), // 최대 10개
      apiInfo: {
        isRealApiCall: hasApiKey && suggestions.length > 0,
        hasApiKey,
      },
    });
  } catch (error: any) {
    console.error('[Code Suggest API] 오류:', error);
    return NextResponse.json(
      { error: '코드 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
