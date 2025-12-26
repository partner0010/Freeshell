/**
 * 워크플로우 관리자
 * 자동화 워크플로우 생성 및 실행
 */

export interface WorkflowStep {
  id: string;
  type: 'agent' | 'api' | 'condition' | 'delay' | 'notification';
  config: Record<string, any>;
  nextStepId?: string;
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: any;
    trueStepId?: string;
    falseStepId?: string;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'active' | 'paused' | 'stopped';
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  runCount: number;
}

class WorkflowManager {
  private workflows: Map<string, Workflow> = new Map();
  private runningWorkflows: Set<string> = new Set();

  /**
   * 워크플로우 생성
   */
  createWorkflow(name: string, description: string, steps: WorkflowStep[]): Workflow {
    const workflow: Workflow = {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      steps,
      status: 'paused',
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0,
    };

    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  /**
   * 워크플로우 목록 조회
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * 워크플로우 조회
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  /**
   * 워크플로우 업데이트
   */
  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      return null;
    }

    const updated = {
      ...workflow,
      ...updates,
      updatedAt: new Date(),
    };

    this.workflows.set(id, updated);
    return updated;
  }

  /**
   * 워크플로우 삭제
   */
  deleteWorkflow(id: string): boolean {
    return this.workflows.delete(id);
  }

  /**
   * 워크플로우 실행
   */
  async runWorkflow(id: string, input?: Record<string, any>): Promise<any> {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없습니다.');
    }

    if (workflow.status !== 'active') {
      throw new Error('워크플로우가 활성화되지 않았습니다.');
    }

    if (this.runningWorkflows.has(id)) {
      throw new Error('워크플로우가 이미 실행 중입니다.');
    }

    this.runningWorkflows.add(id);

    try {
      const result = await this.executeSteps(workflow.steps, input || {});
      
      // 실행 기록 업데이트
      this.updateWorkflow(id, {
        lastRun: new Date(),
        runCount: workflow.runCount + 1,
      });

      return result;
    } finally {
      this.runningWorkflows.delete(id);
    }
  }

  /**
   * 단계 실행
   */
  private async executeSteps(steps: WorkflowStep[], context: Record<string, any>): Promise<any> {
    let currentStep: WorkflowStep | undefined = steps[0];
    const results: any[] = [];

    while (currentStep) {
      const result = await this.executeStep(currentStep, context);
      results.push(result);

      // 다음 단계 결정
      if (currentStep.condition) {
        const conditionResult = this.evaluateCondition(
          currentStep.condition,
          context
        );
        currentStep = steps.find(s => 
          s.id === (conditionResult ? currentStep!.condition!.trueStepId : currentStep!.condition!.falseStepId)
        );
      } else if (currentStep.nextStepId) {
        currentStep = steps.find(s => s.id === currentStep!.nextStepId);
      } else {
        break;
      }
    }

    return results;
  }

  /**
   * 단계 실행
   */
  private async executeStep(step: WorkflowStep, context: Record<string, any>): Promise<any> {
    switch (step.type) {
      case 'agent':
        return this.executeAgentStep(step, context);
      case 'api':
        return this.executeApiStep(step, context);
      case 'delay':
        return this.executeDelayStep(step, context);
      case 'notification':
        return this.executeNotificationStep(step, context);
      case 'condition':
        return this.evaluateCondition(step.condition!, context);
      default:
        throw new Error(`알 수 없는 단계 타입: ${step.type}`);
    }
  }

  /**
   * 에이전트 단계 실행
   */
  private async executeAgentStep(step: WorkflowStep, context: Record<string, any>): Promise<any> {
    const { agentManager } = await import('@/lib/ai/agents');
    const { agentId, task } = step.config;

    const agentTask = agentManager.createTask({
      agentId,
      type: 'generate',
      input: { ...task, ...context },
    });

    return await agentManager.executeTask(agentTask.id);
  }

  /**
   * API 단계 실행
   */
  private async executeApiStep(step: WorkflowStep, context: Record<string, any>): Promise<any> {
    const { apiClient } = await import('@/lib/api/api-client');
    const { method, endpoint, body } = step.config;
    const httpMethod = (method || 'POST').toUpperCase();
    const requestData = { ...body, ...context };

    let response;
    switch (httpMethod) {
      case 'GET':
        response = await apiClient.get(endpoint);
        break;
      case 'POST':
        response = await apiClient.post(endpoint, requestData);
        break;
      case 'PUT':
        response = await apiClient.put(endpoint, requestData);
        break;
      case 'DELETE':
        response = await apiClient.delete(endpoint);
        break;
      default:
        response = await apiClient.post(endpoint, requestData);
    }

    return response.data;
  }

  /**
   * 지연 단계 실행
   */
  private async executeDelayStep(step: WorkflowStep, context: Record<string, any>): Promise<void> {
    const delay = step.config.delay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 알림 단계 실행
   */
  private async executeNotificationStep(step: WorkflowStep, context: Record<string, any>): Promise<void> {
    const { message, type } = step.config;
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: type || 'info',
          message: this.interpolate(message, context),
        },
      }));
    }
  }

  /**
   * 조건 평가
   */
  private evaluateCondition(condition: WorkflowStep['condition'], context: Record<string, any>): boolean {
    if (!condition) return false;

    const fieldValue = context[condition.field];
    const { operator, value } = condition;

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'contains':
        return String(fieldValue).includes(String(value));
      case 'greater':
        return Number(fieldValue) > Number(value);
      case 'less':
        return Number(fieldValue) < Number(value);
      default:
        return false;
    }
  }

  /**
   * 문자열 보간
   */
  private interpolate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return context[key] || '';
    });
  }

  /**
   * 워크플로우 활성화/비활성화
   */
  toggleWorkflow(id: string): Workflow | null {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      return null;
    }

    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    return this.updateWorkflow(id, { status: newStatus });
  }
}

// 싱글톤 인스턴스
export const workflowManager = typeof window !== 'undefined' ? new WorkflowManager() : null;

