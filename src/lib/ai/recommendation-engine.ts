/**
 * AI 추천 시스템
 * AI Recommendation Engine
 * 자기 학습 시스템 통합: 추천 결과에서 학습하여 추천 정확도 향상
 */

import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';

export interface Recommendation {
  id: string;
  type: 'feature' | 'template' | 'optimization' | 'tutorial';
  title: string;
  description: string;
  priority: number; // 1-10
  confidence: number; // 0-1
  action?: () => void;
}

export interface UserBehavior {
  featureUsage: Map<string, number>;
  recentActions: string[];
  preferences: string[];
}

// AI 추천 시스템
export class RecommendationEngine {
  private behavior: UserBehavior = {
    featureUsage: new Map(),
    recentActions: [],
    preferences: [],
  };

  // 행동 기록
  trackAction(action: string): void {
    this.behavior.recentActions.unshift(action);
    this.behavior.recentActions = this.behavior.recentActions.slice(0, 50);

    const count = this.behavior.featureUsage.get(action) || 0;
    this.behavior.featureUsage.set(action, count + 1);
  }

  // 선호도 업데이트
  updatePreferences(preferences: string[]): void {
    this.behavior.preferences = preferences;
  }

  // 추천 생성
  generateRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 사용 패턴 분석
    const mostUsed = Array.from(this.behavior.featureUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 관련 기능 추천
    mostUsed.forEach(([feature, count]) => {
      if (count > 5) {
        recommendations.push({
          id: `rec-${feature}-1`,
          type: 'feature',
          title: `${feature} 관련 기능`,
          description: `${feature}를 자주 사용하시네요. 관련 기능을 추천드립니다.`,
          priority: 8,
          confidence: 0.8,
        });
      }
    });

    // 최적화 추천
    recommendations.push({
      id: 'rec-optimize-1',
      type: 'optimization',
      title: '성능 최적화',
      description: '번들 크기를 20% 줄일 수 있습니다',
      priority: 7,
      confidence: 0.9,
    });

    // 튜토리얼 추천
    if (this.behavior.recentActions.length < 10) {
      recommendations.push({
        id: 'rec-tutorial-1',
        type: 'tutorial',
        title: '시작하기 튜토리얼',
        description: '플랫폼 사용법을 배워보세요',
        priority: 9,
        confidence: 0.95,
      });
    }

    const finalRecommendations = recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);

    // 자기 학습: 추천 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'recommendation_generation',
      input: { behavior: this.behavior },
      output: { recommendations: finalRecommendations },
      success: finalRecommendations.length > 0,
      performance: finalRecommendations.reduce((sum, r) => sum + r.confidence, 0) / finalRecommendations.length,
      patterns: finalRecommendations.map(r => r.type),
      improvements: [],
    }).catch(err => console.error('추천 시스템 학습 오류:', err));

    // 자기 모니터링: 성능 추적
    const avgConfidence = finalRecommendations.reduce((sum, r) => sum + r.confidence, 0) / finalRecommendations.length;
    selfMonitoringSystem.recordPerformance({
      task: 'recommendation_generation',
      performance: avgConfidence,
      timestamp: new Date(),
    }).catch(err => console.error('성능 모니터링 오류:', err));

    return finalRecommendations;
  }

  // 맞춤형 대시보드 제안
  suggestDashboardLayout(): string[] {
    const suggestions: string[] = [];

    // 자주 사용하는 기능
    const topFeatures = Array.from(this.behavior.featureUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([feature]) => feature);

    suggestions.push(...topFeatures);

    return suggestions;
  }
}

export const recommendationEngine = new RecommendationEngine();

