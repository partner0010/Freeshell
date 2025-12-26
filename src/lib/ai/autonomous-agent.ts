/**
 * 자율 AI 에이전트 시스템
 * AI가 스스로 판단하고 결과를 생성할 수 있는 최상위 시스템
 */

import OpenAI from 'openai';
import { multiModelManager, type AIModel, type MultiModelConfig } from './multi-model-manager';
import { webSearchManager } from './web-search';
import { toolSystem, type ToolCall } from './tool-system';
import { knowledgeGraph } from './knowledge-graph';
import { onlineServices } from './online-services';
import { advancedReasoning } from './advanced-reasoning';
import { codeExecutor } from './code-executor';
import { selfLearningSystem } from './self-learning';
import { metaLearningSystem } from './meta-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { selfImprovementSystem } from './self-improvement';
import { crossFeatureLearning } from './cross-feature-learning';
import { reinforcementLearning } from './reinforcement-learning';
import { adaptiveLearning } from './adaptive-learning';

export interface AutonomousTask {
  id: string;
  goal: string;
  context?: Record<string, any>;
  constraints?: string[];
  maxIterations?: number;
  status: 'pending' | 'thinking' | 'executing' | 'completed' | 'failed';
  result?: any;
  reasoning?: string;
  steps?: AutonomousStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AutonomousStep {
  id: string;
  action: string;
  reasoning: string;
  result?: any;
  timestamp: Date;
}

class AutonomousAgentSystem {
  private openai: OpenAI | null = null;
  private tasks: Map<string, AutonomousTask> = new Map();

  constructor() {
    // OpenAI 클라이언트 초기화
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * 자율 작업 생성
   */
  createTask(goal: string, context?: Record<string, any>, constraints?: string[]): AutonomousTask {
    const task: AutonomousTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      goal,
      context,
      constraints,
      maxIterations: 10,
      status: 'pending',
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * 자율 작업 실행
   */
  async executeTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('작업을 찾을 수 없습니다.');
    }

    if (!this.openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    task.status = 'thinking';
    task.updatedAt = new Date();

    try {
      // 1단계: 목표 분석 및 계획 수립
      const plan = await this.thinkAndPlan(task);
      task.reasoning = plan.reasoning;
      task.steps = plan.steps;

      // 2단계: 계획 실행
      task.status = 'executing';
      const result = await this.executePlan(task, plan);

      // 3단계: 결과 검증 및 최종화
      const finalResult = await this.validateAndFinalize(task, result);

      // 4단계: 자기 학습 - 경험 저장 및 학습
      await this.learnFromExecution(task, finalResult);

      // 5단계: 자기 모니터링 - 성능 평가
      await this.monitorPerformance(task, finalResult);

      // 6단계: 적응형 학습 - 실시간 전략 조정
      const performance = this.calculatePerformance(task, finalResult);
      await adaptiveLearning.adaptInRealTime('autonomous_agent', performance);

      // 7단계: 강화 학습 - 행동 선택 및 보상
      const action = await this.selectOptimalAction(task);
      if (performance > 0.7) {
        reinforcementLearning.recordReward(
          task.id,
          performance,
          `목표 달성: ${task.goal}`
        );
      }

      task.status = 'completed';
      task.result = finalResult;
      task.updatedAt = new Date();

      return finalResult;
    } catch (error: any) {
      task.status = 'failed';
      task.result = { error: error.message };
      task.updatedAt = new Date();
      throw error;
    }
  }

  /**
   * 사고 및 계획 수립
   */
  private async thinkAndPlan(task: AutonomousTask): Promise<{
    reasoning: string;
    steps: AutonomousStep[];
  }> {
    if (!this.openai) throw new Error('OpenAI API 키가 설정되지 않았습니다.');

    const systemPrompt = `당신은 자율적으로 작동하는 AI 에이전트입니다. 주어진 목표를 달성하기 위해 스스로 판단하고 계획을 수립해야 합니다.

규칙:
1. 목표를 달성하기 위한 단계별 계획을 수립하세요
2. 각 단계는 구체적이고 실행 가능해야 합니다
3. 제약사항을 반드시 고려하세요
4. 최적의 방법을 선택하세요

응답 형식:
{
  "reasoning": "전체적인 사고 과정과 판단 근거",
  "steps": [
    {
      "id": "step-1",
      "action": "수행할 작업",
      "reasoning": "이 작업을 선택한 이유"
    }
  ]
}`;

    const userPrompt = `목표: ${task.goal}
${task.context ? `컨텍스트: ${JSON.stringify(task.context, null, 2)}` : ''}
${task.constraints ? `제약사항: ${task.constraints.join(', ')}` : ''}

위 목표를 달성하기 위한 계획을 수립하세요.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답을 받을 수 없습니다.');
    }

    const plan = JSON.parse(content);
    return {
      reasoning: plan.reasoning || '',
      steps: (plan.steps || []).map((step: any) => ({
        ...step,
        timestamp: new Date(),
      })),
    };
  }

  /**
   * 계획 실행
   */
  private async executePlan(task: AutonomousTask, plan: { steps: AutonomousStep[] }): Promise<any> {
    if (!this.openai) throw new Error('OpenAI API 키가 설정되지 않았습니다.');

    const results: any[] = [];
    let context = { ...task.context };

    for (const step of plan.steps) {
      const stepPrompt = `목표: ${task.goal}
현재 단계: ${step.action}
이전 결과: ${results.length > 0 ? JSON.stringify(results[results.length - 1], null, 2) : '없음'}
컨텍스트: ${JSON.stringify(context, null, 2)}

위 단계를 실행하고 결과를 반환하세요. JSON 형식으로 응답하세요.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 작업을 실행하는 AI 에이전트입니다. 주어진 단계를 실행하고 결과를 반환하세요.',
          },
          { role: 'user', content: stepPrompt },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const result = JSON.parse(content);
          step.result = result;
          results.push(result);
          context = { ...context, ...result };
        } catch (error) {
          step.result = { raw: content };
          results.push({ raw: content });
        }
      }

      // 단계 기록 업데이트
      if (task.steps) {
        const stepIndex = task.steps.findIndex(s => s.id === step.id);
        if (stepIndex >= 0) {
          task.steps[stepIndex] = step;
        }
      }
      task.updatedAt = new Date();
    }

    return results;
  }

  /**
   * 결과 검증 및 최종화
   */
  private async validateAndFinalize(task: AutonomousTask, results: any[]): Promise<any> {
    if (!this.openai) throw new Error('OpenAI API 키가 설정되지 않았습니다.');

    const validationPrompt = `목표: ${task.goal}
실행 결과: ${JSON.stringify(results, null, 2)}

위 결과가 목표를 달성했는지 검증하고, 필요하다면 최종 결과를 정리하세요.
JSON 형식으로 {"valid": true/false, "finalResult": "...", "summary": "..."}로 응답하세요.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '당신은 결과를 검증하고 최종화하는 AI입니다.',
        },
        { role: 'user', content: validationPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        return JSON.parse(content);
      } catch (error) {
        return { raw: content, results };
      }
    }

    return { results };
  }

  /**
   * 작업 조회
   */
  getTask(taskId: string): AutonomousTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 모든 작업 조회
   */
  getAllTasks(): AutonomousTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 실행 경험에서 학습
   */
  private async learnFromExecution(task: AutonomousTask, result: any): Promise<void> {
    try {
      const success = task.status === 'completed' && result && !result.error;
      const performance = this.calculatePerformance(task, result);

      await selfLearningSystem.learnFromExperience({
        task: task.goal,
        input: task.context || {},
        output: result,
        success,
        performance,
        patterns: task.steps?.map(s => s.action) || [],
        improvements: result.improvements || [],
      });
    } catch (error) {
      console.error('자기 학습 중 오류:', error);
    }
  }

  /**
   * 성능 계산
   */
  private calculatePerformance(task: AutonomousTask, result: any): number {
    let score = 0.5; // 기본 점수

    // 목표 달성 여부
    if (result && result.valid !== false) {
      score += 0.3;
    }

    // 단계 완료율
    if (task.steps && task.steps.length > 0) {
      const completedSteps = task.steps.filter(s => s.result).length;
      score += (completedSteps / task.steps.length) * 0.2;
    }

    return Math.min(1.0, score);
  }

  /**
   * 성능 모니터링
   */
  private async monitorPerformance(task: AutonomousTask, result: any): Promise<void> {
    try {
      const performance = this.calculatePerformance(task, result);
      
      // 성능 메트릭 업데이트
      await selfMonitoringSystem.recordPerformance({
        task: task.goal,
        performance,
        timestamp: new Date(),
      });

      // 성능이 낮으면 자기 개선 트리거
      if (performance < 0.7) {
        await selfImprovementSystem.triggerImprovement({
          issue: `작업 "${task.goal}"의 성능이 낮습니다 (${performance.toFixed(2)})`,
          context: {
            taskId: task.id,
            result,
            steps: task.steps,
          },
        });
      }
    } catch (error) {
      console.error('성능 모니터링 중 오류:', error);
    }
  }

  /**
   * 최적 행동 선택 (강화 학습)
   */
  private async selectOptimalAction(task: AutonomousTask): Promise<string> {
    const state = {
      feature: 'autonomous_agent',
      context: task.context || {},
      performance: 0.5,
    };

    const availableActions = task.steps?.map(s => s.action) || ['execute', 'validate', 'improve'];
    return reinforcementLearning.selectAction(state, availableActions);
  }
}

export const autonomousAgentSystem = new AutonomousAgentSystem();

