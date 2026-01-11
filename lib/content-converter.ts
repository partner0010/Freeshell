/**
 * 5단계: 플랫폼 변환 AI
 * 역할: 멀티 플랫폼 콘텐츠 편집자
 * 
 * 입력:
 * - 최종 콘텐츠
 * - 변환 대상 플랫폼
 * 
 * 출력:
 * - 플랫폼에 맞게 분리된 콘텐츠
 * - 글자 수 제한 준수
 * - 해시태그 제안
 */

import { generateGeminiResponse } from './gemini';
import { ImprovedContent } from './content-improver';

export interface PlatformContent {
  platform: string;
  content: string;
  hashtags: string[];
  characterCount: number;
  wordCount: number;
  formatted: string; // 최종 포맷팅된 버전 (해시태그 포함)
}

export async function convertToPlatform(
  improvedContent: ImprovedContent,
  targetPlatform: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread',
  originalPlatform?: string
): Promise<PlatformContent> {
  const platformConstraints = {
    'youtube-script': {
      maxChars: Infinity,
      description: 'YouTube 스크립트 형식 (시간표 포함)',
      hashtagCount: 0,
    },
    'blog-post': {
      maxChars: Infinity,
      description: '블로그 포스트 형식 (SEO 최적화)',
      hashtagCount: 0,
    },
    'sns-post': {
      maxChars: 500,
      description: 'SNS 게시물 (페이스북/링크드인)',
      hashtagCount: 5,
    },
    'instagram-caption': {
      maxChars: 2200,
      description: 'Instagram 캡션 (해시태그 포함)',
      hashtagCount: 10,
    },
    'twitter-thread': {
      maxChars: 280,
      description: 'Twitter 스레드 (각 트윗 280자 이내)',
      hashtagCount: 3,
    },
  };

  const constraint = platformConstraints[targetPlatform];

  const prompt = `당신은 "멀티 플랫폼 콘텐츠 편집자"입니다.

**원본 콘텐츠**:
${improvedContent.content}

**변환 대상 플랫폼**: ${targetPlatform} (${constraint.description})
**글자 수 제한**: ${constraint.maxChars === Infinity ? '제한 없음' : `${constraint.maxChars}자 이내`}
**해시태그 개수**: ${constraint.hashtagCount}개

**변환 규칙**:
${targetPlatform === 'youtube-script' ? `
- 시간표 포함 (예: [0:00-0:15] 도입부)
- 자연스러운 말투 유지
- 시각적 요소 제안 포함` : ''}
${targetPlatform === 'blog-post' ? `
- H2, H3 제목 포함
- SEO 키워드 자연스럽게 배치
- 읽기 쉬운 단락 구성` : ''}
${targetPlatform === 'sns-post' ? `
- 첫 문장이 강력해야 함
- 이모지 적절히 활용
- 간결하고 임팩트 있게
- 500자 이내` : ''}
${targetPlatform === 'instagram-caption' ? `
- 감성적이고 스토리텔링 방식
- 줄바꿈으로 가독성 향상
- 이모지 활용
- 해시태그는 별도 라인에
- 2200자 이내` : ''}
${targetPlatform === 'twitter-thread' ? `
- 각 트윗 280자 이내
- 번호 표시 (1/5, 2/5 등)
- 각 트윗은 독립적으로도 읽을 수 있어야 함
- 5-10개 트윗으로 구성` : ''}

**다음 JSON 형식으로 응답하세요**:
{
  "platform": "${targetPlatform}",
  "content": "플랫폼에 맞게 변환된 콘텐츠",
  "hashtags": ["해시태그1", "해시태그2"],
  "characterCount": 500,
  "wordCount": 80,
  "formatted": "최종 포맷팅된 버전 (해시태그 포함, 플랫폼별 형식 적용)"
}

**중요 규칙**:
1. 원본의 핵심 메시지는 유지
2. 글자 수 제한 절대 준수
3. 플랫폼별 형식 규칙 준수
4. 해시태그는 관련성 높고 트렌딩 가능한 것 우선
5. 실제 게시 가능한 수준으로 완성`;

  const apiKey = process.env.GOOGLE_API_KEY || '';
  const response = await generateGeminiResponse(prompt, apiKey);

  // JSON 추출
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const converted = JSON.parse(jsonMatch[0]) as PlatformContent;
      
      // 기본값 보장
      if (!converted.hashtags) {
        converted.hashtags = [];
      }
      
      // 글자 수 확인 및 조정
      const actualCharCount = converted.content.length;
      converted.characterCount = actualCharCount;
      
      if (constraint.maxChars !== Infinity && actualCharCount > constraint.maxChars) {
        // 글자 수 초과 시 자르기
        converted.content = converted.content.substring(0, constraint.maxChars - 3) + '...';
        converted.characterCount = constraint.maxChars;
      }
      
      converted.wordCount = converted.content.replace(/\s+/g, ' ').trim().split(' ').length;
      
      // 포맷팅된 버전 생성
      if (!converted.formatted) {
        if (targetPlatform === 'instagram-caption') {
          converted.formatted = `${converted.content}\n\n${converted.hashtags.map(tag => `#${tag}`).join(' ')}`;
        } else if (targetPlatform === 'twitter-thread') {
          // 스레드 형식으로 포맷팅
          const tweets = converted.content.split(/\n\n+/).filter(t => t.trim());
          converted.formatted = tweets.map((tweet, i) => `${i + 1}/${tweets.length} ${tweet}`).join('\n\n');
        } else {
          converted.formatted = converted.content;
        }
      }
      
      return converted;
    } catch (error) {
      console.error('[Content Converter] JSON 파싱 실패:', error);
    }
  }

  // 폴백: 원본을 그대로 반환하되 제한 적용
  let content = improvedContent.content;
  if (constraint.maxChars !== Infinity && content.length > constraint.maxChars) {
    content = content.substring(0, constraint.maxChars - 3) + '...';
  }

  return {
    platform: targetPlatform,
    content,
    hashtags: [],
    characterCount: content.length,
    wordCount: content.replace(/\s+/g, ' ').trim().split(' ').length,
    formatted: content,
  };
}

