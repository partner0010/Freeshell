/**
 * 메타 학습 시스템 (Meta-Learning)
 * "학습하는 방법을 학습"하는 시스템
 */

import { multiModelManager } from './multi-model-manager';
import { selfLearningSystem } from './self-learning';
import { knowledgeGraph } from './knowledge-graph';

export interface MetaLearningStrategy {
  id: string;
  taskType: string;
  learningMethod: string;
  parameters: Record<string, any>;
  effectiveness: number;
  usageCount: number;
  lastUpdated: Date;
}

export interface LearningTask {
  id: string;
  description: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: Record<string, any>;
}

class MetaLearningSystem {
  private strategies: Map<string, MetaLearningStrategy> = new Map();
  private taskHistory: Map<string, LearningTask[]> = new Map();

  /**
   * 최적의 학습 방법 선택
   */
  async selectOptimalLearningMethod(task: LearningTask): Promise<MetaLearningStrategy> {
    // 기존 전략 검색
    const existingStrategy = this.findStrategyForTask(task);
    
    if (existingStrategy && existingStrategy.effectiveness > 0.7) {
      return existingStrategy;
    }

    // 새로운 학습 방법 생성
    return await this.generateLearningMethod(task);
  }

  /**
   * 작업 유형에 맞는 전략 찾기
   */
  private findStrategyForTask(task: LearningTask): MetaLearningStrategy | null {
    for (const strategy of this.strategies.values()) {
      if (strategy.taskType === task.type && strategy.effectiveness > 0.5) {
        return strategy;
      }
    }
    return null;
  }

  /**
   * 새로운 학습 방법 생성
   */
  private async generateLearningMethod(task: LearningTask): Promise<MetaLearningStrategy> {
    const prompt = `다음 작업에 대한 최적의 학습 방법을 제시하세요:

작업: ${task.description}
유형: ${task.type}
난이도: ${task.difficulty}
컨텍스트: ${JSON.stringify(task.context, null, 2)}

다음 형식으로 응답:
{
  "learningMethod": "학습 방법 설명",
  "parameters": {
    "learningRate": 0.0-1.0,
    "explorationRate": 0.0-1.0,
    "memorySize": 숫자,
    "updateFrequency": "realtime|batch|periodic"
  },
  "rationale": "이 방법을 선택한 이유"
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 메타 학습 전문가입니다. 작업에 최적화된 학습 방법을 제시하세요.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      const strategy: MetaLearningStrategy = {
        id: `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        taskType: task.type,
        learningMethod: data.learningMethod,
        parameters: data.parameters || {},
        effectiveness: 0.5, // 초기값
        usageCount: 0,
        lastUpdated: new Date(),
      };

      this.strategies.set(strategy.id, strategy);
      return strategy;
    } catch (error) {
      console.error('학습 방법 생성 실패:', error);
      // 기본 전략 반환
      return this.getDefaultStrategy(task);
    }
  }

  /**
   * 기본 전략
   */
  private getDefaultStrategy(task: LearningTask): MetaLearningStrategy {
    return {
      id: `default-${Date.now()}`,
      taskType: task.type,
      learningMethod: '경험 기반 학습',
      parameters: {
        learningRate: 0.1,
        explorationRate: 0.2,
        memorySize: 100,
        updateFrequency: 'batch',
      },
      effectiveness: 0.5,
      usageCount: 0,
      lastUpdated: new Date(),
    };
  }

  /**
   * 학습 방법 평가 및 업데이트
   */
  async evaluateAndUpdateStrategy(
    strategyId: string,
    performance: number,
    experience: any
  ): Promise<void> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    // 효과성 업데이트
    strategy.effectiveness = (strategy.effectiveness * strategy.usageCount + performance) / (strategy.usageCount + 1);
    strategy.usageCount++;
    strategy.lastUpdated = new Date();

    // 성능이 낮으면 전략 개선
    if (performance < 0.6) {
      await this.improveStrategy(strategy, experience);
    }
  }

  /**
   * 전략 개선
   */
  private async improveStrategy(strategy: MetaLearningStrategy, experience: any): Promise<void> {
    const prompt = `다음 학습 전략의 성능이 낮습니다. 개선 방안을 제시하세요:

전략: ${strategy.learningMethod}
파라미터: ${JSON.stringify(strategy.parameters, null, 2)}
경험: ${JSON.stringify(experience, null, 2)}

다음 형식으로 응답:
{
  "improvedMethod": "개선된 학습 방법",
  "improvedParameters": {...},
  "expectedImprovement": 0.0-1.0
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 학습 전략 개선 전문가입니다.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      strategy.learningMethod = data.improvedMethod || strategy.learningMethod;
      strategy.parameters = { ...strategy.parameters, ...(data.improvedParameters || {}) };
      strategy.lastUpdated = new Date();
    } catch (error) {
      console.error('전략 개선 실패:', error);
    }
  }

  /**
   * 작업 유형 학습
   */
  async learnTaskType(task: LearningTask, result: any, success: boolean): Promise<void> {
    if (!this.taskHistory.has(task.type)) {
      this.taskHistory.set(task.type, []);
    }

    const history = this.taskHistory.get(task.type)!;
    history.push(task);

    // 최근 50개만 유지
    if (history.length > 50) {
      history.shift();
    }

    // 패턴 학습
    await this.learnPatternsFromTasks(task.type, history);
  }

  /**
   * 작업에서 패턴 학습
   */
  private async learnPatternsFromTasks(taskType: string, tasks: LearningTask[]): Promise<void> {
    if (tasks.length < 5) return; // 충분한 데이터가 있을 때만

    const prompt = `다음 작업들의 공통 패턴을 찾아보세요:

${tasks.map(t => `- ${t.description} (${t.difficulty})`).join('\n')}

다음 형식으로 응답:
{
  "patterns": ["패턴1", "패턴2"],
  "commonCharacteristics": ["특징1", "특징2"],
  "optimalApproach": "최적 접근 방법"
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 패턴 인식 전문가입니다.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      // 지식 그래프에 저장
      for (const pattern of data.patterns || []) {
        await knowledgeGraph.addNode({
          type: 'pattern',
          content: `작업 유형: ${taskType}\n패턴: ${pattern}`,
          metadata: {
            taskType,
            pattern,
            characteristics: data.commonCharacteristics || [],
          },
          connections: [],
          confidence: 0.8,
        });
      }
    } catch (error) {
      console.error('패턴 학습 실패:', error);
    }
  }

  /**
   * 전략 통계
   */
  getStrategyStats(): {
    totalStrategies: number;
    averageEffectiveness: number;
    topStrategies: MetaLearningStrategy[];
  } {
    const all = Array.from(this.strategies.values());
    const averageEffectiveness = all.length > 0
      ? all.reduce((sum, s) => sum + s.effectiveness, 0) / all.length
      : 0;

    const topStrategies = all
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 5);

    return {
      totalStrategies: all.length,
      averageEffectiveness,
      topStrategies,
    };
  }
}

export const metaLearningSystem = new MetaLearningSystem();

