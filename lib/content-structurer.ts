/**
 * 2단계: 콘텐츠 구조 AI
 * 역할: 콘텐츠 편집자
 * 
 * 입력:
 * - 선택된 주제
 * - 플랫폼
 * - 핵심 메시지
 * 
 * 출력:
 * - 콘텐츠 흐름
 * - 인트로 훅
 * - 본문 구조 (불릿)
 * - CTA 위치
 */

import { generateGeminiResponse } from './gemini';

export interface ContentStructure {
  title: string;
  introHook: string;
  bodyStructure: Array<{
    section: string;
    bullets: string[];
    keyPoints: string[];
  }>;
  ctaLocation: 'middle' | 'end' | 'both';
  ctaText: string;
  estimatedLength: number; // 단어 수 또는 글자 수
}

export async function structureContent(
  topic: string,
  coreMessage: string,
  platform: string,
  contentType: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread'
): Promise<ContentStructure> {
  const platformConstraints = {
    'youtube-script': '영상 스크립트 (5-10분 분량)',
    'blog-post': '블로그 포스트 (1000-2000자)',
    'sns-post': 'SNS 게시물 (200-300자)',
    'instagram-caption': 'Instagram 캡션 (150-300자)',
    'twitter-thread': 'Twitter 스레드 (각 트윗 280자 이내, 5-10개)',
  };

  const prompt = `당신은 "콘텐츠 편집자"입니다.

**입력 정보**:
- 주제: ${topic}
- 핵심 메시지: ${coreMessage}
- 플랫폼: ${platform}
- 콘텐츠 유형: ${platformConstraints[contentType]}

**당신의 역할**: 실제 문장을 작성하지 마세요. 구조만 제공하세요.

**다음 JSON 형식으로만 응답하세요**:
{
  "title": "제목 (플랫폼 최적화)",
  "introHook": "인트로 훅 (독자의 관심을 끄는 한 문장, 실제 문장 아님, 훅의 개념만)",
  "bodyStructure": [
    {
      "section": "섹션 제목",
      "bullets": ["주요 포인트1", "주요 포인트2"],
      "keyPoints": ["핵심 내용1", "핵심 내용2"]
    }
  ],
  "ctaLocation": "end",
  "ctaText": "CTA 텍스트 (실제 문장 아님, CTA의 개념만)",
  "estimatedLength": 1000
}

**중요 규칙**:
1. 실제 문장 작성 금지. 구조와 포인트만 제공
2. bodyStructure는 3-5개 섹션으로 구성
3. 각 섹션은 구체적인 불릿 포인트 포함
4. CTA 위치는 플랫폼에 맞게 결정
5. 추상적인 표현 없이 구체적인 구조만 제공`;

  const apiKey = process.env.GOOGLE_API_KEY || '';
  const response = await generateGeminiResponse(prompt, apiKey);

  // JSON 추출
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const structure = JSON.parse(jsonMatch[0]) as ContentStructure;
      
      // 기본값 보장
      if (!structure.bodyStructure || structure.bodyStructure.length === 0) {
        structure.bodyStructure = [
          {
            section: '도입부',
            bullets: ['핵심 포인트 1', '핵심 포인트 2'],
            keyPoints: ['중요 내용 1', '중요 내용 2'],
          },
          {
            section: '본문',
            bullets: ['상세 내용 1', '상세 내용 2'],
            keyPoints: ['구체적 정보 1', '구체적 정보 2'],
          },
          {
            section: '마무리',
            bullets: ['요약 포인트 1', '요약 포인트 2'],
            keyPoints: ['핵심 메시지 1', '핵심 메시지 2'],
          },
        ];
      }
      
      if (!structure.ctaLocation) {
        structure.ctaLocation = 'end';
      }
      
      if (!structure.estimatedLength) {
        structure.estimatedLength = contentType === 'twitter-thread' ? 1400 : 1000;
      }
      
      return structure;
    } catch (error) {
      console.error('[Content Structurer] JSON 파싱 실패:', error);
    }
  }

  // 폴백: 기본 구조 반환
  return {
    title: topic,
    introHook: '독자의 관심을 끄는 강력한 훅이 필요합니다',
    bodyStructure: [
      {
        section: '도입부',
        bullets: ['핵심 포인트 1', '핵심 포인트 2'],
        keyPoints: ['중요 내용 1', '중요 내용 2'],
      },
      {
        section: '본문',
        bullets: ['상세 내용 1', '상세 내용 2'],
        keyPoints: ['구체적 정보 1', '구체적 정보 2'],
      },
      {
        section: '마무리',
        bullets: ['요약 포인트 1', '요약 포인트 2'],
        keyPoints: ['핵심 메시지 1', '핵심 메시지 2'],
      },
    ],
    ctaLocation: 'end',
    ctaText: '독자에게 행동을 유도하는 CTA',
    estimatedLength: 1000,
  };
}

