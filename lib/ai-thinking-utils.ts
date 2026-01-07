/**
 * AI 사고 과정 유틸리티
 * 질문 분석, 정보 식별, 답변 생성에 필요한 도구들
 */

export interface QuestionType {
  type: 'what' | 'how' | 'why' | 'when' | 'where' | 'who' | 'comparison' | 'explanation' | 'general';
  description: string;
  requiresExamples: boolean;
  requiresSteps: boolean;
  requiresComparison: boolean;
}

export interface DataSource {
  source: string;
  priority: number;
  reason: string;
}

/**
 * 질문 유형 분석
 */
export function analyzeQuestionType(prompt: string): QuestionType {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('어떻게') || lower.includes('방법') || lower.includes('how')) {
    return {
      type: 'how',
      description: '방법론적 질문 - 단계별 가이드가 필요합니다',
      requiresExamples: true,
      requiresSteps: true,
      requiresComparison: false,
    };
  }
  
  if (lower.includes('왜') || lower.includes('이유') || lower.includes('why')) {
    return {
      type: 'why',
      description: '원인 분석 질문 - 이유와 배경 설명이 필요합니다',
      requiresExamples: false,
      requiresSteps: false,
      requiresComparison: true,
    };
  }
  
  if (lower.includes('무엇') || lower.includes('뭐') || lower.includes('what') || lower.endsWith('란?') || lower.endsWith('는?') || lower.endsWith('은?')) {
    return {
      type: 'what',
      description: '정의/개념 질문 - 명확한 정의와 설명이 필요합니다',
      requiresExamples: true,
      requiresSteps: false,
      requiresComparison: false,
    };
  }
  
  if (lower.includes('언제') || lower.includes('when')) {
    return {
      type: 'when',
      description: '시점 질문 - 시간적 정보가 필요합니다',
      requiresExamples: false,
      requiresSteps: false,
      requiresComparison: false,
    };
  }
  
  if (lower.includes('어디') || lower.includes('where')) {
    return {
      type: 'where',
      description: '위치 질문 - 공간적 정보가 필요합니다',
      requiresExamples: false,
      requiresSteps: false,
      requiresComparison: false,
    };
  }
  
  if (lower.includes('누구') || lower.includes('who')) {
    return {
      type: 'who',
      description: '인물 질문 - 사람/조직 정보가 필요합니다',
      requiresExamples: false,
      requiresSteps: false,
      requiresComparison: false,
    };
  }
  
  if (lower.includes('비교') || lower.includes('차이') || lower.includes('vs') || lower.includes('versus')) {
    return {
      type: 'comparison',
      description: '비교 질문 - 여러 항목의 비교 분석이 필요합니다',
      requiresExamples: true,
      requiresSteps: false,
      requiresComparison: true,
    };
  }
  
  return {
    type: 'general',
    description: '일반 질문 - 포괄적인 정보가 필요합니다',
    requiresExamples: true,
    requiresSteps: false,
    requiresComparison: false,
  };
}

/**
 * 필요한 정보 식별
 */
export function identifyRequiredInfo(prompt: string): string[] {
  const info: string[] = [];
  const lower = prompt.toLowerCase();
  
  if (lower.includes('코드') || lower.includes('code') || lower.includes('프로그래밍')) {
    info.push('코드 예제');
  }
  
  if (lower.includes('설치') || lower.includes('설정') || lower.includes('setup')) {
    info.push('설치/설정 방법');
  }
  
  if (lower.includes('오류') || lower.includes('에러') || lower.includes('error')) {
    info.push('오류 해결 방법');
  }
  
  if (lower.includes('최신') || lower.includes('latest') || lower.includes('2024') || lower.includes('2025')) {
    info.push('최신 정보');
  }
  
  if (lower.includes('비용') || lower.includes('가격') || lower.includes('price') || lower.includes('cost')) {
    info.push('비용 정보');
  }
  
  if (lower.includes('장점') || lower.includes('단점') || lower.includes('장단점')) {
    info.push('장단점 분석');
  }
  
  if (lower.includes('예제') || lower.includes('example') || lower.includes('샘플')) {
    info.push('실제 예제');
  }
  
  if (lower.includes('비교') || lower.includes('차이')) {
    info.push('비교 분석');
  }
  
  if (info.length === 0) {
    info.push('기본 정보', '상세 설명', '활용 방법');
  }
  
  return info;
}

/**
 * 핵심 포인트 추출
 */
export function extractKeyPoints(prompt: string): string {
  // 불필요한 단어 제거
  const stopWords = ['에', '를', '을', '의', '이', '가', '은', '는', '에 대해', '에 대한', '에 관해', '에 관하여'];
  let cleaned = prompt;
  
  stopWords.forEach(word => {
    cleaned = cleaned.replace(new RegExp(word, 'gi'), '');
  });
  
  // 핵심 키워드 추출 (2-10자 단어)
  const words = cleaned.split(/\s+/).filter(w => w.length >= 2 && w.length <= 10);
  
  return words.slice(0, 5).join(', ') || prompt.substring(0, 50);
}

/**
 * 데이터 수집 계획 수립
 */
export function planDataCollection(
  prompt: string,
  questionType: QuestionType,
  requiredInfo: string[]
): DataSource[] {
  const sources: DataSource[] = [];
  
  // Google Gemini API (최우선)
  sources.push({
    source: 'Google Gemini',
    priority: 1,
    reason: '고품질 AI 응답 생성',
  });
  
  // 웹 검색이 필요한 경우
  if (requiredInfo.some(info => info.includes('최신') || info.includes('비용') || info.includes('비교'))) {
    sources.push({
      source: 'Web Search',
      priority: 2,
      reason: '최신 정보 수집',
    });
  }
  
  // 이미지가 필요한 경우
  if (prompt.toLowerCase().includes('이미지') || prompt.toLowerCase().includes('사진') || prompt.toLowerCase().includes('그림')) {
    sources.push({
      source: 'Image Search',
      priority: 3,
      reason: '시각적 자료 수집',
    });
  }
  
  return sources;
}

/**
 * 최적화된 프롬프트 생성
 */
export function generateOptimizedPrompt(
  originalPrompt: string,
  questionType: QuestionType,
  requiredInfo: string[]
): string {
  let optimized = originalPrompt;
  
  // 질문 유형에 따른 프롬프트 최적화
  if (questionType.type === 'how') {
    optimized = `${originalPrompt}\n\n단계별로 자세히 설명하고, 각 단계마다 구체적인 예제를 포함해주세요.`;
  } else if (questionType.type === 'why') {
    optimized = `${originalPrompt}\n\n주요 이유들을 우선순위별로 나열하고, 각 이유에 대한 상세한 설명을 제공해주세요.`;
  } else if (questionType.type === 'what') {
    optimized = `${originalPrompt}\n\n명확한 정의를 제공하고, 실제 활용 사례와 예제를 포함해주세요.`;
  } else if (questionType.type === 'comparison') {
    optimized = `${originalPrompt}\n\n비교 항목들을 표로 정리하고, 각 항목의 장단점을 상세히 분석해주세요.`;
  }
  
  // 필요한 정보 추가
  if (requiredInfo.length > 0) {
    optimized += `\n\n다음 정보를 반드시 포함해주세요: ${requiredInfo.join(', ')}`;
  }
  
  return optimized;
}

