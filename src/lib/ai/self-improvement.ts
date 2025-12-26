/**
 * 자기 개선 시스템
 * AI가 스스로를 개선하고 최적화하는 시스템
 */

import { multiModelManager } from './multi-model-manager';
import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { knowledgeGraph } from './knowledge-graph';

export interface ImprovementPlan {
  id: string;
  target: string;
  currentState: any;
  desiredState: any;
  actions: Array<{
    step: number;
    action: string;
    expectedImpact: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

class SelfImprovementSystem {
  private improvementPlans: Map<string, ImprovementPlan> = new Map();
  private improvementHistory: Array<{ plan: ImprovementPlan; result: any; success: boolean }> = [];

  /**
   * 개선 트리거 (간단한 인터페이스)
   */
  async triggerImprovement(params: {
    issue: string;
    context?: any;
  }): Promise<ImprovementPlan | null> {
    try {
      // 현재 상태와 원하는 상태를 설정
      const currentState = {
        issue: params.issue,
        context: params.context || {},
        timestamp: new Date(),
      };

      const desiredState = {
        issue: '해결됨',
        status: 'improved',
        performance: 0.9,
      };

      // 개선 계획 수립
      const plan = await this.createImprovementPlan(
        params.issue,
        currentState,
        desiredState
      );

      // 자동으로 실행 (비동기)
      this.executeImprovementPlan(plan.id).catch(err => 
        console.error('자동 개선 실행 오류:', err)
      );

      return plan;
    } catch (error) {
      console.error('개선 트리거 오류:', error);
      return null;
    }
  }

  /**
   * 자기 개선 계획 수립
   */
  async createImprovementPlan(target: string, currentState: any, desiredState: any): Promise<ImprovementPlan> {
    const prompt = `다음 목표를 달성하기 위한 개선 계획을 수립하세요:

목표: ${target}
현재 상태: ${JSON.stringify(currentState, null, 2)}
원하는 상태: ${JSON.stringify(desiredState, null, 2)}

다음 형식으로 응답:
{
  "actions": [
    {
      "step": 1,
      "action": "수행할 행동",
      "expectedImpact": 0.0-1.0,
      "priority": "high|medium|low"
    }
  ],
  "rationale": "계획 수립 근거"
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 AI 자기 개선 전문가입니다. 체계적이고 실행 가능한 개선 계획을 수립하세요.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      const plan: ImprovementPlan = {
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        target,
        currentState,
        desiredState,
        actions: data.actions || [],
        status: 'planned',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.improvementPlans.set(plan.id, plan);
      return plan;
    } catch (error) {
      console.error('개선 계획 수립 실패:', error);
      throw error;
    }
  }

  /**
   * 개선 계획 실행
   */
  async executeImprovementPlan(planId: string): Promise<any> {
    const plan = this.improvementPlans.get(planId);
    if (!plan) {
      throw new Error('개선 계획을 찾을 수 없습니다.');
    }

    plan.status = 'in_progress';
    plan.updatedAt = new Date();

    const results: any[] = [];

    try {
      for (const action of plan.actions) {
        const result = await this.executeAction(action, plan);
        results.push(result);
        
        plan.progress = (action.step / plan.actions.length) * 100;
        plan.updatedAt = new Date();

        // 지식 그래프에 저장
        await knowledgeGraph.addNode({
          type: 'experience',
          content: `개선 행동: ${action.action}\n결과: ${JSON.stringify(result)}`,
          metadata: {
            improvementPlan: planId,
            action: action.action,
            result,
          },
          connections: [],
          confidence: result.success ? 0.8 : 0.3,
        });
      }

      plan.status = 'completed';
      plan.progress = 100;

      // 개선 결과 평가
      const evaluation = await this.evaluateImprovement(plan, results);
      
      this.improvementHistory.push({
        plan,
        result: evaluation,
        success: evaluation.success,
      });

      return evaluation;
    } catch (error: any) {
      plan.status = 'failed';
      throw error;
    }
  }

  /**
   * 행동 실행
   */
  private async executeAction(action: any, plan: ImprovementPlan): Promise<any> {
    const prompt = `다음 개선 행동을 수행하세요:

행동: ${action.action}
목표: ${plan.target}
현재 상태: ${JSON.stringify(plan.currentState, null, 2)}

다음 형식으로 응답:
{
  "result": "실행 결과",
  "success": true/false,
  "impact": 0.0-1.0,
  "nextState": "다음 상태"
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 AI 개선 실행 전문가입니다. 행동을 수행하고 결과를 반환하세요.',
        { primaryModel: 'gpt-4-turbo' }
      );

      const data = JSON.parse(response.content);
      
      // 현재 상태 업데이트
      if (data.nextState) {
        plan.currentState = { ...plan.currentState, ...data.nextState };
      }

      return data;
    } catch (error) {
      return {
        result: '실행 실패',
        success: false,
        impact: 0,
      };
    }
  }

  /**
   * 개선 평가
   */
  private async evaluateImprovement(plan: ImprovementPlan, results: any[]): Promise<any> {
    const prompt = `다음 개선 계획의 결과를 평가하세요:

목표: ${plan.target}
원하는 상태: ${JSON.stringify(plan.desiredState, null, 2)}
현재 상태: ${JSON.stringify(plan.currentState, null, 2)}
실행 결과: ${JSON.stringify(results, null, 2)}

다음 형식으로 응답:
{
  "success": true/false,
  "achievement": 0.0-1.0,
  "improvements": ["개선 사항"],
  "remainingGaps": ["남은 차이"],
  "recommendations": ["추가 권장사항"]
}`;

    try {
      const response = await multiModelManager.request(
        prompt,
        '당신은 개선 평가 전문가입니다. 객관적으로 평가하세요.',
        { primaryModel: 'gpt-4-turbo' }
      );

      return JSON.parse(response.content);
    } catch (error) {
      return {
        success: false,
        achievement: 0,
        improvements: [],
        remainingGaps: [],
        recommendations: [],
      };
    }
  }

  /**
   * 자동 자기 개선 트리거
   */
  async triggerAutomaticImprovement(): Promise<void> {
    const status = selfMonitoringSystem.getCurrentStatus();
    const assessment = status.latestAssessment;

    if (!assessment) return;

    // 약점이 있으면 자동 개선 계획 수립
    if (assessment.weaknesses.length > 0) {
      for (const weakness of assessment.weaknesses) {
        const plan = await this.createImprovementPlan(
          `약점 개선: ${weakness}`,
          { weakness, currentPerformance: assessment.performance.overall },
          { weakness: '개선됨', targetPerformance: 0.9 }
        );

        // 자동 실행
        try {
          await this.executeImprovementPlan(plan.id);
        } catch (error) {
          console.error('자동 개선 실행 실패:', error);
        }
      }
    }

    // 성능이 목표에 미치지 못하면 개선
    for (const metric of status.metrics) {
      if (metric.value < metric.target * 0.8) {
        const plan = await this.createImprovementPlan(
          `${metric.name} 향상`,
          { current: metric.value },
          { target: metric.target }
        );

        try {
          await this.executeImprovementPlan(plan.id);
        } catch (error) {
          console.error('메트릭 개선 실행 실패:', error);
        }
      }
    }
  }

  /**
   * 개선 계획 조회
   */
  getImprovementPlan(planId: string): ImprovementPlan | undefined {
    return this.improvementPlans.get(planId);
  }

  /**
   * 모든 개선 계획 조회
   */
  getAllImprovementPlans(): ImprovementPlan[] {
    return Array.from(this.improvementPlans.values());
  }

  /**
   * 개선 통계
   */
  getImprovementStats(): {
    totalPlans: number;
    completedPlans: number;
    successRate: number;
    averageAchievement: number;
  } {
    const all = this.improvementHistory;
    const completed = all.filter(h => h.success);
    
    return {
      totalPlans: this.improvementPlans.size,
      completedPlans: completed.length,
      successRate: all.length > 0 ? completed.length / all.length : 0,
      averageAchievement: all.length > 0
        ? all.reduce((sum, h) => sum + (h.result.achievement || 0), 0) / all.length
        : 0,
    };
  }
}

export const selfImprovementSystem = new SelfImprovementSystem();

