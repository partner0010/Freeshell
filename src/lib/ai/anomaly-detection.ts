/**
 * AI 기반 이상 탐지 시스템
 * Machine Learning을 활용한 이상 행위 탐지
 * 자기 학습 시스템 통합: 탐지 결과에서 학습하여 탐지 정확도 향상
 */

import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { selfImprovementSystem } from './self-improvement';

export interface Anomaly {
  id: string;
  type: 'behavior' | 'performance' | 'security' | 'data';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedAt: number;
  confidence: number; // 0-100
  metrics: {
    baseline: number;
    current: number;
    deviation: number;
  };
  recommendations: string[];
}

export interface BehaviorBaseline {
  userId?: string;
  ip?: string;
  normalPatterns: {
    requestFrequency: number;
    typicalHours: number[];
    commonEndpoints: string[];
    avgResponseTime: number;
  };
  lastUpdated: number;
}

// AI 이상 탐지 시스템
export class AnomalyDetectionSystem {
  private baselines: Map<string, BehaviorBaseline> = new Map();
  private anomalies: Map<string, Anomaly> = new Map();

  // 베이스라인 학습
  learnBaseline(data: {
    userId?: string;
    ip?: string;
    events: Array<{
      timestamp: number;
      endpoint: string;
      responseTime: number;
    }>;
  }): BehaviorBaseline {
    const key = data.userId || data.ip || 'global';
    const events = data.events;

    // 정상 패턴 계산
    const requestFrequency = events.length / (24 * 60 * 60); // requests per second
    const typicalHours = this.calculateTypicalHours(events);
    const commonEndpoints = this.findCommonEndpoints(events);
    const avgResponseTime =
      events.reduce((sum, e) => sum + e.responseTime, 0) / events.length;

    const baseline: BehaviorBaseline = {
      userId: data.userId,
      ip: data.ip,
      normalPatterns: {
        requestFrequency,
        typicalHours,
        commonEndpoints,
        avgResponseTime,
      },
      lastUpdated: Date.now(),
    };

    this.baselines.set(key, baseline);
    return baseline;
  }

  private calculateTypicalHours(
    events: Array<{ timestamp: number }>
  ): number[] {
    const hourCounts = new Map<number, number>();
    events.forEach((e) => {
      const hour = new Date(e.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const avg = events.length / 24;
    return Array.from(hourCounts.entries())
      .filter(([, count]) => count > avg)
      .map(([hour]) => hour);
  }

  private findCommonEndpoints(events: Array<{ endpoint: string }>): string[] {
    const counts = new Map<string, number>();
    events.forEach((e) => {
      counts.set(e.endpoint, (counts.get(e.endpoint) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([endpoint]) => endpoint);
  }

  // 이상 탐지
  detectAnomaly(data: {
    userId?: string;
    ip?: string;
    current: {
      requestFrequency: number;
      hour: number;
      endpoint: string;
      responseTime: number;
    };
  }): Anomaly | null {
    const key = data.userId || data.ip || 'global';
    const baseline = this.baselines.get(key);

    if (!baseline) {
      // 베이스라인이 없으면 새 사용자로 간주
      return null;
    }

    const anomalies: string[] = [];
    let confidence = 0;

    // 요청 빈도 이상
    const freqDeviation =
      Math.abs(data.current.requestFrequency - baseline.normalPatterns.requestFrequency) /
      baseline.normalPatterns.requestFrequency;
    if (freqDeviation > 2) {
      anomalies.push(
        `요청 빈도가 정상보다 ${(freqDeviation * 100).toFixed(0)}% 높습니다`
      );
      confidence += 30;
    }

    // 비정상 시간대
    if (!baseline.normalPatterns.typicalHours.includes(data.current.hour)) {
      anomalies.push('비정상적인 시간대에 활동 중입니다');
      confidence += 20;
    }

    // 비정상 엔드포인트
    if (!baseline.normalPatterns.commonEndpoints.includes(data.current.endpoint)) {
      anomalies.push('평소와 다른 엔드포인트에 접근 중입니다');
      confidence += 15;
    }

    // 응답 시간 이상
    const responseDeviation =
      Math.abs(data.current.responseTime - baseline.normalPatterns.avgResponseTime) /
      baseline.normalPatterns.avgResponseTime;
    if (responseDeviation > 0.5) {
      anomalies.push('응답 시간이 정상 범위를 벗어났습니다');
      confidence += 10;
    }

    if (anomalies.length === 0) {
      return null;
    }

    const severity: Anomaly['severity'] =
      confidence >= 70 ? 'critical' : confidence >= 50 ? 'high' : 'medium';

    const anomaly: Anomaly = {
      id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'behavior',
      severity,
      description: anomalies.join(', '),
      detectedAt: Date.now(),
      confidence,
      metrics: {
        baseline: baseline.normalPatterns.requestFrequency,
        current: data.current.requestFrequency,
        deviation: freqDeviation,
      },
      recommendations: [
        '사용자 활동 확인',
        '계정 보안 상태 점검',
        '추가 인증 요구 고려',
      ],
    };

    this.anomalies.set(anomaly.id, anomaly);

    // 자기 학습: 이상 탐지 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'anomaly_detection',
      input: { data, baseline: baseline.normalPatterns },
      output: anomaly,
      success: true,
      performance: confidence / 100,
      patterns: [anomaly.type, anomaly.severity],
      improvements: anomaly.recommendations,
    }).catch(err => console.error('이상 탐지 학습 오류:', err));

    // 자기 모니터링: 성능 추적
    selfMonitoringSystem.recordPerformance({
      task: 'anomaly_detection',
      performance: confidence / 100,
      timestamp: new Date(),
    }).catch(err => console.error('성능 모니터링 오류:', err));

    // 심각한 이상이면 자기 개선 트리거
    if (anomaly.severity === 'critical') {
      selfImprovementSystem.triggerImprovement({
        issue: `심각한 이상 탐지: ${anomaly.description}`,
        context: {
          anomalyType: anomaly.type,
          confidence: anomaly.confidence,
          metrics: anomaly.metrics,
        },
      }).catch(err => console.error('자기 개선 트리거 오류:', err));
    }

    return anomaly;
  }

  getAnomalies(limit?: number): Anomaly[] {
    const anomalies = Array.from(this.anomalies.values());
    anomalies.sort((a, b) => b.detectedAt - a.detectedAt);
    return limit ? anomalies.slice(0, limit) : anomalies;
  }

  getBaseline(key: string): BehaviorBaseline | undefined {
    return this.baselines.get(key);
  }
}

export const anomalyDetectionSystem = new AnomalyDetectionSystem();

