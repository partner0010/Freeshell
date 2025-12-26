/**
 * 크로스 기능 학습 시스템
 * 한 AI 기능의 학습 경험이 다른 기능에도 도움이 되도록
 * Cross-Feature Learning System
 */

import { selfLearningSystem } from './self-learning';
import { knowledgeGraph } from './knowledge-graph';
import { multiModelManager } from './multi-model-manager';

export interface CrossFeaturePattern {
  id: string;
  sourceFeature: string;
  targetFeature: string;
  pattern: string;
  transferability: number; // 0-1, 전이 가능성
  effectiveness: number; // 0-1, 효과성
  usageCount: number;
  lastUsed: Date;
}

export interface FeatureSimilarity {
  feature1: string;
  feature2: string;
  similarity: number; // 0-1
  sharedPatterns: string[];
}

class CrossFeatureLearningSystem {
  private crossPatterns: Map<string, CrossFeaturePattern> = new Map();
  private featureSimilarities: Map<string, FeatureSimilarity> = new Map();

  /**
   * 다른 기능의 학습 경험에서 패턴 추출 및 전이
   */
  async transferLearning(
    sourceFeature: string,
    targetFeature: string,
    experience: any
  ): Promise<CrossFeaturePattern | null> {
    // 유사도 계산
    const similarity = await this.calculateFeatureSimilarity(sourceFeature, targetFeature);
    
    if (similarity < 0.3) {
      return null; // 유사도가 너무 낮으면 전이하지 않음
    }

    // 전이 가능한 패턴 추출
    const transferablePattern = await this.extractTransferablePattern(
      sourceFeature,
      targetFeature,
      experience,
      similarity
    );

    if (!transferablePattern) {
      return null;
    }

    // 패턴 저장
    const key = `${sourceFeature}-${targetFeature}-${transferablePattern.pattern}`;
    const existing = this.crossPatterns.get(key);
    
    if (existing) {
      existing.usageCount++;
      existing.lastUsed = new Date();
      // 효과성 업데이트
      existing.effectiveness = (existing.effectiveness * 0.9) + (transferablePattern.effectiveness * 0.1);
    } else {
      this.crossPatterns.set(key, transferablePattern);
    }

    // 지식 그래프에 저장
    await knowledgeGraph.addNode({
      type: 'pattern',
      content: `크로스 기능 패턴: ${sourceFeature} → ${targetFeature}`,
      metadata: {
        sourceFeature,
        targetFeature,
        pattern: transferablePattern.pattern,
        transferability: transferablePattern.transferability,
      },
      connections: [],
      confidence: transferablePattern.effectiveness,
    });

    return transferablePattern;
  }

  /**
   * 기능 간 유사도 계산
   */
  private async calculateFeatureSimilarity(
    feature1: string,
    feature2: string
  ): Promise<number> {
    const key = `${feature1}-${feature2}`;
    const reverseKey = `${feature2}-${feature1}`;
    
    // 캐시 확인
    const cached = this.featureSimilarities.get(key) || this.featureSimilarities.get(reverseKey);
    if (cached) {
      return cached.similarity;
    }

    // AI로 유사도 계산
    const prompt = `다음 두 AI 기능의 유사도를 분석하세요:

기능 1: ${feature1}
기능 2: ${feature2}

다음 형식으로 응답:
{
  "similarity": 0.0-1.0,
  "sharedPatterns": ["공통 패턴1", "공통 패턴2"],
  "reasoning": "유사도 계산 근거"
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 AI 기능 분석 전문가입니다. 기능 간 유사도를 정확히 계산하세요.',
        { primaryModel: 'gpt-4-turbo', temperature: 0.3 }
      );

      const data = JSON.parse(response.content);
      
      const similarity: FeatureSimilarity = {
        feature1,
        feature2,
        similarity: data.similarity || 0.5,
        sharedPatterns: data.sharedPatterns || [],
      };

      this.featureSimilarities.set(key, similarity);
      return similarity.similarity;
    } catch (error) {
      console.error('유사도 계산 오류:', error);
      return 0.5; // 기본값
    }
  }

  /**
   * 전이 가능한 패턴 추출
   */
  private async extractTransferablePattern(
    sourceFeature: string,
    targetFeature: string,
    experience: any,
    similarity: number
  ): Promise<CrossFeaturePattern | null> {
    const prompt = `다음 학습 경험에서 다른 기능으로 전이 가능한 패턴을 추출하세요:

소스 기능: ${sourceFeature}
타겟 기능: ${targetFeature}
유사도: ${similarity}
경험: ${JSON.stringify(experience, null, 2)}

다음 형식으로 응답:
{
  "pattern": "전이 가능한 패턴 설명",
  "transferability": 0.0-1.0,
  "effectiveness": 0.0-1.0,
  "adaptation": "타겟 기능에 맞게 어떻게 적용할지"
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 전이 학습 전문가입니다. 패턴을 정확히 추출하고 전이 가능성을 평가하세요.',
        { primaryModel: 'gpt-4-turbo', temperature: 0.4 }
      );

      const data = JSON.parse(response.content);
      
      return {
        id: `cross-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sourceFeature,
        targetFeature,
        pattern: data.pattern,
        transferability: data.transferability || similarity,
        effectiveness: data.effectiveness || 0.5,
        usageCount: 1,
        lastUsed: new Date(),
      };
    } catch (error) {
      console.error('패턴 추출 오류:', error);
      return null;
    }
  }

  /**
   * 관련 기능의 학습 패턴 조회
   */
  async getRelevantPatterns(feature: string, task: string): Promise<CrossFeaturePattern[]> {
    const relevant: CrossFeaturePattern[] = [];

    for (const pattern of this.crossPatterns.values()) {
      if (pattern.targetFeature === feature) {
        // 패턴이 작업과 관련 있는지 확인
        if (task.includes(pattern.pattern) || pattern.pattern.includes(task)) {
          relevant.push(pattern);
        }
      }
    }

    // 효과성과 사용 횟수로 정렬
    return relevant.sort((a, b) => 
      (b.effectiveness * b.usageCount) - (a.effectiveness * a.usageCount)
    );
  }

  /**
   * 학습 경험 공유 (간단한 인터페이스)
   */
  async shareExperience(sourceFeature: string, experience: {
    task: string;
    output: any;
    success: boolean;
    performance: number;
  }): Promise<void> {
    // propagateLearning을 호출하여 모든 기능에 전파
    await this.propagateLearning(sourceFeature, experience);
  }

  /**
   * 모든 기능에 학습 경험 전파
   */
  async propagateLearning(sourceFeature: string, experience: any): Promise<void> {
    const allFeatures = [
      'autonomous_agent',
      'code_review',
      'vulnerability_scan',
      'penetration_test',
      'web_search',
      'code_execution',
      'multimodal_ai',
      'recommendation',
      'anomaly_detection',
    ];

    for (const targetFeature of allFeatures) {
      if (targetFeature === sourceFeature) continue;

      try {
        await this.transferLearning(sourceFeature, targetFeature, experience);
      } catch (error) {
        console.error(`전이 학습 오류 (${sourceFeature} → ${targetFeature}):`, error);
      }
    }
  }

  /**
   * 통계 조회
   */
  getStats(): {
    totalCrossPatterns: number;
    topTransfers: CrossFeaturePattern[];
    featureSimilarities: FeatureSimilarity[];
  } {
    const topTransfers = Array.from(this.crossPatterns.values())
      .sort((a, b) => (b.effectiveness * b.transferability) - (a.effectiveness * a.transferability))
      .slice(0, 10);

    return {
      totalCrossPatterns: this.crossPatterns.size,
      topTransfers,
      featureSimilarities: Array.from(this.featureSimilarities.values()),
    };
  }
}

export const crossFeatureLearning = new CrossFeatureLearningSystem();

