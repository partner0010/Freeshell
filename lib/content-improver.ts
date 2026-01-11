/**
 * 4단계: 품질 개선 AI
 * 역할: 콘텐츠 품질 관리자
 * 
 * 검사 항목:
 * - 의미 없는 문장 제거
 * - 반복 문단 제거
 * - 사람 말투로 수정
 * - 플랫폼 정책 위반 여부
 * 
 * 출력:
 * - 개선된 텍스트
 * - 수정 이유 요약
 */

import { generateGeminiResponse } from './gemini';
import { ContentDraft } from './content-drafter';
import { ContentPlan } from './content-planner';

export interface ImprovedContent {
  content: string;
  improvements: Array<{
    type: 'removed' | 'modified' | 'added';
    reason: string;
    before?: string;
    after?: string;
  }>;
  qualityScore: number; // 0-100
  policyCompliant: boolean;
}

export async function improveContent(
  draft: ContentDraft,
  plan: ContentPlan,
  contentType: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread'
): Promise<ImprovedContent> {
  const policyCheckpoints = {
    'youtube-script': 'YouTube 커뮤니티 가이드라인 준수',
    'blog-post': '검색 엔진 정책 및 저작권 준수',
    'sns-post': '플랫폼 커뮤니티 가이드라인 준수',
    'instagram-caption': 'Instagram 커뮤니티 가이드라인 준수',
    'twitter-thread': 'Twitter 이용약관 준수',
  };

  const prompt = `당신은 "콘텐츠 품질 관리자"입니다.

**초안 콘텐츠**:
${draft.content}

**발견된 문제점**:
${draft.issues.length > 0 ? draft.issues.map(issue => `- ${issue}`).join('\n') : '- 문제 없음'}

**플랫폼 정책**: ${policyCheckpoints[contentType]}

**금지 표현 리스트**:
${plan.forbiddenExpressions.map(expr => `- ${expr}`).join('\n')}

**당신의 작업**:
1. 의미 없는 문장 제거 (예: "이제 시작하겠습니다", "다음으로 넘어가겠습니다")
2. 반복되는 문단 제거
3. AI 특유의 표현을 사람 말투로 수정
4. 과장된 표현 완화
5. 금지 표현 제거
6. 플랫폼 정책 위반 여부 확인

**다음 JSON 형식으로 응답하세요**:
{
  "content": "개선된 콘텐츠 (전체)",
  "improvements": [
    {
      "type": "removed|modified|added",
      "reason": "수정 이유",
      "before": "수정 전 (optional)",
      "after": "수정 후 (optional)"
    }
  ],
  "qualityScore": 85,
  "policyCompliant": true
}

**중요 규칙**:
1. 초안의 핵심 내용은 유지하되 표현만 개선
2. 모든 수정 사항을 improvements 배열에 기록
3. 품질 점수는 0-100 사이 (기계적 점수, 주관적 평가 X)
4. 정책 위반 여부를 정확히 판단`;

  const apiKey = process.env.GOOGLE_API_KEY || '';
  const response = await generateGeminiResponse(prompt, apiKey);

  // JSON 추출
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const improved = JSON.parse(jsonMatch[0]) as ImprovedContent;
      
      // 기본값 보장
      if (!improved.improvements) {
        improved.improvements = [];
      }
      
      if (typeof improved.qualityScore !== 'number') {
        // 간단한 휴리스틱으로 점수 계산
        let score = 100;
        score -= draft.issues.length * 10; // 문제당 10점 감점
        score -= (draft.readability === 'low' ? 10 : draft.readability === 'medium' ? 5 : 0);
        improved.qualityScore = Math.max(0, Math.min(100, score));
      }
      
      if (typeof improved.policyCompliant !== 'boolean') {
        improved.policyCompliant = true; // 기본값
      }
      
      // 개선이 없는 경우 초안 그대로 사용
      if (!improved.content || improved.content.trim().length === 0) {
        improved.content = draft.content;
      }
      
      return improved;
    } catch (error) {
      console.error('[Content Improver] JSON 파싱 실패:', error);
    }
  }

  // 폴백: 초안을 그대로 반환하되 기본 개선 사항만 기록
  return {
    content: draft.content,
    improvements: draft.issues.map(issue => ({
      type: 'modified' as const,
      reason: issue,
    })),
    qualityScore: 100 - draft.issues.length * 10,
    policyCompliant: true,
  };
}

