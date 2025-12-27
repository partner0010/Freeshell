/**
 * AI 채팅 API
 * 무료 AI API 연동 (Hugging Face, Cohere 등)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateUserInput } from '@/lib/security/xss-protection';

// 무료 AI API 목록 (우선순위 순)
const AI_PROVIDERS = [
  {
    name: 'Hugging Face',
    url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    apiKey: process.env.HUGGINGFACE_API_KEY,
  },
  {
    name: 'Cohere',
    url: 'https://api.cohere.ai/v1/generate',
    apiKey: process.env.COHERE_API_KEY,
  },
  {
    name: 'Together AI',
    url: 'https://api.together.xyz/v1/completions',
    apiKey: process.env.TOGETHER_API_KEY,
  },
];

export async function POST(request: NextRequest) {
  try {
    const { message, conversation } = await request.json();

    // XSS 방어: 입력값 검증
    const messageValidation = validateUserInput(message, {
      maxLength: 5000,
      allowHtml: false,
      required: true,
    });

    if (!messageValidation.valid) {
      return NextResponse.json(
        { error: messageValidation.error || '메시지 검증 실패' },
        { status: 400 }
      );
    }

    const sanitizedMessage = messageValidation.sanitized;

    if (!sanitizedMessage || !sanitizedMessage.trim()) {
      return NextResponse.json(
        { error: '메시지를 입력하세요.' },
        { status: 400 }
      );
    }

    // 무료 AI API로 응답 생성 시도
    let response = null;
    let lastError = null;

    // 1. API 키가 있는 제공자 시도
    for (const provider of AI_PROVIDERS) {
      if (!provider.apiKey) continue;

      try {
        if (provider.name === 'Hugging Face') {
          // 대화 기록도 검증
          const safeConversation = Array.isArray(conversation) 
            ? conversation.map((c: any) => ({
                role: c.role,
                content: validateUserInput(c.content, { maxLength: 2000 }).sanitized,
              }))
            : [];

          const hfResponse = await fetch(provider.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${provider.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: {
                past_user_inputs: safeConversation
                  .filter((c: any) => c.role === 'user')
                  .slice(-5)
                  .map((c: any) => c.content),
                generated_responses: safeConversation
                  .filter((c: any) => c.role === 'assistant')
                  .slice(-5)
                  .map((c: any) => c.content),
                text: sanitizedMessage,
              },
            }),
          });

          if (hfResponse.ok) {
            const data = await hfResponse.json();
            if (data.generated_text) {
              response = data.generated_text;
              break;
            }
          }
        } else if (provider.name === 'Cohere') {
          const cohereResponse = await fetch(provider.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${provider.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: sanitizedMessage,
              max_tokens: 200,
              temperature: 0.7,
            }),
          });

          if (cohereResponse.ok) {
            const data = await cohereResponse.json();
            if (data.generations && data.generations[0]) {
              response = data.generations[0].text;
              break;
            }
          }
        } else if (provider.name === 'Together AI') {
          const togetherResponse = await fetch(provider.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${provider.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'togethercomputer/RedPajama-INCITE-7B-Instruct',
              prompt: sanitizedMessage,
              max_tokens: 200,
              temperature: 0.7,
            }),
          });

          if (togetherResponse.ok) {
            const data = await togetherResponse.json();
            if (data.choices && data.choices[0]) {
              response = data.choices[0].text;
              break;
            }
          }
        }
      } catch (error: any) {
        lastError = error;
        continue;
      }
    }

    // 2. API 키가 없으면 무료 공개 API 시도 (Hugging Face Inference API - 일부 모델은 키 없이 사용 가능)
    if (!response) {
      try {
        // Hugging Face Inference API (공개 모델, API 키 불필요)
          const hfPublicResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: sanitizedMessage,
              parameters: {
                max_length: 100,
                temperature: 0.7,
              },
            }),
          });

        if (hfPublicResponse.ok) {
          const hfData = await hfPublicResponse.json();
          if (hfData && hfData[0] && hfData[0].generated_text) {
            response = hfData[0].generated_text.replace(message, '').trim();
            if (response && response.length > 10) {
              // 응답이 유효하면 사용
            } else {
              response = null;
            }
          }
        }
      } catch (error) {
        // 무료 API 실패는 무시하고 기본 응답 사용
        console.debug('무료 API 시도 실패:', error);
      }
    }

    // 3. API 응답이 없으면 스마트 기본 응답 생성
    if (!response) {
      response = generateDefaultResponse(sanitizedMessage);
    }

    // 도메인별 학습 시스템에 상호작용 기록
    try {
      const { domainLearningSystem } = await import('@/lib/ai/domain-specific-learning');
      domainLearningSystem.recordInteraction('chat', {
        action: 'chat',
        input: sanitizedMessage,
        output: response.trim(),
        feedback: undefined,
      });
    } catch (error) {
      console.error('학습 기록 실패:', error);
    }

    return NextResponse.json({
      success: true,
      response: response.trim(),
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('AI Chat API error:', error);
    }
    return NextResponse.json(
      { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 기본 응답 생성 (API가 없을 때)
function generateDefaultResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  const trimmedMessage = message.trim();

  // 인사말
  if (lowerMessage.includes('안녕') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return '안녕하세요! 무엇을 도와드릴까요?';
  }

  // 도움말
  if (lowerMessage.includes('도움') || lowerMessage.includes('help')) {
    return 'Freeshell에서 다양한 AI 기능을 사용할 수 있습니다:\n- AI 검색\n- 이미지 생성\n- 영상 생성\n- 텍스트 생성\n- 코드 생성\n\n어떤 기능을 사용하고 싶으신가요?';
  }

  // 기능 안내
  if (lowerMessage.includes('기능') || lowerMessage.includes('feature')) {
    return 'Freeshell의 주요 기능:\n1. AI 검색 - 질문에 답변\n2. 이미지 생성 - AI로 이미지 만들기\n3. 영상 생성 - 텍스트에서 영상 만들기\n4. 텍스트 생성 - 블로그, 글쓰기\n5. 코드 생성 - AI로 코드 작성\n\n더 자세한 정보가 필요하시면 말씀해주세요!';
  }

  // 문학/책 관련 질문
  if (lowerMessage.includes('이상한 나라') || lowerMessage.includes('고양이') || lowerMessage.includes('alice')) {
    if (lowerMessage.includes('이상한 나라의 고양이') || lowerMessage.includes('alice in wonderland')) {
      return `"이상한 나라의 고양이"는 루이스 캐럴(Lewis Carroll)의 소설 "이상한 나라의 앨리스(Alice's Adventures in Wonderland)"를 가리키는 것 같습니다! 🐱✨\n\n이 작품은 1865년에 출간된 판타지 소설로, 앨리스라는 소녀가 토끼 굴에 빠져 이상한 나라로 떨어지는 모험을 그린 이야기입니다.\n\n주요 등장인물:\n- 앨리스: 주인공 소녀\n- 체셔 고양이: 신비로운 미소를 지닌 고양이\n- 화이트 래빗: 시계를 들고 다니는 토끼\n- 미친 모자장수: 차 파티를 여는 인물\n- 하트 여왕: "목을 베어라!"를 외치는 여왕\n\n이 작품에 대해 더 궁금한 점이 있으시면 물어보세요!`;
    }
  }

  // 일반적인 질문 패턴 감지
  const questionPatterns = [
    { pattern: /^(.+)\?$|^(.+)인가요|^(.+)인가\?|^(.+)일까요|^(.+)일까\?/, response: (msg: string) => 
      `"${msg}"에 대한 질문이시군요! 이 주제에 대해 더 자세히 설명해드릴 수 있습니다.\n\n구체적으로 어떤 부분이 궁금하신가요? 예를 들어:\n- 배경이나 역사\n- 주요 특징이나 개념\n- 실제 사용 예시\n- 관련 정보\n\n더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다!` },
    { pattern: /^(.+)이란|^(.+)란|^(.+)은|^(.+)는/, response: (msg: string) => 
      `"${msg}"에 대해 설명해드리겠습니다.\n\n이 주제는 흥미로운 내용입니다. 더 자세한 정보를 원하시면 구체적으로 어떤 부분이 궁금하신지 알려주세요.\n\n예를 들어:\n- 정의나 개념\n- 사용 방법\n- 예시나 사례\n- 관련 정보\n\n어떤 부분을 더 알고 싶으신가요?` },
  ];

  for (const { pattern, response } of questionPatterns) {
    if (pattern.test(trimmedMessage)) {
      return response(trimmedMessage);
    }
  }

  // 개발 언어 관련 질문 감지 및 답변
  const codeResponse = generateCodeResponse(message);
  if (codeResponse) {
    return codeResponse;
  }

  // 일반적인 응답 생성
  return generateSmartResponse(message);
}

// 스마트 응답 생성 (키워드 기반)
function generateSmartResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // 주제별 응답 생성
  const topicResponses: Array<{ keywords: string[], response: string }> = [
    {
      keywords: ['날씨', 'weather', '비', '눈', '맑음'],
      response: '날씨에 대해 물어보셨네요! 현재 위치 기반 날씨 정보를 제공하려면 위치 정보가 필요합니다. 또는 특정 지역의 날씨를 알려주시면 더 정확한 정보를 드릴 수 있습니다.'
    },
    {
      keywords: ['시간', 'time', '지금', '현재'],
      response: `현재 시간은 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}입니다.`
    },
    {
      keywords: ['고양이', 'cat', '강아지', 'dog', '동물', 'animal'],
      response: '동물에 대해 물어보셨네요! 🐱🐶\n\n동물에 대한 정보나 이야기를 원하시면 구체적으로 어떤 동물이나 주제에 대해 궁금하신지 알려주세요. 예를 들어:\n- 특정 동물의 특징\n- 반려동물 키우기\n- 동물 관련 이야기\n\n어떤 내용이 궁금하신가요?'
    },
    {
      keywords: ['음식', 'food', '먹', '요리', 'cooking'],
      response: '음식에 대해 물어보셨네요! 🍽️\n\n음식 관련 정보나 레시피를 원하시면 구체적으로 어떤 음식이나 요리에 대해 궁금하신지 알려주세요.'
    },
    {
      keywords: ['영화', 'movie', '드라마', 'drama', '영상'],
      response: '영화나 드라마에 대해 물어보셨네요! 🎬\n\n특정 작품이나 장르에 대해 궁금하시면 알려주세요. 추천이나 정보를 제공해드릴 수 있습니다.'
    },
    {
      keywords: ['음악', 'music', '노래', 'song', '가수'],
      response: '음악에 대해 물어보셨네요! 🎵\n\n특정 아티스트, 장르, 또는 노래에 대해 궁금하시면 알려주세요.'
    },
    {
      keywords: ['여행', 'travel', '여행지', '관광'],
      response: '여행에 대해 물어보셨네요! ✈️\n\n어떤 지역이나 여행지에 대해 궁금하신가요? 추천이나 정보를 제공해드릴 수 있습니다.'
    },
  ];

  for (const { keywords, response } of topicResponses) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return response;
    }
  }

  // 기본 응답 - 모든 질문에 답변 (더 친절하고 유용하게)
  return generateUniversalResponse(message);
}

// 범용 응답 생성 - 모든 질문에 답변
function generateUniversalResponse(message: string): string {
  const trimmed = message.trim();
  
  // 질문 분석
  const isQuestion = trimmed.endsWith('?') || trimmed.endsWith('？') || 
                     /^(무엇|어떤|어디|언제|누가|왜|어떻게|어느)/.test(trimmed);
  
  // 주제 추출 시도
  const topics = extractTopics(trimmed);
  
  // 맥락 기반 응답 생성
  if (isQuestion) {
    return `"${trimmed}"에 대한 질문이시군요! 🤔\n\n이 주제에 대해 제가 알고 있는 내용을 공유해드리겠습니다:\n\n${generateContextualAnswer(trimmed, topics)}\n\n더 구체적인 정보가 필요하시면 다음을 알려주세요:\n- 어떤 측면이 궁금하신지\n- 구체적인 사용 사례\n- 관련 배경 지식\n\nFreeshell의 AI 기능도 활용해보세요:\n- 📝 텍스트 생성으로 더 자세한 내용 작성\n- 🖼️ 이미지 생성으로 시각화\n- 🎬 영상 생성으로 콘텐츠 제작\n- 💻 코드 생성으로 구현\n\n추가로 도움이 필요하시면 언제든지 말씀해주세요! 😊`;
  }
  
  // 일반적인 문장이나 키워드에 대한 응답
  return `"${trimmed}"에 대해 말씀해주셨네요! 💭\n\n${generateContextualAnswer(trimmed, topics)}\n\n이 주제와 관련해서:\n- 더 자세한 설명이 필요하시면 질문해주세요\n- 실용적인 예시나 사용법을 알려드릴 수 있습니다\n- 관련된 다른 주제도 함께 알아볼 수 있습니다\n\nFreeshell의 다양한 기능을 활용하면 더 풍부한 콘텐츠를 만들 수 있습니다. 어떤 도움이 필요하신가요? ✨`;
}

// 주제 추출
function extractTopics(message: string): string[] {
  const topics: string[] = [];
  const lower = message.toLowerCase();
  
  // 일반적인 주제 키워드
  const topicKeywords = [
    '프로그래밍', '코딩', '개발', '소프트웨어', '앱', '웹', '사이트',
    '디자인', '예술', '그림', '사진', '영화', '음악', '책', '문학',
    '과학', '수학', '물리', '화학', '생물', '역사', '지리',
    '요리', '음식', '건강', '운동', '여행', '언어', '학습',
    '비즈니스', '경제', '금융', '마케팅', '경영',
    '기술', 'AI', '인공지능', '머신러닝', '데이터',
    '게임', '스포츠', '취미', '라이프스타일'
  ];
  
  for (const keyword of topicKeywords) {
    if (lower.includes(keyword)) {
      topics.push(keyword);
    }
  }
  
  return topics;
}

// 맥락 기반 답변 생성
function generateContextualAnswer(message: string, topics: string[]): string {
  const lower = message.toLowerCase();
  
  // 주제별 기본 정보 제공
  if (topics.length > 0) {
    const topic = topics[0];
    
    if (topic.includes('프로그래밍') || topic.includes('코딩') || topic.includes('개발')) {
      return `프로그래밍과 관련된 주제네요! 💻\n\n프로그래밍은 컴퓨터에게 명령을 내려 원하는 작업을 수행하게 하는 기술입니다. 다양한 프로그래밍 언어와 프레임워크를 사용하여 웹사이트, 앱, 소프트웨어 등을 만들 수 있습니다.\n\n주요 프로그래밍 언어:\n- JavaScript/TypeScript: 웹 개발\n- Python: 데이터 분석, AI\n- Java: 엔터프라이즈 애플리케이션\n- C++: 시스템 프로그래밍\n\n구체적으로 어떤 언어나 기술에 대해 알고 싶으신가요?`;
    }
    
    if (topic.includes('AI') || topic.includes('인공지능')) {
      return `인공지능에 대한 주제네요! 🤖\n\n인공지능(AI)은 컴퓨터가 인간의 지능을 모방하여 학습하고 판단하는 기술입니다. 머신러닝, 딥러닝, 자연어 처리 등 다양한 분야가 있습니다.\n\nAI의 활용 분야:\n- 이미지/음성 인식\n- 자연어 처리 및 챗봇\n- 추천 시스템\n- 자율주행\n- 의료 진단\n\nFreeshell도 AI 기술을 활용하여 다양한 콘텐츠를 생성합니다!`;
    }
    
    if (topic.includes('디자인') || topic.includes('예술')) {
      return `디자인과 예술에 대한 주제네요! 🎨\n\n디자인은 기능성과 미적 가치를 결합하여 사용자 경험을 향상시키는 창의적인 작업입니다. UI/UX 디자인, 그래픽 디자인, 산업 디자인 등 다양한 분야가 있습니다.\n\n디자인 원칙:\n- 사용자 중심 설계\n- 시각적 균형과 조화\n- 색상과 타이포그래피\n- 반응형 디자인\n\nFreeshell의 이미지 생성 기능으로 창의적인 디자인을 만들어보세요!`;
    }
  }
  
  // 일반적인 맥락 기반 응답
  return `이 주제는 흥미로운 내용입니다. 제가 알고 있는 정보를 바탕으로 도움을 드리겠습니다.\n\n일반적으로 이 주제와 관련해서는:\n- 기본 개념과 정의\n- 실제 활용 사례\n- 관련 기술이나 방법론\n- 최신 트렌드와 동향\n\n등에 대해 이야기할 수 있습니다. 구체적으로 어떤 부분이 궁금하신지 알려주시면 더 정확한 답변을 드릴 수 있습니다.`;
}

// 코드 관련 응답 생성
function generateCodeResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // JavaScript/TypeScript
  if (lowerMessage.includes('javascript') || lowerMessage.includes('js ') || lowerMessage.includes('typescript') || lowerMessage.includes('ts ')) {
    if (lowerMessage.includes('배열') || lowerMessage.includes('array')) {
      return `JavaScript 배열 사용법:\n\n\`\`\`javascript\n// 배열 생성\nconst arr = [1, 2, 3];\n\n// 배열 메서드\nconst doubled = arr.map(x => x * 2);\nconst filtered = arr.filter(x => x > 1);\nconst sum = arr.reduce((acc, x) => acc + x, 0);\n\n// ES6+ 스프레드 연산자\nconst newArr = [...arr, 4, 5];\n\`\`\``;
    }
    if (lowerMessage.includes('비동기') || lowerMessage.includes('async') || lowerMessage.includes('await')) {
      return `JavaScript 비동기 처리:\n\n\`\`\`javascript\n// async/await 사용\nasync function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n\n// Promise 체이닝\nfetch('/api/data')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));\n\`\`\``;
    }
  }

  // React
  if (lowerMessage.includes('react')) {
    if (lowerMessage.includes('컴포넌트') || lowerMessage.includes('component')) {
      return `React 컴포넌트 작성:\n\n\`\`\`tsx\n// 함수형 컴포넌트\nfunction MyComponent({ name }: { name: string }) {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <h1>Hello, {name}!</h1>\n      <button onClick={() => setCount(count + 1)}>\n        Count: {count}\n      </button>\n    </div>\n  );\n}\n\n// 커스텀 훅\nfunction useCounter(initialValue = 0) {\n  const [count, setCount] = useState(initialValue);\n  const increment = () => setCount(count + 1);\n  const decrement = () => setCount(count - 1);\n  return { count, increment, decrement };\n}\n\`\`\``;
    }
    if (lowerMessage.includes('훅') || lowerMessage.includes('hook')) {
      return `React Hooks 사용법:\n\n\`\`\`tsx\nimport { useState, useEffect, useCallback, useMemo } from 'react';\n\nfunction MyComponent() {\n  // useState\n  const [state, setState] = useState(0);\n  \n  // useEffect\n  useEffect(() => {\n    console.log('Component mounted');\n    return () => console.log('Component unmounted');\n  }, []);\n  \n  // useCallback\n  const handleClick = useCallback(() => {\n    setState(prev => prev + 1);\n  }, []);\n  \n  // useMemo\n  const expensiveValue = useMemo(() => {\n    return state * 2;\n  }, [state]);\n  \n  return <button onClick={handleClick}>{expensiveValue}</button>;\n}\n\`\`\``;
    }
  }

  // Next.js
  if (lowerMessage.includes('nextjs') || lowerMessage.includes('next.js')) {
    return `Next.js 14 App Router 사용법:\n\n\`\`\`tsx\n// app/page.tsx\n'use client';\n\nexport default function Page() {\n  return <h1>Hello Next.js!</h1>;\n}\n\n// app/api/route.ts\nimport { NextResponse } from 'next/server';\n\nexport async function GET() {\n  return NextResponse.json({ message: 'Hello API!' });\n}\n\n// Server Components\nasync function ServerComponent() {\n  const data = await fetch('...');\n  return <div>{data}</div>;\n}\n\`\`\``;
  }

  // Python
  if (lowerMessage.includes('python') || lowerMessage.includes('py ')) {
    if (lowerMessage.includes('리스트') || lowerMessage.includes('list')) {
      return `Python 리스트 사용법:\n\n\`\`\`python\n# 리스트 생성\nmy_list = [1, 2, 3, 4, 5]\n\n# 리스트 컴프리헨션\nsquared = [x**2 for x in my_list]\nfiltered = [x for x in my_list if x > 2]\n\n# 리스트 메서드\nmy_list.append(6)\nmy_list.extend([7, 8])\nmy_list.insert(0, 0)\n\`\`\``;
    }
  }

  // 일반적인 코드 질문
  if (lowerMessage.includes('코드') || lowerMessage.includes('code') || lowerMessage.includes('프로그래밍')) {
    return `코드 작성에 도움이 필요하시군요! 구체적으로 어떤 언어나 프레임워크를 사용하시나요?\n\n지원하는 언어:\n- JavaScript/TypeScript\n- React/Next.js\n- Python\n- Java\n- 기타 여러 언어\n\n예: "React로 Todo 앱 만들기", "Python으로 API 만들기" 등으로 질문해주세요!`;
  }

  return null;
}

