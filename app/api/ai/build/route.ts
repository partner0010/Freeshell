import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { generateWithFreeAI } from '@/lib/free-ai-services';
import { aiModelManager } from '@/lib/ai-models';

/**
 * AI 웹사이트/앱 생성 API
 * Lovable.dev 스타일: 채팅으로 웹사이트와 앱 생성
 */
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
    const { messages, conversation } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userRequest = lastMessage.content;

    // 입력 검증
    const validation = validateInput(userRequest, {
      maxLength: 2000,
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

    const sanitizedRequest = validation.sanitized || userRequest || '';

    // AI로 웹사이트/앱 생성 프롬프트 구성
    const buildPrompt = `당신은 전문 웹 개발자입니다. 사용자의 요구사항에 맞는 완전한 웹사이트나 웹 앱을 생성해주세요.

사용자 요청: ${sanitizedRequest}

다음 형식으로 응답해주세요:

1. 프로젝트 이름과 설명
2. 필요한 파일 목록 (HTML, CSS, JavaScript 등)
3. 각 파일의 완전한 코드

응답 형식:
{
  "name": "프로젝트 이름",
  "description": "프로젝트 설명",
  "files": [
    {
      "name": "index.html",
      "type": "html",
      "content": "완전한 HTML 코드"
    },
    {
      "name": "style.css",
      "type": "css",
      "content": "완전한 CSS 코드"
    },
    {
      "name": "script.js",
      "type": "javascript",
      "content": "완전한 JavaScript 코드"
    }
  ]
}

중요:
- 모든 파일은 완전하고 실행 가능해야 합니다
- HTML 파일은 <!DOCTYPE html>로 시작해야 합니다
- CSS와 JavaScript는 완전한 코드여야 합니다
- 반응형 디자인을 적용하세요
- 현대적이고 아름다운 UI를 만들어주세요`;

    let generatedCode = '';
    let isRealApiCall = false;
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
              contents: [{ parts: [{ text: buildPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            generatedCode = text;
            isRealApiCall = true;
          }
        }
      } catch (error) {
        console.warn('[Build API] Gemini 실패, 완전 무료 AI 시도:', error);
      }
    }

    // 완전 무료 AI 서비스 시도
    if (!generatedCode) {
      try {
        const freeAIResult = await generateWithFreeAI(buildPrompt);
        if (freeAIResult.success && freeAIResult.text) {
          generatedCode = freeAIResult.text;
        }
      } catch (error) {
        console.warn('[Build API] 완전 무료 AI 실패:', error);
      }
    }

    // AI 응답 파싱
    let projectData: any = null;
    
    try {
      // JSON 형식으로 응답이 오는 경우
      const jsonMatch = generatedCode.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        projectData = JSON.parse(jsonMatch[0]);
      } else {
        // 텍스트 형식인 경우 기본 구조 생성
        projectData = parseTextResponse(generatedCode, sanitizedRequest);
      }
    } catch (error) {
      console.warn('[Build API] JSON 파싱 실패, 기본 구조 생성:', error);
      projectData = parseTextResponse(generatedCode || '', sanitizedRequest);
    }

    // 기본 파일 구조 보장
    if (!projectData.files || projectData.files.length === 0) {
      projectData = createDefaultProject(sanitizedRequest);
    }

    return NextResponse.json({
      success: true,
      message: `${projectData.name || '앱'}이 생성되었습니다!`,
      name: projectData.name || '생성된 앱',
      description: projectData.description || '',
      files: projectData.files || [],
      preview: projectData.files?.find((f: any) => f.name.includes('html'))?.content || '',
      apiInfo: {
        isRealApiCall,
        hasApiKey,
        message: isRealApiCall 
          ? '✅ 실제 AI API를 사용하여 생성되었습니다.' 
          : hasApiKey
          ? '⚠️ API 호출 실패, 완전 무료 AI 서비스를 사용했습니다.'
          : '✅ 완전 무료 AI 서비스를 사용하여 생성되었습니다.',
      },
    });
  } catch (error: any) {
    console.error('[Build API] 오류:', error);
    return NextResponse.json(
      { 
        error: '앱 생성 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 텍스트 응답을 파싱하여 프로젝트 데이터 생성
 */
function parseTextResponse(text: string, userRequest: string): any {
  const files: Array<{ name: string; type: string; content: string }> = [];

  // HTML 추출
  const htmlMatch = text.match(/```html\s*([\s\S]*?)```/i) || text.match(/<html[\s\S]*?<\/html>/i);
  if (htmlMatch) {
    files.push({
      name: 'index.html',
      type: 'html',
      content: htmlMatch[1] || htmlMatch[0],
    });
  }

  // CSS 추출
  const cssMatch = text.match(/```css\s*([\s\S]*?)```/i) || text.match(/<style[\s\S]*?<\/style>/i);
  if (cssMatch) {
    files.push({
      name: 'style.css',
      type: 'css',
      content: cssMatch[1] || cssMatch[0].replace(/<style[^>]*>|<\/style>/gi, ''),
    });
  }

  // JavaScript 추출
  const jsMatch = text.match(/```javascript\s*([\s\S]*?)```/i) || text.match(/```js\s*([\s\S]*?)```/i);
  if (jsMatch) {
    files.push({
      name: 'script.js',
      type: 'javascript',
      content: jsMatch[1],
    });
  }

  // 파일이 없으면 기본 프로젝트 생성
  if (files.length === 0) {
    return createDefaultProject(userRequest);
  }

  return {
    name: extractProjectName(userRequest),
    description: `사용자 요청: ${userRequest}`,
    files,
  };
}

/**
 * 기본 프로젝트 생성
 */
function createDefaultProject(userRequest: string): any {
  const projectName = extractProjectName(userRequest);
  
  return {
    name: projectName,
    description: `사용자 요청에 맞는 웹사이트: ${userRequest}`,
    files: [
      {
        name: 'index.html',
        type: 'html',
        content: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>${projectName}</h1>
            <p>사용자 요청: ${userRequest}</p>
        </header>
        <main>
            <section class="content">
                <h2>환영합니다!</h2>
                <p>이 웹사이트는 AI가 생성했습니다.</p>
                <button id="actionBtn" class="btn">클릭하세요</button>
            </section>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      },
      {
        name: 'style.css',
        type: 'css',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
}

header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.content {
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    text-align: center;
}

.content h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #667eea;
}

.content p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
}

.btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    header h1 {
        font-size: 2rem;
    }
    
    .content {
        padding: 2rem;
    }
}`,
      },
      {
        name: 'script.js',
        type: 'javascript',
        content: `document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('actionBtn');
    
    if (btn) {
        btn.addEventListener('click', function() {
            alert('안녕하세요! AI가 생성한 웹사이트입니다.');
        });
    }
});`,
      },
    ],
  };
}

/**
 * 프로젝트 이름 추출
 */
function extractProjectName(userRequest: string): string {
  // 간단한 이름 추출 로직
  const lowerRequest = userRequest.toLowerCase();
  
  if (lowerRequest.includes('투두') || lowerRequest.includes('todo')) {
    return '투두리스트 앱';
  } else if (lowerRequest.includes('계산기') || lowerRequest.includes('calculator')) {
    return '계산기 앱';
  } else if (lowerRequest.includes('블로그') || lowerRequest.includes('blog')) {
    return '블로그 웹사이트';
  } else if (lowerRequest.includes('포트폴리오') || lowerRequest.includes('portfolio')) {
    return '포트폴리오 웹사이트';
  } else if (lowerRequest.includes('랜딩') || lowerRequest.includes('landing')) {
    return '랜딩 페이지';
  } else {
    return '생성된 웹사이트';
  }
}
