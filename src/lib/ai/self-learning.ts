/**
 * 자기 학습 시스템 (Self-Learning)
 * AI가 스스로 학습하고 개선하는 시스템
 */

import { knowledgeGraph } from './knowledge-graph';
import { multiModelManager } from './multi-model-manager';
import { crossFeatureLearning } from './cross-feature-learning';
import { reinforcementLearning } from './reinforcement-learning';

export interface LearningExperience {
  id: string;
  task: string;
  input: any;
  output: any;
  expectedOutput?: any;
  success: boolean;
  performance: number; // 0-1
  feedback?: string;
  timestamp: Date;
  patterns: string[];
  improvements: string[];
}

export interface LearningPattern {
  id: string;
  pattern: string;
  context: string;
  successRate: number;
  usageCount: number;
  lastUsed: Date;
  effectiveness: number;
}

class SelfLearningSystem {
  private experiences: Map<string, LearningExperience> = new Map();
  private patterns: Map<string, LearningPattern> = new Map();
  private performanceHistory: Array<{ date: Date; performance: number }> = [];
  private learningRate: number = 0.1;

  /**
   * 경험 저장 및 학습
   */
  async learnFromExperience(experience: Omit<LearningExperience, 'id' | 'timestamp'>): Promise<void> {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullExperience: LearningExperience = {
      ...experience,
      id,
      timestamp: new Date(),
    };

    this.experiences.set(id, fullExperience);

    // 패턴 추출
    await this.extractPatterns(fullExperience);

    // 성능 업데이트
    this.updatePerformance(fullExperience.performance);

    // 지식 그래프에 저장
    await knowledgeGraph.saveExperience(
      experience.task,
      experience.output,
      experience.success,
      experience.improvements || []
    );

    // 자기 개선 트리거
    if (experience.performance < 0.7) {
      await this.triggerSelfImprovement(fullExperience);
    }

    // 크로스 기능 학습: 다른 기능에 경험 전파
    const featureName = this.extractFeatureName(experience.task);
    if (featureName) {
      crossFeatureLearning.propagateLearning(featureName, fullExperience)
        .catch(err => console.error('크로스 기능 학습 오류:', err));
    }

    // 강화 학습: 보상 업데이트
    if (experience.success) {
      reinforcementLearning.recordReward(
        fullExperience.id,
        experience.performance,
        `성공적인 ${experience.task} 수행`
      );
    }
  }

  /**
   * 작업에서 기능 이름 추출
   */
  private extractFeatureName(task: string): string | null {
    const featureMap: Record<string, string> = {
      'autonomous': 'autonomous_agent',
      'code_review': 'code_review',
      'vulnerability': 'vulnerability_scan',
      'penetration': 'penetration_test',
      'web_search': 'web_search',
      'code_execution': 'code_execution',
      'python_execution': 'code_execution',
      'javascript_execution': 'code_execution',
      'text_to_image': 'multimodal_ai',
      'image_to_text': 'multimodal_ai',
      'recommendation': 'recommendation',
      'anomaly': 'anomaly_detection',
      'reasoning': 'advanced_reasoning',
      'tool_execution': 'tool_system',
    };

    for (const [key, feature] of Object.entries(featureMap)) {
      if (task.toLowerCase().includes(key)) {
        return feature;
      }
    }

    return null;
  }

  /**
   * 패턴 추출
   */
  private async extractPatterns(experience: LearningExperience): Promise<void> {
    const patternPrompt = `다음 경험에서 학습할 수 있는 패턴을 추출하세요:

작업: ${experience.task}
입력: ${JSON.stringify(experience.input)}
출력: ${JSON.stringify(experience.output)}
성공: ${experience.success}
성능: ${experience.performance}

다음 형식으로 응답:
{
  "patterns": ["패턴1", "패턴2"],
  "context": "이 패턴이 적용되는 컨텍스트",
  "effectiveness": 0.0-1.0
}`;

    try {
      const response = await multiModelManager.request(
        patternPrompt,
        '당신은 패턴 인식 전문가입니다. 경험에서 유용한 패턴을 추출하세요.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      for (const patternText of data.patterns || []) {
        const patternId = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const existingPattern = this.findSimilarPattern(patternText);
        
        if (existingPattern) {
          // 기존 패턴 업데이트
          existingPattern.successRate = (existingPattern.successRate * existingPattern.usageCount + (experience.success ? 1 : 0)) / (existingPattern.usageCount + 1);
          existingPattern.usageCount++;
          existingPattern.lastUsed = new Date();
          existingPattern.effectiveness = data.effectiveness || existingPattern.effectiveness;
        } else {
          // 새 패턴 생성
          const pattern: LearningPattern = {
            id: patternId,
            pattern: patternText,
            context: data.context || '',
            successRate: experience.success ? 1.0 : 0.0,
            usageCount: 1,
            lastUsed: new Date(),
            effectiveness: data.effectiveness || 0.5,
          };
          this.patterns.set(patternId, pattern);
        }
      }
    } catch (error) {
      console.error('패턴 추출 실패:', error);
    }
  }

  /**
   * 유사한 패턴 찾기
   */
  private findSimilarPattern(patternText: string): LearningPattern | null {
    for (const pattern of this.patterns.values()) {
      // 간단한 유사도 체크 (실제로는 더 정교한 유사도 계산 필요)
      if (pattern.pattern.includes(patternText) || patternText.includes(pattern.pattern)) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * 성능 업데이트
   */
  private updatePerformance(performance: number): void {
    this.performanceHistory.push({
      date: new Date(),
      performance,
    });

    // 최근 100개만 유지
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }

  /**
   * 자기 개선 트리거
   */
  private async triggerSelfImprovement(experience: LearningExperience): Promise<void> {
    const improvementPrompt = `다음 경험에서 성능이 낮았습니다. 어떻게 개선할 수 있을까요?

작업: ${experience.task}
입력: ${JSON.stringify(experience.input)}
출력: ${JSON.stringify(experience.output)}
성능: ${experience.performance}
피드백: ${experience.feedback || '없음'}

개선 방안을 제시하세요. 다음 형식으로 응답:
{
  "improvements": ["개선 방안1", "개선 방안2"],
  "strategy": "새로운 전략",
  "expectedImprovement": 0.0-1.0
}`;

    try {
      const response = await multiModelManager.request(
        improvementPrompt,
        '당신은 AI 자기 개선 전문가입니다. 성능을 향상시킬 방법을 제시하세요.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      // 개선 사항을 경험에 추가
      experience.improvements = data.improvements || [];
      
      // 새로운 전략 저장
      if (data.strategy) {
        await this.saveStrategy(experience.task, data.strategy, data.expectedImprovement || 0.5);
      }
    } catch (error) {
      console.error('자기 개선 실패:', error);
    }
  }

  /**
   * 전략 저장
   */
  private async saveStrategy(task: string, strategy: string, expectedImprovement: number): Promise<void> {
    await knowledgeGraph.addNode({
      type: 'pattern',
      content: `전략: ${strategy}\n작업: ${task}\n예상 개선: ${expectedImprovement}`,
      metadata: {
        task,
        strategy,
        expectedImprovement,
        type: 'improvement_strategy',
      },
      connections: [],
      confidence: expectedImprovement,
    });
  }

  /**
   * 학습된 패턴 적용
   */
  async applyLearnedPatterns(task: string, context: Record<string, any>): Promise<any> {
    // 관련 패턴 검색
    const relevantPatterns = this.findRelevantPatterns(task, context);
    
    if (relevantPatterns.length === 0) {
      return null;
    }

    // 가장 효과적인 패턴 선택
    const bestPattern = relevantPatterns.sort((a, b) => 
      (b.effectiveness * b.successRate) - (a.effectiveness * a.successRate)
    )[0];

    return {
      pattern: bestPattern.pattern,
      context: bestPattern.context,
      confidence: bestPattern.effectiveness * bestPattern.successRate,
    };
  }

  /**
   * 관련 패턴 찾기
   */
  private findRelevantPatterns(task: string, context: Record<string, any>): LearningPattern[] {
    const relevant: LearningPattern[] = [];

    for (const pattern of this.patterns.values()) {
      // 간단한 키워드 매칭 (실제로는 더 정교한 매칭 필요)
      if (task.includes(pattern.context) || pattern.context.includes(task)) {
        relevant.push(pattern);
      }
    }

    return relevant;
  }

  /**
   * 성능 분석
   */
  analyzePerformance(): {
    average: number;
    trend: 'improving' | 'declining' | 'stable';
    recentAverage: number;
    recommendations: string[];
  } {
    if (this.performanceHistory.length === 0) {
      return {
        average: 0,
        trend: 'stable',
        recentAverage: 0,
        recommendations: ['더 많은 경험을 쌓아야 합니다.'],
      };
    }

    const all = this.performanceHistory.map(h => h.performance);
    const recent = all.slice(-10);
    
    const average = all.reduce((sum, p) => sum + p, 0) / all.length;
    const recentAverage = recent.reduce((sum, p) => sum + p, 0) / recent.length;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAverage > average * 1.1) {
      trend = 'improving';
    } else if (recentAverage < average * 0.9) {
      trend = 'declining';
    }

    const recommendations: string[] = [];
    if (trend === 'declining') {
      recommendations.push('최근 성능이 하락하고 있습니다. 학습 전략을 재검토하세요.');
    }
    if (average < 0.7) {
      recommendations.push('전체 성능이 낮습니다. 더 많은 학습 데이터가 필요합니다.');
    }

    return {
      average,
      trend,
      recentAverage,
      recommendations,
    };
  }

  /**
   * 학습 통계
   */
  getLearningStats(): {
    totalExperiences: number;
    totalPatterns: number;
    averagePerformance: number;
    topPatterns: LearningPattern[];
  } {
    const all = Array.from(this.experiences.values());
    const averagePerformance = all.length > 0
      ? all.reduce((sum, e) => sum + e.performance, 0) / all.length
      : 0;

    const topPatterns = Array.from(this.patterns.values())
      .sort((a, b) => (b.effectiveness * b.successRate) - (a.effectiveness * a.successRate))
      .slice(0, 5);

    return {
      totalExperiences: all.length,
      totalPatterns: this.patterns.size,
      averagePerformance,
      topPatterns,
    };
  }
}

export const selfLearningSystem = new SelfLearningSystem();

