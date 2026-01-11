/**
 * 3단계: 초안 생성 AI
 * 역할: 초안 작성자
 * 
 * 입력:
 * - 구조 정보
 * - 핵심 메시지
 * - 금지 표현 리스트
 * 
 * 출력:
 * - 자연스러운 초안
 * - AI 특유 반복 제거
 * - 과장 표현 금지
 */

import { generateGeminiResponse } from './gemini';
import { ContentStructure } from './content-structurer';
import { ContentPlan } from './content-planner';

export interface ContentDraft {
  content: string;
  wordCount: number;
  readability: 'high' | 'medium' | 'low';
  issues: string[]; // 발견된 문제점
}

export async function draftContent(
  structure: ContentStructure,
  plan: ContentPlan,
  contentType: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread'
): Promise<ContentDraft> {
  const platformInstructions = {
    'youtube-script': `
**YouTube 스크립트 작성 규칙**:
- 자연스러운 말투로 작성
- 시각적 요소 제안 포함 (B-roll, 그래픽 등)
- 시간표 포함 (예: [0:00-0:15] 도입부)
- 시청자에게 직접 말하듯 작성`,
    'blog-post': `
**블로그 포스트 작성 규칙**:
- SEO 키워드를 자연스럽게 포함
- H2, H3 제목 사용
- 읽기 쉬운 단락 구성
- 실용적인 예시 포함`,
    'sns-post': `
**SNS 게시물 작성 규칙**:
- 첫 문장이 강력해야 함
- 단락 간 이모지 활용
- 간결하고 임팩트 있게
- 200-300자 이내`,
    'instagram-caption': `
**Instagram 캡션 작성 규칙**:
- 감성적이고 스토리텔링 방식
- 줄바꿈으로 가독성 향상
- 이모지 적절히 활용
- 150-300자 이내`,
    'twitter-thread': `
**Twitter 스레드 작성 규칙**:
- 각 트윗 280자 이내
- 번호를 매겨 순서 표시 (1/5, 2/5 등)
- 각 트윗은 독립적으로도 읽을 수 있어야 함
- 5-10개 트윗으로 구성`,
  };

  const prompt = `당신은 "초안 작성자"입니다.

**입력 정보**:
- 제목: ${structure.title}
- 인트로 훅: ${structure.introHook}
- 본문 구조:
${structure.bodyStructure.map((section, i) => `
섹션 ${i + 1}: ${section.section}
- 주요 포인트: ${section.bullets.join(', ')}
- 핵심 내용: ${section.keyPoints.join(', ')}
`).join('')}
- CTA 위치: ${structure.ctaLocation}
- CTA 텍스트: ${structure.ctaText}

**금지 표현**:
${plan.forbiddenExpressions.map(expr => `- ${expr}`).join('\n')}

${platformInstructions[contentType]}

**작성 규칙**:
1. 자연스러운 사람 말투로 작성
2. AI 특유의 반복 문장 금지
3. 과장된 표현 금지
4. 금지 표현 리스트 절대 사용 금지
5. 구조를 따라 실제 사용 가능한 콘텐츠 작성
6. 구체적인 예시와 실용적인 정보 포함

**중요**: 구조를 기반으로 실제로 사용할 수 있는 완전한 초안을 작성하세요. 단순히 구조를 나열하지 말고, 자연스러운 문장으로 연결하세요.

지금 바로 초안을 작성해주세요.`;

  const apiKey = process.env.GOOGLE_API_KEY || '';
  let content = await generateGeminiResponse(prompt, apiKey);

  // AI 특유 반복 제거 (간단한 휴리스틱)
  const repetitivePatterns = [
    /(.*?)(\1{2,})/g, // 같은 문장 반복
    /(또한|그리고|그래서|그런데).*?(또한|그리고|그래서|그런데)/g, // 접속어 반복
  ];

  let issues: string[] = [];
  
  // 반복 문장 감지
  if (content.match(repetitivePatterns[0])) {
    issues.push('반복되는 문장이 감지되었습니다.');
  }
  
  // 금지 표현 체크
  for (const forbidden of plan.forbiddenExpressions) {
    if (content.includes(forbidden)) {
      issues.push(`금지 표현 "${forbidden}"이 포함되어 있습니다.`);
    }
  }

  // 과장 표현 체크
  const exaggeratedPatterns = ['최고의', '완벽한', '무조건', '100%', '절대적으로'];
  for (const pattern of exaggeratedPatterns) {
    if (content.includes(pattern)) {
      issues.push(`과장된 표현 "${pattern}"이 포함되어 있습니다.`);
    }
  }

  const wordCount = content.replace(/\s+/g, ' ').trim().split(' ').length;
  
  // 가독성 평가 (간단한 휴리스틱)
  const avgSentenceLength = content.split(/[.!?]/).filter(s => s.trim()).reduce((acc, s) => acc + s.split(' ').length, 0) / content.split(/[.!?]/).filter(s => s.trim()).length;
  const readability: 'high' | 'medium' | 'low' = avgSentenceLength < 15 ? 'high' : avgSentenceLength < 25 ? 'medium' : 'low';

  return {
    content,
    wordCount,
    readability,
    issues,
  };
}

