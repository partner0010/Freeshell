/**
 * 예측적 학습 시스템 (Predictive Learning)
 * 미래 상황을 예측하고 사전에 학습
 */

import { selfLearningSystem } from './self-learning';
import { knowledgeGraph } from './knowledge-graph';
import { multiModelManager } from './multi-model-manager';

export interface Prediction {
  id: string;
  scenario: string;
  probability: number; // 0-1
  impact: 'high' | 'medium' | 'low';
  recommendedAction: string;
  confidence: number;
  predictedAt: Date;
}

export interface PredictivePattern {
  pattern: string;
  nextScenario: string;
  probability: number;
  historicalAccuracy: number;
}

class PredictiveLearningSystem {
  private predictions: Map<string, Prediction> = new Map();
  private patterns: Map<string, PredictivePattern> = new Map();

  /**
   * 미래 시나리오 예측
   */
  async predictFutureScenarios(
    currentContext: Record<string, any>,
    feature: string
  ): Promise<Prediction[]> {
    const prompt = `다음 상황에서 예상되는 미래 시나리오를 예측하세요:

현재 컨텍스트: ${JSON.stringify(currentContext, null, 2)}
기능: ${feature}

다음 형식으로 응답:
{
  "scenarios": [
    {
      "scenario": "예상 시나리오 설명",
      "probability": 0.0-1.0,
      "impact": "high|medium|low",
      "recommendedAction": "권장 행동",
      "confidence": 0.0-1.0
    }
  ]
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 예측 분석 전문가입니다. 미래 시나리오를 정확히 예측하세요.',
        { primaryModel: 'gpt-4-turbo', temperature: 0.4 }
      );

      const data = JSON.parse(response.content);
      const predictions: Prediction[] = (data.scenarios || []).map((s: any) => ({
        id: `pred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        scenario: s.scenario,
        probability: s.probability || 0.5,
        impact: s.impact || 'medium',
        recommendedAction: s.recommendedAction || '',
        confidence: s.confidence || 0.7,
        predictedAt: new Date(),
      }));

      // 예측 저장
      for (const prediction of predictions) {
        this.predictions.set(prediction.id, prediction);
      }

      // 높은 확률의 시나리오에 대해 사전 학습
      for (const prediction of predictions) {
        if (prediction.probability > 0.7 && prediction.impact === 'high') {
          await this.prepareForScenario(prediction, feature);
        }
      }

      return predictions;
    } catch (error) {
      console.error('예측 오류:', error);
      return [];
    }
  }

  /**
   * 시나리오 대비 사전 학습
   */
  private async prepareForScenario(
    prediction: Prediction,
    feature: string
  ): Promise<void> {
    // 관련 패턴 검색
    const relevantPatterns = await knowledgeGraph.searchSimilar(
      prediction.scenario,
      3
    );

    // 사전 학습 경험 생성
    await selfLearningSystem.learnFromExperience({
      task: `predictive_learning_${feature}`,
      input: { scenario: prediction.scenario, context: prediction },
      output: { recommendedAction: prediction.recommendedAction },
      success: true,
      performance: prediction.confidence,
      patterns: ['predictive', prediction.scenario],
      improvements: [prediction.recommendedAction],
    });
  }

  /**
   * 패턴 기반 예측
   */
  async predictFromPatterns(
    currentPattern: string,
    feature: string
  ): Promise<string | null> {
    const key = `${feature}-${currentPattern}`;
    const pattern = this.patterns.get(key);

    if (pattern && pattern.historicalAccuracy > 0.7) {
      return pattern.nextScenario;
    }

    return null;
  }

  /**
   * 예측 정확도 업데이트
   */
  updatePredictionAccuracy(predictionId: string, actualOutcome: string): void {
    const prediction = this.predictions.get(predictionId);
    if (!prediction) return;

    // 예측이 맞았는지 확인
    const accuracy = prediction.scenario.includes(actualOutcome) ||
                     actualOutcome.includes(prediction.scenario) ? 1.0 : 0.0;

    // 패턴 업데이트
    const patternKey = `${prediction.scenario}-${actualOutcome}`;
    const existing = this.patterns.get(patternKey);
    
    if (existing) {
      existing.historicalAccuracy = (existing.historicalAccuracy * 0.9) + (accuracy * 0.1);
    } else {
      this.patterns.set(patternKey, {
        pattern: prediction.scenario,
        nextScenario: actualOutcome,
        probability: prediction.probability,
        historicalAccuracy: accuracy,
      });
    }
  }

  /**
   * 통계 조회
   */
  getStats(): {
    totalPredictions: number;
    averageConfidence: number;
    topPredictions: Prediction[];
    patternAccuracy: number;
  } {
    const allPredictions = Array.from(this.predictions.values());
    const averageConfidence = allPredictions.length > 0
      ? allPredictions.reduce((sum, p) => sum + p.confidence, 0) / allPredictions.length
      : 0;

    const topPredictions = allPredictions
      .sort((a, b) => (b.probability * b.confidence) - (a.probability * a.confidence))
      .slice(0, 10);

    const allPatterns = Array.from(this.patterns.values());
    const patternAccuracy = allPatterns.length > 0
      ? allPatterns.reduce((sum, p) => sum + p.historicalAccuracy, 0) / allPatterns.length
      : 0;

    return {
      totalPredictions: allPredictions.length,
      averageConfidence,
      topPredictions,
      patternAccuracy,
    };
  }
}

export const predictiveLearning = new PredictiveLearningSystem();

