/**
 * 강화 학습 시스템 (Reinforcement Learning)
 * 보상과 처벌을 통해 최적의 행동을 학습
 */

import { selfLearningSystem } from './self-learning';
import { knowledgeGraph } from './knowledge-graph';

export interface Action {
  id: string;
  type: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

export interface Reward {
  actionId: string;
  value: number; // -1 to 1
  reason: string;
  timestamp: Date;
}

export interface Policy {
  state: string;
  action: string;
  probability: number; // 0-1
  qValue: number; // Q-learning value
  visitCount: number;
  lastUpdated: Date;
}

export interface RLState {
  feature: string;
  context: Record<string, any>;
  performance: number;
}

class ReinforcementLearningSystem {
  private policies: Map<string, Policy> = new Map();
  private rewards: Map<string, Reward[]> = new Map();
  private qTable: Map<string, number> = new Map(); // Q(state, action) = value
  private learningRate: number = 0.1;
  private discountFactor: number = 0.9;
  private explorationRate: number = 0.2; // ε-greedy

  /**
   * 행동 선택 (ε-greedy)
   */
  selectAction(state: RLState, availableActions: string[]): string {
    const stateKey = this.getStateKey(state);
    
    // 탐험 (exploration)
    if (Math.random() < this.explorationRate) {
      return availableActions[Math.floor(Math.random() * availableActions.length)];
    }

    // 활용 (exploitation) - Q값이 가장 높은 행동 선택
    let bestAction = availableActions[0];
    let bestQValue = this.getQValue(stateKey, bestAction);

    for (const action of availableActions) {
      const qValue = this.getQValue(stateKey, action);
      if (qValue > bestQValue) {
        bestQValue = qValue;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * 보상 업데이트 (Q-learning)
   */
  updateQValue(
    state: RLState,
    action: string,
    reward: number,
    nextState?: RLState
  ): void {
    const stateKey = this.getStateKey(state);
    const actionKey = `${stateKey}-${action}`;
    
    const currentQ = this.getQValue(stateKey, action);
    
    // Q-learning 업데이트
    let nextMaxQ = 0;
    if (nextState) {
      // 다음 상태에서 가능한 모든 행동의 최대 Q값
      const nextStateKey = this.getStateKey(nextState);
      // 간단한 구현: 다음 상태의 평균 Q값 사용
      nextMaxQ = this.getAverageQValue(nextStateKey);
    }

    const newQ = currentQ + this.learningRate * (
      reward + this.discountFactor * nextMaxQ - currentQ
    );

    this.qTable.set(actionKey, newQ);

    // 정책 업데이트
    this.updatePolicy(state, action, newQ);
  }

  /**
   * 보상 제공 (간단한 인터페이스)
   */
  giveReward(task: string, performance: number): void {
    const actionId = `reward-${task}-${Date.now()}`;
    this.recordReward(actionId, performance, `Task: ${task} completed successfully`);
    
    // Q값 업데이트
    const state: RLState = {
      feature: task,
      context: {},
      performance,
    };
    this.updateQValue(state, 'execute', performance);
  }

  /**
   * 처벌 제공 (간단한 인터페이스)
   */
  givePunishment(task: string, penalty: number): void {
    const actionId = `punishment-${task}-${Date.now()}`;
    this.recordReward(actionId, -penalty, `Task: ${task} failed`);
    
    // Q값 업데이트
    const state: RLState = {
      feature: task,
      context: {},
      performance: -penalty,
    };
    this.updateQValue(state, 'execute', -penalty);
  }

  /**
   * 보상 기록
   */
  recordReward(actionId: string, value: number, reason: string): void {
    const reward: Reward = {
      actionId,
      value,
      reason,
      timestamp: new Date(),
    };

    if (!this.rewards.has(actionId)) {
      this.rewards.set(actionId, []);
    }
    this.rewards.get(actionId)!.push(reward);

    // 보상이 높으면 자기 학습 시스템에 전달
    if (value > 0.7) {
      selfLearningSystem.learnFromExperience({
        task: 'reinforcement_learning',
        input: { actionId },
        output: { reward: value, reason },
        success: true,
        performance: value,
        patterns: ['successful_action', reason],
        improvements: [],
      }).catch(err => console.error('강화 학습 저장 오류:', err));
    }
  }

  /**
   * Q값 조회
   */
  private getQValue(stateKey: string, action: string): number {
    const key = `${stateKey}-${action}`;
    return this.qTable.get(key) || 0;
  }

  /**
   * 평균 Q값 계산
   */
  private getAverageQValue(stateKey: string): number {
    let sum = 0;
    let count = 0;

    for (const [key, value] of this.qTable.entries()) {
      if (key.startsWith(stateKey + '-')) {
        sum += value;
        count++;
      }
    }

    return count > 0 ? sum / count : 0;
  }

  /**
   * 상태 키 생성
   */
  private getStateKey(state: RLState): string {
    return `${state.feature}-${JSON.stringify(state.context)}`;
  }

  /**
   * 정책 업데이트
   */
  private updatePolicy(state: RLState, action: string, qValue: number): void {
    const stateKey = this.getStateKey(state);
    const policyKey = `${stateKey}-${action}`;

    const existing = this.policies.get(policyKey);
    if (existing) {
      existing.qValue = qValue;
      existing.visitCount++;
      existing.lastUpdated = new Date();
      // Q값에 비례하여 확률 업데이트
      existing.probability = Math.min(1.0, 0.5 + (qValue * 0.5));
    } else {
      this.policies.set(policyKey, {
        state: stateKey,
        action,
        probability: Math.min(1.0, 0.5 + (qValue * 0.5)),
        qValue,
        visitCount: 1,
        lastUpdated: new Date(),
      });
    }
  }

  /**
   * 최적 정책 조회
   */
  getOptimalPolicy(state: RLState, availableActions: string[]): Policy | null {
    const stateKey = this.getStateKey(state);
    let bestPolicy: Policy | null = null;
    let bestQValue = -Infinity;

    for (const action of availableActions) {
      const policyKey = `${stateKey}-${action}`;
      const policy = this.policies.get(policyKey);
      if (policy && policy.qValue > bestQValue) {
        bestQValue = policy.qValue;
        bestPolicy = policy;
      }
    }

    return bestPolicy;
  }

  /**
   * 탐험률 조정 (시간이 지날수록 탐험 감소)
   */
  adjustExplorationRate(experienceCount: number): void {
    // 경험이 많아질수록 탐험률 감소
    this.explorationRate = Math.max(0.05, 0.2 - (experienceCount * 0.001));
  }

  /**
   * 통계 조회
   */
  getStats(): {
    totalPolicies: number;
    totalRewards: number;
    averageReward: number;
    topPolicies: Policy[];
  } {
    const allRewards = Array.from(this.rewards.values()).flat();
    const averageReward = allRewards.length > 0
      ? allRewards.reduce((sum, r) => sum + r.value, 0) / allRewards.length
      : 0;

    const topPolicies = Array.from(this.policies.values())
      .sort((a, b) => b.qValue - a.qValue)
      .slice(0, 10);

    return {
      totalPolicies: this.policies.size,
      totalRewards: allRewards.length,
      averageReward,
      topPolicies,
    };
  }
}

export const reinforcementLearning = new ReinforcementLearningSystem();

