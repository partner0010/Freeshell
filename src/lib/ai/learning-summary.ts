/**
 * 학습 시스템 통합 요약 및 통계
 * Learning Systems Integration Summary
 */

import { selfLearningSystem } from './self-learning';
import { metaLearningSystem } from './meta-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { selfImprovementSystem } from './self-improvement';
import { crossFeatureLearning } from './cross-feature-learning';
import { reinforcementLearning } from './reinforcement-learning';
import { adaptiveLearning } from './adaptive-learning';
import { predictiveLearning } from './predictive-learning';
import { hyperparameterTuning } from './hyperparameter-tuning';

export interface LearningSystemSummary {
  totalExperiences: number;
  totalPatterns: number;
  averagePerformance: number;
  crossFeatureTransfers: number;
  reinforcementActions: number;
  adaptiveStrategies: number;
  predictions: number;
  hyperparameterConfigs: number;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * 전체 학습 시스템 통계 조회
 */
export async function getLearningSystemSummary(): Promise<LearningSystemSummary> {
  const selfLearningStats = selfLearningSystem.getLearningStats();
  const crossFeatureStats = crossFeatureLearning.getStats();
  const reinforcementStats = reinforcementLearning.getStats();
  const adaptiveStats = adaptiveLearning.getStats();
  const predictiveStats = predictiveLearning.getStats();
  const hyperparameterStats = hyperparameterTuning.getStats();

  const averagePerformance = selfLearningStats.averagePerformance;
  
  let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
  if (averagePerformance >= 0.9) {
    overallHealth = 'excellent';
  } else if (averagePerformance >= 0.7) {
    overallHealth = 'good';
  } else if (averagePerformance >= 0.5) {
    overallHealth = 'fair';
  } else {
    overallHealth = 'poor';
  }

  return {
    totalExperiences: selfLearningStats.totalExperiences,
    totalPatterns: selfLearningStats.totalPatterns + crossFeatureStats.totalCrossPatterns,
    averagePerformance,
    crossFeatureTransfers: crossFeatureStats.totalCrossPatterns,
    reinforcementActions: reinforcementStats.totalPolicies,
    adaptiveStrategies: adaptiveStats.strategies.length,
    predictions: predictiveStats.totalPredictions,
    hyperparameterConfigs: hyperparameterStats.totalConfigs,
    overallHealth,
  };
}

/**
 * 학습 시스템 상태 확인
 */
export function checkLearningSystemHealth(): {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  const selfLearningStats = selfLearningSystem.getLearningStats();
  const adaptiveStats = adaptiveLearning.getStats();

  // 경험 부족
  if (selfLearningStats.totalExperiences < 100) {
    issues.push('학습 경험이 부족합니다');
    recommendations.push('더 많은 작업을 수행하여 경험을 쌓으세요');
  }

  // 성능 저하
  if (selfLearningStats.averagePerformance < 0.7) {
    issues.push('평균 성능이 낮습니다');
    recommendations.push('하이퍼파라미터 튜닝을 수행하세요');
  }

  // 적응형 학습 갭
  if (adaptiveStats.averageGap > 0.2) {
    issues.push('성능 목표와의 차이가 큽니다');
    recommendations.push('학습 전략을 재검토하세요');
  }

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (issues.length > 2) {
    status = 'critical';
  } else if (issues.length > 0) {
    status = 'warning';
  }

  return {
    status,
    issues,
    recommendations,
  };
}

