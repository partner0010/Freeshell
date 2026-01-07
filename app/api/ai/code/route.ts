import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

/**
 * AI 코드 생성 API
 * 개발자처럼 코드를 생성하고 설명
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { prompt, language, framework } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 입력 검증
    const validation = validateInput(prompt, {
      maxLength: 1000,
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

    // Google Gemini API로 코드 생성
    const geminiKey = process.env.GOOGLE_API_KEY;
    let code = '';
    let explanation = '';
    let isRealApiCall = false;

    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const codePrompt = `당신은 전문 개발자입니다. 다음 요구사항에 맞는 ${language || 'JavaScript'} 코드를 작성해주세요.

요구사항: ${prompt}
${framework ? `프레임워크: ${framework}` : ''}
${language ? `언어: ${language}` : ''}

다음 형식으로 응답해주세요:
1. 코드 블록 (마크다운 코드 블록 형식으로 작성)
2. 코드 설명 (한국어로 상세히)
3. 사용 방법
4. 주의사항`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: codePrompt }] }],
              generationConfig: {
                temperature: 0.3, // 코드 생성은 낮은 temperature 사용
                maxOutputTokens: 4096,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            isRealApiCall = true;
            
            // 코드와 설명 분리
            const codeMatch = text.match(/```[\s\S]*?```/);
            if (codeMatch) {
              code = codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
              explanation = text.replace(/```[\s\S]*?```/g, '').trim();
            } else {
              code = text;
              explanation = '코드가 생성되었습니다.';
            }
          }
        }
      } catch (error: any) {
        console.error('[Code Generation] API 오류:', error);
      }
    }

    // API 실패 시 기본 코드 생성
    if (!code) {
      const defaultCode = generateDefaultCode(prompt, language || 'javascript');
      code = defaultCode.code;
      explanation = defaultCode.explanation;
    }

    return NextResponse.json({
      success: true,
      code,
      explanation,
      language: language || 'javascript',
      framework: framework || null,
      apiInfo: {
        isRealApiCall,
        hasApiKey: !!geminiKey,
        message: isRealApiCall 
          ? '✅ 실제 AI API를 사용하여 코드를 생성했습니다.'
          : '⚠️ GOOGLE_API_KEY를 설정하면 더 정확한 코드를 생성할 수 있습니다.',
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Code Generation] 오류:', error);
    return NextResponse.json(
      { error: '코드 생성 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 기본 코드 생성 (Fallback)
 */
function generateDefaultCode(prompt: string, language: string): { code: string; explanation: string } {
  const lang = language.toLowerCase();
  
  if (lang.includes('javascript') || lang.includes('js') || lang.includes('ts')) {
    return {
      code: `// ${prompt}
function solution() {
  // TODO: 구현 필요
  return null;
}

// 사용 예시
const result = solution();
console.log(result);`,
      explanation: `${prompt}에 대한 기본 코드 구조입니다. GOOGLE_API_KEY를 설정하면 더 상세한 코드를 생성할 수 있습니다.`,
    };
  }
  
  if (lang.includes('python')) {
    return {
      code: `# ${prompt}
def solution():
    # TODO: 구현 필요
    return None

# 사용 예시
result = solution()
print(result)`,
      explanation: `${prompt}에 대한 기본 Python 코드 구조입니다.`,
    };
  }
  
  if (lang.includes('react') || lang.includes('next')) {
    return {
      code: `// ${prompt}
import React from 'react';

export default function Component() {
  return (
    <div>
      {/* TODO: 구현 필요 */}
    </div>
  );
}`,
      explanation: `${prompt}에 대한 기본 React 컴포넌트 구조입니다.`,
    };
  }
  
  return {
    code: `// ${prompt}
// 코드를 생성하려면 GOOGLE_API_KEY를 설정하세요.`,
    explanation: `${prompt}에 대한 코드입니다. GOOGLE_API_KEY를 설정하면 더 정확한 코드를 생성할 수 있습니다.`,
  };
}

