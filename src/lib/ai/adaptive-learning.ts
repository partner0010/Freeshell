/**
 * 적응형 학습 시스템 (Adaptive Learning)
 * 실시간으로 학습 전략을 조정하고 최적화
 */

import { selfLearningSystem } from './self-learning';
import { metaLearningSystem } from './meta-learning';
import { crossFeatureLearning } from './cross-feature-learning';
import { reinforcementLearning } from './reinforcement-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { hyperparameterTuning } from './hyperparameter-tuning';

export interface AdaptiveStrategy {
  feature: string;
  learningRate: number;
  explorationRate: number;
  updateFrequency: 'realtime' | 'batch' | 'periodic';
  priority: number;
  lastUpdated: Date;
}

export interface PerformanceTarget {
  feature: string;
  targetPerformance: number;
  currentPerformance: number;
  gap: number;
  actionPlan: string[];
}

class AdaptiveLearningSystem {
  private strategies: Map<string, AdaptiveStrategy> = new Map();
  private performanceTargets: Map<string, PerformanceTarget> = new Map();
  private adaptationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeStrategies();
    this.startAdaptation();
  }

  /**
   * 전략 초기화
   */
  private initializeStrategies(): void {
    const features = [
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

    for (const feature of features) {
      this.strategies.set(feature, {
        feature,
        learningRate: 0.1,
        explorationRate: 0.2,
        updateFrequency: 'realtime',
        priority: 1.0,
        lastUpdated: new Date(),
      });
    }
  }

  /**
   * 적응 시작
   */
  private startAdaptation(): void {
    // 5분마다 전략 조정
    this.adaptationInterval = setInterval(() => {
      this.adaptStrategies();
    }, 300000); // 5분
  }

  /**
   * 전략 적응
   */
  async adaptStrategies(): Promise<void> {
    const monitoring = await selfMonitoringSystem.performSelfAssessment();
    
    for (const [feature, strategy] of this.strategies.entries()) {
      // 성능 기반 전략 조정
      const performance = this.getFeaturePerformance(feature);
      
      if (performance < 0.7) {
        // 성능이 낮으면 학습률 증가, 탐험률 증가
        strategy.learningRate = Math.min(0.3, strategy.learningRate * 1.2);
        strategy.explorationRate = Math.min(0.5, strategy.explorationRate * 1.3);
        strategy.priority = 1.5; // 우선순위 증가
        
        // 하이퍼파라미터 튜닝 트리거
        hyperparameterTuning.tuneHyperparameters(feature)
          .catch(err => console.error('하이퍼파라미터 튜닝 오류:', err));
      } else if (performance > 0.9) {
        // 성능이 높으면 학습률 감소, 탐험률 감소
        strategy.learningRate = Math.max(0.05, strategy.learningRate * 0.9);
        strategy.explorationRate = Math.max(0.05, strategy.explorationRate * 0.9);
        strategy.priority = 0.8; // 우선순위 감소
      }

      strategy.lastUpdated = new Date();
    }

    // 성능 목표 업데이트
    await this.updatePerformanceTargets();
  }

  /**
   * 기능별 성능 조회
   */
  private getFeaturePerformance(feature: string): number {
    const stats = selfLearningSystem.getLearningStats();
    // 간단한 구현: 평균 성능 사용
    return stats.averagePerformance;
  }

  /**
   * 성능 목표 업데이트
   */
  private async updatePerformanceTargets(): Promise<void> {
    for (const [feature, strategy] of this.strategies.entries()) {
      const current = this.getFeaturePerformance(feature);
      const target = 0.9; // 목표 성능

      const gap = target - current;
      const actionPlan: string[] = [];

      if (gap > 0.2) {
        actionPlan.push('학습 데이터 증가 필요');
        actionPlan.push('메타 학습 전략 재검토');
        actionPlan.push('크로스 기능 학습 활용');
      } else if (gap > 0.1) {
        actionPlan.push('학습률 조정');
        actionPlan.push('패턴 분석 강화');
      }

      this.performanceTargets.set(feature, {
        feature,
        targetPerformance: target,
        currentPerformance: current,
        gap,
        actionPlan,
      });
    }
  }

  /**
   * 최적 학습 전략 조회
   */
  getOptimalStrategy(feature: string): AdaptiveStrategy {
    return this.strategies.get(feature) || {
      feature,
      learningRate: 0.1,
      explorationRate: 0.2,
      updateFrequency: 'realtime',
      priority: 1.0,
      lastUpdated: new Date(),
    };
  }

  /**
   * 실시간 적응
   */
  async adaptInRealTime(feature: string, performance: number): Promise<void> {
    const strategy = this.strategies.get(feature);
    if (!strategy) return;

    // 성능 변화에 즉시 반응
    if (performance < 0.5) {
      // 급격한 성능 저하
      strategy.learningRate = Math.min(0.5, strategy.learningRate * 1.5);
      strategy.explorationRate = Math.min(0.7, strategy.explorationRate * 1.5);
      strategy.updateFrequency = 'realtime';
    } else if (performance > 0.95) {
      // 매우 높은 성능
      strategy.learningRate = Math.max(0.05, strategy.learningRate * 0.8);
      strategy.explorationRate = Math.max(0.05, strategy.explorationRate * 0.8);
    }

    strategy.lastUpdated = new Date();
  }

  /**
   * 통계 조회
   */
  getStats(): {
    strategies: AdaptiveStrategy[];
    performanceTargets: PerformanceTarget[];
    averageGap: number;
  } {
    const targets = Array.from(this.performanceTargets.values());
    const averageGap = targets.length > 0
      ? targets.reduce((sum, t) => sum + t.gap, 0) / targets.length
      : 0;

    return {
      strategies: Array.from(this.strategies.values()),
      performanceTargets: targets,
      averageGap,
    };
  }
}

export const adaptiveLearning = new AdaptiveLearningSystem();

