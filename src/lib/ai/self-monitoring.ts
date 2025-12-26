/**
 * 자기 모니터링 및 평가 시스템
 * AI가 자신의 성능을 모니터링하고 평가하는 시스템
 */

import { multiModelManager } from './multi-model-manager';
import { selfLearningSystem } from './self-learning';

export interface SelfAssessment {
  id: string;
  timestamp: Date;
  performance: {
    accuracy: number;
    efficiency: number;
    reliability: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  actionPlan: string[];
}

export interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  trend: 'improving' | 'declining' | 'stable';
  history: Array<{ date: Date; value: number }>;
}

class SelfMonitoringSystem {
  private assessments: SelfAssessment[] = [];
  private metrics: Map<string, PerformanceMetric> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMetrics();
    this.startMonitoring();
  }

  /**
   * 메트릭 초기화
   */
  private initializeMetrics(): void {
    this.metrics.set('accuracy', {
      name: '정확도',
      value: 0.5,
      target: 0.9,
      trend: 'stable',
      history: [],
    });

    this.metrics.set('efficiency', {
      name: '효율성',
      value: 0.5,
      target: 0.8,
      trend: 'stable',
      history: [],
    });

    this.metrics.set('reliability', {
      name: '신뢰성',
      value: 0.5,
      target: 0.9,
      trend: 'stable',
      history: [],
    });

    this.metrics.set('learning_rate', {
      name: '학습 속도',
      value: 0.1,
      target: 0.3,
      trend: 'stable',
      history: [],
    });
  }

  /**
   * 모니터링 시작
   */
  private startMonitoring(): void {
    // 1시간마다 자기 평가 수행
    this.monitoringInterval = setInterval(() => {
      this.performSelfAssessment();
    }, 3600000); // 1시간
  }

  /**
   * 자기 평가 수행
   */
  async performSelfAssessment(): Promise<SelfAssessment> {
    const learningStats = selfLearningSystem.getLearningStats();
    const performanceAnalysis = selfLearningSystem.analyzePerformance();

    const prompt = `다음은 AI 시스템의 현재 상태입니다:

학습 통계:
- 총 경험: ${learningStats.totalExperiences}
- 총 패턴: ${learningStats.totalPatterns}
- 평균 성능: ${learningStats.averagePerformance.toFixed(2)}
- 성능 추세: ${performanceAnalysis.trend}

성능 메트릭:
${Array.from(this.metrics.values()).map(m => 
  `- ${m.name}: ${m.value.toFixed(2)} (목표: ${m.target.toFixed(2)})`
).join('\n')}

자신의 성능을 평가하고 다음 형식으로 응답:
{
  "performance": {
    "accuracy": 0.0-1.0,
    "efficiency": 0.0-1.0,
    "reliability": 0.0-1.0,
    "overall": 0.0-1.0
  },
  "strengths": ["강점1", "강점2"],
  "weaknesses": ["약점1", "약점2"],
  "recommendations": ["권장사항1", "권장사항2"],
  "actionPlan": ["행동 계획1", "행동 계획2"]
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 AI 자기 평가 전문가입니다. 객관적이고 정확하게 평가하세요.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      const assessment: SelfAssessment = {
        id: `assessment-${Date.now()}`,
        timestamp: new Date(),
        performance: data.performance,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        recommendations: data.recommendations || [],
        actionPlan: data.actionPlan || [],
      };

      this.assessments.push(assessment);
      
      // 최근 100개만 유지
      if (this.assessments.length > 100) {
        this.assessments.shift();
      }

      // 메트릭 업데이트
      this.updateMetrics(assessment);

      // 약점이 있으면 자동 개선
      if (assessment.weaknesses.length > 0) {
        await this.triggerSelfImprovement(assessment);
      }

      return assessment;
    } catch (error) {
      console.error('자기 평가 실패:', error);
      return this.getDefaultAssessment();
    }
  }

  /**
   * 성능 기록 (간단한 버전)
   */
  async recordPerformance(params: {
    task: string;
    performance: number;
    timestamp: Date;
  }): Promise<void> {
    // 메트릭 업데이트를 위한 간단한 기록
    const metricKey = params.task.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, {
        name: params.task,
        value: params.performance,
        target: 0.9,
        trend: 'stable',
        history: [],
      });
    }
    
    const metric = this.metrics.get(metricKey)!;
    metric.value = params.performance;
    metric.history.push({ date: params.timestamp, value: params.performance });
    
    // 최근 50개만 유지
    if (metric.history.length > 50) {
      metric.history.shift();
    }
    
    // 추세 계산
    metric.trend = this.calculateTrend(metric.history);
  }

  /**
   * 메트릭 업데이트
   */
  private updateMetrics(assessment: SelfAssessment): void {
    const now = new Date();
    
    // 정확도
    const accuracyMetric = this.metrics.get('accuracy')!;
    accuracyMetric.value = assessment.performance.accuracy;
    accuracyMetric.history.push({ date: now, value: assessment.performance.accuracy });
    if (accuracyMetric.history.length > 50) accuracyMetric.history.shift();
    accuracyMetric.trend = this.calculateTrend(accuracyMetric.history);

    // 효율성
    const efficiencyMetric = this.metrics.get('efficiency')!;
    efficiencyMetric.value = assessment.performance.efficiency;
    efficiencyMetric.history.push({ date: now, value: assessment.performance.efficiency });
    if (efficiencyMetric.history.length > 50) efficiencyMetric.history.shift();
    efficiencyMetric.trend = this.calculateTrend(efficiencyMetric.history);

    // 신뢰성
    const reliabilityMetric = this.metrics.get('reliability')!;
    reliabilityMetric.value = assessment.performance.reliability;
    reliabilityMetric.history.push({ date: now, value: assessment.performance.reliability });
    if (reliabilityMetric.history.length > 50) reliabilityMetric.history.shift();
    reliabilityMetric.trend = this.calculateTrend(reliabilityMetric.history);
  }

  /**
   * 추세 계산
   */
  private calculateTrend(history: Array<{ date: Date; value: number }>): 'improving' | 'declining' | 'stable' {
    if (history.length < 5) return 'stable';

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, h) => sum + h.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.value, 0) / older.length;

    const diff = recentAvg - olderAvg;
    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
  }

  /**
   * 자기 개선 트리거
   */
  private async triggerSelfImprovement(assessment: SelfAssessment): Promise<void> {
    const prompt = `다음 약점들이 발견되었습니다:

${assessment.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

권장사항:
${assessment.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

구체적인 개선 계획을 수립하세요. 다음 형식으로 응답:
{
  "improvements": [
    {
      "weakness": "약점",
      "action": "개선 행동",
      "expectedResult": "예상 결과",
      "priority": "high|medium|low"
    }
  ]
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 AI 자기 개선 전문가입니다. 구체적이고 실행 가능한 개선 계획을 수립하세요.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      // 개선 사항을 학습 시스템에 전달
      for (const improvement of data.improvements || []) {
        await selfLearningSystem.learnFromExperience({
          task: `자기 개선: ${improvement.weakness}`,
          input: { weakness: improvement.weakness },
          output: { action: improvement.action },
          success: false, // 아직 실행 전
          performance: 0.5,
          patterns: ['self_improvement', improvement.weakness],
          improvements: [improvement.action],
        });
      }
    } catch (error) {
      console.error('자기 개선 계획 수립 실패:', error);
    }
  }

  /**
   * 기본 평가
   */
  private getDefaultAssessment(): SelfAssessment {
    return {
      id: `default-${Date.now()}`,
      timestamp: new Date(),
      performance: {
        accuracy: 0.5,
        efficiency: 0.5,
        reliability: 0.5,
        overall: 0.5,
      },
      strengths: [],
      weaknesses: ['평가 데이터 부족'],
      recommendations: ['더 많은 경험을 쌓으세요'],
      actionPlan: ['계속 학습하세요'],
    };
  }

  /**
   * 현재 상태 조회
   */
  getCurrentStatus(): {
    metrics: PerformanceMetric[];
    latestAssessment: SelfAssessment | null;
    trends: Record<string, 'improving' | 'declining' | 'stable'>;
  } {
    return {
      metrics: Array.from(this.metrics.values()),
      latestAssessment: this.assessments.length > 0 ? this.assessments[this.assessments.length - 1] : null,
      trends: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([key, metric]) => [key, metric.trend])
      ),
    };
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export const selfMonitoringSystem = new SelfMonitoringSystem();

