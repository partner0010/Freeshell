/**
 * 멀티 에이전트 협업 시스템
 * 여러 AI 에이전트가 협력하여 복잡한 작업 수행
 * 자기 학습 시스템 통합: 협업 패턴 학습 및 최적화
 */

import { autonomousAgentSystem, type AutonomousTask } from './autonomous-agent';
import { multiModelManager } from './multi-model-manager';
import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { crossFeatureLearning } from './cross-feature-learning';
import { reinforcementLearning } from './reinforcement-learning';

export interface AgentRole {
  id: string;
  name: string;
  expertise: string[];
  model?: string;
}

export interface MultiAgentTask {
  id: string;
  goal: string;
  agents: AgentRole[];
  coordination: 'sequential' | 'parallel' | 'hierarchical';
  status: 'pending' | 'coordinating' | 'executing' | 'completed' | 'failed';
  results: Record<string, any>;
  createdAt: Date;
}

class MultiAgentSystem {
  private tasks: Map<string, MultiAgentTask> = new Map();
  private agentRoles: AgentRole[] = [
    {
      id: 'researcher',
      name: '연구원',
      expertise: ['정보 수집', '데이터 분석', '리서치'],
      model: 'gpt-4-turbo',
    },
    {
      id: 'strategist',
      name: '전략가',
      expertise: ['전략 수립', '계획', '최적화'],
      model: 'gpt-4-turbo',
    },
    {
      id: 'executor',
      name: '실행자',
      expertise: ['실행', '구현', '작업 수행'],
      model: 'gpt-4-turbo',
    },
    {
      id: 'reviewer',
      name: '검토자',
      expertise: ['품질 검토', '검증', '개선'],
      model: 'gpt-4-turbo',
    },
    {
      id: 'coordinator',
      name: '조정자',
      expertise: ['조정', '통합', '관리'],
      model: 'gpt-4-turbo',
    },
  ];

  /**
   * 멀티 에이전트 작업 생성
   */
  createTask(goal: string, coordination: 'sequential' | 'parallel' | 'hierarchical' = 'hierarchical'): MultiAgentTask {
    // 목표에 따라 적절한 에이전트 선택
    const agents = this.selectAgents(goal);

    const task: MultiAgentTask = {
      id: `multi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      goal,
      agents,
      coordination,
      status: 'pending',
      results: {},
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * 목표에 따라 적절한 에이전트 선택
   */
  private selectAgents(goal: string): AgentRole[] {
    const selected: AgentRole[] = [];

    // 연구가 필요한 경우
    if (this.needsResearch(goal)) {
      selected.push(this.agentRoles.find(a => a.id === 'researcher')!);
    }

    // 전략이 필요한 경우
    if (this.needsStrategy(goal)) {
      selected.push(this.agentRoles.find(a => a.id === 'strategist')!);
    }

    // 실행이 필요한 경우
    selected.push(this.agentRoles.find(a => a.id === 'executor')!);

    // 검토가 필요한 경우
    selected.push(this.agentRoles.find(a => a.id === 'reviewer')!);

    // 조정자 추가
    selected.unshift(this.agentRoles.find(a => a.id === 'coordinator')!);

    return selected;
  }

  private needsResearch(goal: string): boolean {
    const keywords = ['조사', '연구', '분석', '정보', '데이터', '최신'];
    return keywords.some(k => goal.includes(k));
  }

  private needsStrategy(goal: string): boolean {
    const keywords = ['전략', '계획', '설계', '최적화', '방안'];
    return keywords.some(k => goal.includes(k));
  }

  /**
   * 멀티 에이전트 작업 실행
   */
  async executeTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('작업을 찾을 수 없습니다.');
    }

    task.status = 'coordinating';

    try {
      let finalResult: any;

      switch (task.coordination) {
        case 'sequential':
          finalResult = await this.executeSequential(task);
          break;
        case 'parallel':
          finalResult = await this.executeParallel(task);
          break;
        case 'hierarchical':
          finalResult = await this.executeHierarchical(task);
          break;
      }

      task.status = 'completed';
      task.results = finalResult;

      // 자기 학습: 멀티 에이전트 협업 경험 저장
      const performance = finalResult ? 0.9 : 0.3;
      await selfLearningSystem.learnFromExperience({
        task: 'multi_agent_collaboration',
        input: { goal: task.goal, coordination: task.coordination, agentsCount: task.agents.length },
        output: finalResult,
        success: !!finalResult,
        performance,
        patterns: ['multi_agent', task.coordination, `agents_${task.agents.length}`],
        improvements: [],
      });

      // 크로스 기능 학습: 협업 패턴 전파
      await crossFeatureLearning.shareExperience('multi-agent-system', {
        task: task.goal,
        output: finalResult,
        success: !!finalResult,
        performance,
      });

      // 강화 학습: 성공 시 보상
      if (finalResult) {
        reinforcementLearning.giveReward('multi_agent_collaboration', performance);
      } else {
        reinforcementLearning.givePunishment('multi_agent_collaboration', 0.1);
      }

      // 자기 모니터링: 협업 성능 추적
      await selfMonitoringSystem.recordPerformance({
        task: 'multi_agent_collaboration',
        performance,
        timestamp: new Date(),
      });

      return finalResult;
    } catch (error: any) {
      task.status = 'failed';
      task.results = { error: error.message };

      // 실패 경험도 학습
      await selfLearningSystem.learnFromExperience({
        task: 'multi_agent_collaboration',
        input: { goal: task.goal, coordination: task.coordination },
        output: { error: error.message },
        success: false,
        performance: 0,
        patterns: ['multi_agent', task.coordination, 'failed'],
        improvements: [error.message],
      }).catch(err => console.error('멀티 에이전트 학습 오류:', err));

      throw error;
    }
  }

  /**
   * 순차적 실행 (에이전트가 순서대로 작업)
   */
  private async executeSequential(task: MultiAgentTask): Promise<any> {
    const results: any[] = [];
    let context = { goal: task.goal };

    for (const agent of task.agents) {
      const agentPrompt = `당신은 ${agent.name} 역할을 맡은 전문 AI 에이전트입니다.
전문 분야: ${agent.expertise.join(', ')}
목표: ${task.goal}
이전 에이전트들의 결과: ${JSON.stringify(results, null, 2)}
현재 컨텍스트: ${JSON.stringify(context, null, 2)}

당신의 전문 분야에 맞는 작업을 수행하고 결과를 반환하세요. JSON 형식으로 {"result": "...", "summary": "..."}로 응답하세요.`;

      const response = await multiModelManager.request(
        agentPrompt,
        `당신은 ${agent.name} 전문가입니다. ${agent.expertise.join(', ')} 분야에서 최고의 전문성을 발휘하세요.`,
        { primaryModel: agent.model as any || 'gpt-4-turbo' }
      );

      const result = JSON.parse(response.content);
      results.push({ agent: agent.name, ...result });
      context = { ...context, [agent.id]: result };
      task.results[agent.id] = result;
    }

    return { results, final: results[results.length - 1] };
  }

  /**
   * 병렬 실행 (에이전트가 동시에 작업)
   */
  private async executeParallel(task: MultiAgentTask): Promise<any> {
    const coordinator = task.agents.find(a => a.id === 'coordinator')!;
    const workers = task.agents.filter(a => a.id !== 'coordinator');

    // 조정자가 작업 분배
    const coordinationPrompt = `목표: ${task.goal}
사용 가능한 에이전트: ${workers.map(a => `${a.name} (${a.expertise.join(', ')})`).join(', ')}

각 에이전트에게 할당할 작업을 분배하세요. JSON 형식으로 {"assignments": [{"agent": "...", "task": "..."}]}로 응답하세요.`;

    const coordination = await multiModelManager.request(
      coordinationPrompt,
      '당신은 멀티 에이전트 시스템의 조정자입니다. 작업을 효율적으로 분배하세요.',
      { primaryModel: coordinator.model as any || 'gpt-4-turbo' }
    );

    const assignments = JSON.parse(coordination.content).assignments;

    // 병렬 실행
    const workerResults = await Promise.all(
      assignments.map(async (assignment: any) => {
        const agent = workers.find(a => a.name === assignment.agent);
        if (!agent) return null;

        const agentPrompt = `당신은 ${agent.name}입니다.
할당된 작업: ${assignment.task}
목표: ${task.goal}

작업을 수행하고 결과를 반환하세요. JSON 형식으로 {"result": "...", "summary": "..."}로 응답하세요.`;

        const response = await multiModelManager.request(
          agentPrompt,
          `당신은 ${agent.name} 전문가입니다.`,
          { primaryModel: agent.model as any || 'gpt-4-turbo' }
        );

        return { agent: agent.name, ...JSON.parse(response.content) };
      })
    );

    // 조정자가 결과 통합
    const integrationPrompt = `목표: ${task.goal}
에이전트들의 결과: ${JSON.stringify(workerResults, null, 2)}

결과를 통합하여 최종 결과를 생성하세요. JSON 형식으로 {"finalResult": "...", "summary": "..."}로 응답하세요.`;

    const integration = await multiModelManager.request(
      integrationPrompt,
      '당신은 조정자입니다. 여러 에이전트의 결과를 통합하세요.',
      { primaryModel: coordinator.model as any || 'gpt-4-turbo' }
    );

    const final = JSON.parse(integration.content);
    return { workerResults, final };
  }

  /**
   * 계층적 실행 (조정자가 하위 에이전트들을 관리)
   */
  private async executeHierarchical(task: MultiAgentTask): Promise<any> {
    const coordinator = task.agents.find(a => a.id === 'coordinator')!;
    const workers = task.agents.filter(a => a.id !== 'coordinator');

    // 조정자가 전체 계획 수립
    const planPrompt = `목표: ${task.goal}
사용 가능한 에이전트: ${workers.map(a => `${a.name} (${a.expertise.join(', ')})`).join(', ')}

전체 계획을 수립하고 각 에이전트의 역할을 정의하세요. JSON 형식으로 {"plan": "...", "roles": [{"agent": "...", "role": "..."}]}로 응답하세요.`;

    const planResponse = await multiModelManager.request(
      planPrompt,
      '당신은 멀티 에이전트 시스템의 조정자입니다. 전체 계획을 수립하세요.',
      { primaryModel: coordinator.model as any || 'gpt-4-turbo' }
    );

    const plan = JSON.parse(planResponse.content);

    // 각 에이전트가 자신의 역할 수행
    const workerResults: any[] = [];
    for (const role of plan.roles) {
      const agent = workers.find(a => a.name === role.agent);
      if (!agent) continue;

      const agentPrompt = `당신은 ${agent.name}입니다.
목표: ${task.goal}
전체 계획: ${plan.plan}
당신의 역할: ${role.role}
다른 에이전트들의 결과: ${JSON.stringify(workerResults, null, 2)}

역할을 수행하고 결과를 반환하세요. JSON 형식으로 {"result": "...", "summary": "..."}로 응답하세요.`;

      const response = await multiModelManager.request(
        agentPrompt,
        `당신은 ${agent.name} 전문가입니다.`,
        { primaryModel: agent.model as any || 'gpt-4-turbo' }
      );

      const result = JSON.parse(response.content);
      workerResults.push({ agent: agent.name, role: role.role, ...result });
      task.results[agent.id] = result;
    }

    // 조정자가 최종 통합
    const finalPrompt = `목표: ${task.goal}
전체 계획: ${plan.plan}
에이전트들의 결과: ${JSON.stringify(workerResults, null, 2)}

최종 결과를 통합하고 검증하세요. JSON 형식으로 {"finalResult": "...", "summary": "...", "quality": 0-100}로 응답하세요.`;

    const finalResponse = await multiModelManager.request(
      finalPrompt,
      '당신은 조정자입니다. 최종 결과를 통합하세요.',
      { primaryModel: coordinator.model as any || 'gpt-4-turbo' }
    );

    return { plan, workerResults, final: JSON.parse(finalResponse.content) };
  }

  /**
   * 작업 조회
   */
  getTask(taskId: string): MultiAgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 모든 작업 조회
   */
  getAllTasks(): MultiAgentTask[] {
    return Array.from(this.tasks.values());
  }
}

export const multiAgentSystem = new MultiAgentSystem();

