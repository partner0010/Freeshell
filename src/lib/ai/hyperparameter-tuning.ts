/**
 * 자동 하이퍼파라미터 튜닝 시스템
 * Auto Hyperparameter Tuning System
 */

import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { multiModelManager } from './multi-model-manager';

export interface Hyperparameter {
  name: string;
  type: 'continuous' | 'discrete' | 'categorical';
  range: [number, number] | string[];
  current: any;
  best: any;
  impact: number; // 0-1, 성능에 미치는 영향
}

export interface HyperparameterConfig {
  feature: string;
  parameters: Map<string, Hyperparameter>;
  performance: number;
  lastUpdated: Date;
}

export interface TuningResult {
  config: HyperparameterConfig;
  performance: number;
  improvement: number;
  timestamp: Date;
}

class HyperparameterTuningSystem {
  private configs: Map<string, HyperparameterConfig> = new Map();
  private tuningHistory: Map<string, TuningResult[]> = new Map();
  private tuningInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultConfigs();
    this.startAutoTuning();
  }

  /**
   * 기본 설정 초기화
   */
  private initializeDefaultConfigs(): void {
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
      'advanced_reasoning',
    ];

    for (const feature of features) {
      const config: HyperparameterConfig = {
        feature,
        parameters: new Map(),
        performance: 0.5,
        lastUpdated: new Date(),
      };

      // 기본 하이퍼파라미터 설정
      config.parameters.set('learningRate', {
        name: 'learningRate',
        type: 'continuous',
        range: [0.001, 0.5],
        current: 0.1,
        best: 0.1,
        impact: 0.8,
      });

      config.parameters.set('temperature', {
        name: 'temperature',
        type: 'continuous',
        range: [0.0, 2.0],
        current: 0.7,
        best: 0.7,
        impact: 0.6,
      });

      config.parameters.set('maxTokens', {
        name: 'maxTokens',
        type: 'discrete',
        range: [100, 4000],
        current: 2000,
        best: 2000,
        impact: 0.4,
      });

      config.parameters.set('model', {
        name: 'model',
        type: 'categorical',
        range: ['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro'],
        current: 'gpt-4-turbo',
        best: 'gpt-4-turbo',
        impact: 0.9,
      });

      this.configs.set(feature, config);
    }
  }

  /**
   * 자동 튜닝 시작
   */
  private startAutoTuning(): void {
    // 30분마다 자동 튜닝
    this.tuningInterval = setInterval(() => {
      this.performAutoTuning();
    }, 1800000); // 30분
  }

  /**
   * 자동 튜닝 수행
   */
  async performAutoTuning(): Promise<void> {
    for (const [feature, config] of this.configs.entries()) {
      // 성능이 낮은 기능 우선 튜닝
      if (config.performance < 0.8) {
        await this.tuneHyperparameters(feature);
      }
    }
  }

  /**
   * 하이퍼파라미터 튜닝
   */
  async tuneHyperparameters(feature: string): Promise<HyperparameterConfig | null> {
    const config = this.configs.get(feature);
    if (!config) return null;

    // 베이스라인 성능
    const baselinePerformance = config.performance;

    // 각 하이퍼파라미터에 대해 튜닝
    for (const [paramName, param] of config.parameters.entries()) {
      // 그리드 서치 또는 랜덤 서치
      const candidates = this.generateCandidates(param);
      
      let bestValue = param.current;
      let bestPerformance = baselinePerformance;

      for (const candidate of candidates.slice(0, 5)) { // 상위 5개만 테스트
        const testConfig = this.cloneConfig(config);
        testConfig.parameters.get(paramName)!.current = candidate;

        // 성능 테스트
        const performance = await this.testConfiguration(feature, testConfig);
        
        if (performance > bestPerformance) {
          bestPerformance = performance;
          bestValue = candidate;
        }
      }

      // 개선이 있으면 업데이트
      if (bestPerformance > baselinePerformance * 1.05) {
        param.current = bestValue;
        param.best = bestValue;
        config.performance = bestPerformance;
      }
    }

    config.lastUpdated = new Date();
    
    // 튜닝 결과 기록
    if (!this.tuningHistory.has(feature)) {
      this.tuningHistory.set(feature, []);
    }
    
    this.tuningHistory.get(feature)!.push({
      config: this.cloneConfig(config),
      performance: config.performance,
      improvement: config.performance - baselinePerformance,
      timestamp: new Date(),
    });

    // 자기 학습: 튜닝 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: `hyperparameter_tuning_${feature}`,
      input: { feature, baselinePerformance },
      output: { tunedPerformance: config.performance, parameters: Array.from(config.parameters.entries()) },
      success: config.performance > baselinePerformance,
      performance: config.performance,
      patterns: ['hyperparameter_tuning', feature],
      improvements: [`성능 ${((config.performance - baselinePerformance) * 100).toFixed(2)}% 개선`],
    }).catch(err => console.error('하이퍼파라미터 튜닝 학습 오류:', err));

    return config;
  }

  /**
   * 후보값 생성
   */
  private generateCandidates(param: Hyperparameter): any[] {
    const candidates: any[] = [];

    if (param.type === 'continuous') {
      const [min, max] = param.range as [number, number];
      const step = (max - min) / 10;
      for (let i = 0; i <= 10; i++) {
        candidates.push(min + step * i);
      }
    } else if (param.type === 'discrete') {
      const [min, max] = param.range as [number, number];
      const step = Math.max(1, Math.floor((max - min) / 10));
      for (let i = min; i <= max; i += step) {
        candidates.push(i);
      }
    } else {
      candidates.push(...(param.range as string[]));
    }

    return candidates;
  }

  /**
   * 설정 복제
   */
  private cloneConfig(config: HyperparameterConfig): HyperparameterConfig {
    const cloned = {
      feature: config.feature,
      parameters: new Map<string, Hyperparameter>(),
      performance: config.performance,
      lastUpdated: config.lastUpdated,
    };

    for (const [key, param] of config.parameters.entries()) {
      cloned.parameters.set(key, { ...param });
    }

    return cloned;
  }

  /**
   * 설정 테스트
   */
  private async testConfiguration(
    feature: string,
    config: HyperparameterConfig
  ): Promise<number> {
    // 실제로는 해당 기능을 테스트하지만, 여기서는 시뮬레이션
    // 성능 모니터링 데이터 사용
    const monitoring = await selfMonitoringSystem.performSelfAssessment();
    
    // 하이퍼파라미터에 따른 예상 성능 계산
    const learningRate = config.parameters.get('learningRate')?.current || 0.1;
    const temperature = config.parameters.get('temperature')?.current || 0.7;
    
    // 간단한 휴리스틱: learningRate가 적절하면 성능 향상
    let performance = monitoring.performance.overall;
    
    if (learningRate > 0.05 && learningRate < 0.3) {
      performance += 0.1;
    }
    if (temperature > 0.3 && temperature < 1.0) {
      performance += 0.05;
    }

    return Math.min(1.0, performance);
  }

  /**
   * 최적 하이퍼파라미터 조회
   */
  getOptimalConfig(feature: string): HyperparameterConfig | null {
    return this.configs.get(feature) || null;
  }

  /**
   * 하이퍼파라미터 업데이트
   */
  updateHyperparameter(
    feature: string,
    paramName: string,
    value: any
  ): void {
    const config = this.configs.get(feature);
    if (!config) return;

    const param = config.parameters.get(paramName);
    if (!param) return;

    param.current = value;
    config.lastUpdated = new Date();
  }

  /**
   * 통계 조회
   */
  getStats(): {
    totalConfigs: number;
    averagePerformance: number;
    tuningHistory: Map<string, TuningResult[]>;
    topImprovements: TuningResult[];
  } {
    const configs = Array.from(this.configs.values());
    const averagePerformance = configs.length > 0
      ? configs.reduce((sum, c) => sum + c.performance, 0) / configs.length
      : 0;

    const allResults = Array.from(this.tuningHistory.values()).flat();
    const topImprovements = allResults
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 10);

    return {
      totalConfigs: configs.length,
      averagePerformance,
      tuningHistory: this.tuningHistory,
      topImprovements,
    };
  }
}

export const hyperparameterTuning = new HyperparameterTuningSystem();

