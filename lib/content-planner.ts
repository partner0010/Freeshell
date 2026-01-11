/**
 * 1단계: 콘텐츠 기획 AI
 * 역할: 콘텐츠 전략 기획자
 * 
 * 입력:
 * - 타겟 독자
 * - 목적 (유입, 전환, 브랜딩)
 * - 플랫폼
 * 
 * 출력:
 * - 콘텐츠 주제 5개
 * - 각 주제별 핵심 메시지
 * - 금지해야 할 표현 리스트
 */

import { generateGeminiResponse } from './gemini';

export interface ContentPlan {
  topics: Array<{
    title: string;
    coreMessage: string;
    targetAudience: string;
    purpose: string;
  }>;
  forbiddenExpressions: string[];
  platform: string;
  targetAudience: string;
  purpose: string;
}

export async function planContent(
  targetAudience: string,
  purpose: 'traffic' | 'conversion' | 'branding',
  platform: string,
  additionalInfo?: string
): Promise<ContentPlan> {
  const purposeMap = {
    traffic: '유입',
    conversion: '전환',
    branding: '브랜딩',
  };

  const prompt = `당신은 "콘텐츠 전략 기획자"입니다.

**입력 정보**:
- 타겟 독자: ${targetAudience}
- 목적: ${purposeMap[purpose]}
- 플랫폼: ${platform}
${additionalInfo ? `- 추가 정보: ${additionalInfo}` : ''}

**당신의 역할**: 콘텐츠를 작성하지 마세요. 기획 정보만 제공하세요.

**다음 JSON 형식으로만 응답하세요**:
{
  "topics": [
    {
      "title": "콘텐츠 주제 (구체적)",
      "coreMessage": "핵심 메시지 (한 문장)",
      "targetAudience": "타겟 독자",
      "purpose": "${purposeMap[purpose]}"
    }
  ],
  "forbiddenExpressions": ["금지할 표현1", "금지할 표현2"],
  "platform": "${platform}",
  "targetAudience": "${targetAudience}",
  "purpose": "${purposeMap[purpose]}"
}

**중요 규칙**:
1. topics 배열에 정확히 5개의 주제를 제공하세요
2. 각 주제는 구체적이고 실현 가능해야 합니다
3. forbiddenExpressions에는 플랫폼 정책 위반 표현, 클리셰 표현, 추상적 표현을 포함하세요
4. 실제 글은 작성하지 마세요. 기획 정보만 제공하세요`;

  const apiKey = process.env.GOOGLE_API_KEY || '';
  const response = await generateGeminiResponse(prompt, apiKey);

  // JSON 추출
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const plan = JSON.parse(jsonMatch[0]) as ContentPlan;
      
      // 기본값 보장
      if (!plan.topics || plan.topics.length !== 5) {
        // 기본 주제 생성
        plan.topics = Array.from({ length: 5 }, (_, i) => ({
          title: `주제 ${i + 1}`,
          coreMessage: '핵심 메시지',
          targetAudience,
          purpose: purposeMap[purpose],
        }));
      }
      
      if (!plan.forbiddenExpressions) {
        plan.forbiddenExpressions = ['추상적 표현', '클리셰', '과장된 표현'];
      }
      
      return plan;
    } catch (error) {
      console.error('[Content Planner] JSON 파싱 실패:', error);
    }
  }

  // 폴백: 기본 기획 반환
  return {
    topics: Array.from({ length: 5 }, (_, i) => ({
      title: `주제 ${i + 1}`,
      coreMessage: '핵심 메시지를 여기에 작성하세요',
      targetAudience,
      purpose: purposeMap[purpose],
    })),
    forbiddenExpressions: ['추상적 표현', '클리셰', '과장된 표현'],
    platform,
    targetAudience,
    purpose: purposeMap[purpose],
  };
}

