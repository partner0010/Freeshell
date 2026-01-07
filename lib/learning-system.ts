/**
 * 실시간 학습 시스템
 * 사용자 피드백을 통해 AI가 지속적으로 개선
 */

export interface LearningData {
  id: string;
  prompt: string;
  response: string;
  feedback: {
    rating?: number; // 1-5
    helpful?: boolean;
    accurate?: boolean;
    comments?: string;
  };
  metadata: {
    mode?: string;
    source?: string;
    timestamp: number;
  };
  improvements?: string[];
}

// 전역 학습 데이터 저장소
declare global {
  var __learningData: LearningData[];
}

if (!global.__learningData) {
  global.__learningData = [];
}

export class LearningSystem {
  /**
   * 학습 데이터 저장
   */
  saveLearningData(data: Omit<LearningData, 'id'>): string {
    const id = `learning-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const learningData: LearningData = {
      id,
      ...data,
    };

    global.__learningData.push(learningData);
    
    // 최대 1000개까지만 저장
    if (global.__learningData.length > 1000) {
      global.__learningData = global.__learningData.slice(-1000);
    }

    console.log('[LearningSystem] 학습 데이터 저장:', {
      id,
      hasFeedback: !!data.feedback.rating || !!data.feedback.helpful,
    });

    return id;
  }

  /**
   * 피드백 기반 개선 사항 분석
   */
  analyzeImprovements(): {
    commonIssues: string[];
    suggestions: string[];
    patterns: Record<string, number>;
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const patterns: Record<string, number> = {};

    // 낮은 평점 데이터 분석
    const lowRated = global.__learningData.filter(
      d => d.feedback.rating && d.feedback.rating < 3
    );

    if (lowRated.length > 0) {
      issues.push(`${lowRated.length}개의 낮은 평점 응답 발견`);
      
      // 공통 패턴 찾기
      lowRated.forEach(data => {
        if (data.metadata.mode) {
          patterns[data.metadata.mode] = (patterns[data.metadata.mode] || 0) + 1;
        }
      });
    }

    // 부정적 피드백 분석
    const negativeFeedback = global.__learningData.filter(
      d => d.feedback.helpful === false || d.feedback.accurate === false
    );

    if (negativeFeedback.length > 0) {
      issues.push(`${negativeFeedback.length}개의 부정적 피드백 발견`);
      
      // 개선 제안
      if (negativeFeedback.some(d => !d.feedback.accurate)) {
        suggestions.push('정확성 개선 필요: 더 신뢰할 수 있는 정보 소스 활용');
      }
      if (negativeFeedback.some(d => !d.feedback.helpful)) {
        suggestions.push('유용성 개선 필요: 더 실용적이고 구체적인 답변 제공');
      }
    }

    return {
      commonIssues: issues,
      suggestions,
      patterns,
    };
  }

  /**
   * 유사한 과거 응답 찾기
   */
  findSimilarResponses(prompt: string, limit: number = 5): LearningData[] {
    const promptLower = prompt.toLowerCase();
    const similar: Array<{ data: LearningData; score: number }> = [];

    for (const data of global.__learningData) {
      const dataPromptLower = data.prompt.toLowerCase();
      
      // 간단한 유사도 계산 (키워드 매칭)
      const promptWords = promptLower.split(/\s+/);
      const dataWords = dataPromptLower.split(/\s+/);
      const commonWords = promptWords.filter(w => dataWords.includes(w));
      const score = commonWords.length / Math.max(promptWords.length, dataWords.length);

      if (score > 0.3) { // 30% 이상 유사
        similar.push({ data, score });
      }
    }

    // 점수 순으로 정렬
    similar.sort((a, b) => b.score - a.score);

    return similar.slice(0, limit).map(s => s.data);
  }

  /**
   * 학습 통계
   */
  getStats(): {
    totalData: number;
    withFeedback: number;
    averageRating: number;
    improvementAreas: string[];
  } {
    const withFeedback = global.__learningData.filter(
      d => d.feedback.rating || d.feedback.helpful !== undefined
    );

    const ratings = global.__learningData
      .filter(d => d.feedback.rating)
      .map(d => d.feedback.rating!);

    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    const improvements = this.analyzeImprovements();

    return {
      totalData: global.__learningData.length,
      withFeedback: withFeedback.length,
      averageRating: Math.round(averageRating * 10) / 10,
      improvementAreas: improvements.suggestions,
    };
  }

  /**
   * 피드백 기반 응답 개선
   */
  improveResponse(originalPrompt: string, originalResponse: string): string {
    // 유사한 과거 응답 찾기
    const similar = this.findSimilarResponses(originalPrompt, 3);
    
    // 높은 평점 응답의 패턴 분석
    const highRated = similar.filter(d => 
      d.feedback.rating && d.feedback.rating >= 4
    );

    if (highRated.length > 0) {
      // 높은 평점 응답의 특징을 반영
      const improvements = this.analyzeImprovements();
      
      if (improvements.suggestions.length > 0) {
        return `${originalResponse}\n\n[개선 사항]\n${improvements.suggestions.join('\n')}`;
      }
    }

    return originalResponse;
  }
}

export const learningSystem = new LearningSystem();

