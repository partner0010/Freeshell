/**
 * AI 처리 과정 추적 시스템
 * AI가 어떻게 생각하고, 데이터를 수집하고, 분석하는지 단계별로 추적
 */

export interface AIProcessStep {
  step: number;
  stage: 'thinking' | 'researching' | 'analyzing' | 'synthesizing' | 'generating' | 'validating' | 'finalizing';
  description: string;
  data?: any;
  timestamp: number;
  duration?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  details?: string;
}

export interface AIProcessTracker {
  query: string;
  startTime: number;
  steps: AIProcessStep[];
  currentStep: number;
  finalResponse?: string;
  totalDuration: number;
  apiCalls: Array<{
    api: string;
    success: boolean;
    responseTime: number;
    error?: string;
  }>;
  thinkingProcess: Array<{
    thought: string;
    reasoning: string;
    confidence: number;
  }>;
}

class ProcessTracker {
  private processes: Map<string, AIProcessTracker> = new Map();

  createProcess(query: string): string {
    const processId = `process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tracker: AIProcessTracker = {
      query,
      startTime: Date.now(),
      steps: [],
      currentStep: 0,
      totalDuration: 0,
      apiCalls: [],
      thinkingProcess: [],
    };
    this.processes.set(processId, tracker);
    return processId;
  }

  addStep(processId: string, step: Omit<AIProcessStep, 'timestamp' | 'status'>): void {
    const tracker = this.processes.get(processId);
    if (!tracker) return;

    const fullStep: AIProcessStep = {
      ...step,
      timestamp: Date.now(),
      status: 'processing',
    };

    // 이전 단계 완료 처리
    if (tracker.steps.length > 0) {
      const prevStep = tracker.steps[tracker.steps.length - 1];
      if (prevStep.status === 'processing') {
        prevStep.status = 'completed';
        prevStep.duration = fullStep.timestamp - prevStep.timestamp;
      }
    }

    tracker.steps.push(fullStep);
    tracker.currentStep = tracker.steps.length;
  }

  completeStep(processId: string, stepIndex: number, details?: string): void {
    const tracker = this.processes.get(processId);
    if (!tracker) return;

    const step = tracker.steps[stepIndex];
    if (step) {
      step.status = 'completed';
      step.duration = Date.now() - step.timestamp;
      if (details) {
        step.details = details;
      }
    }
  }

  addThinking(processId: string, thought: string, reasoning: string, confidence: number = 0.5): void {
    const tracker = this.processes.get(processId);
    if (!tracker) return;

    tracker.thinkingProcess.push({
      thought,
      reasoning,
      confidence,
    });
  }

  addAPICall(processId: string, api: string, success: boolean, responseTime: number, error?: string): void {
    const tracker = this.processes.get(processId);
    if (!tracker) return;

    tracker.apiCalls.push({
      api,
      success,
      responseTime,
      error,
    });
  }

  finalize(processId: string, response: string): void {
    const tracker = this.processes.get(processId);
    if (!tracker) return;

    tracker.finalResponse = response;
    tracker.totalDuration = Date.now() - tracker.startTime;

    // 모든 진행 중인 단계 완료 처리
    tracker.steps.forEach(step => {
      if (step.status === 'processing') {
        step.status = 'completed';
        step.duration = Date.now() - step.timestamp;
      }
    });
  }

  getProcess(processId: string): AIProcessTracker | null {
    return this.processes.get(processId) || null;
  }

  getAllProcesses(): AIProcessTracker[] {
    return Array.from(this.processes.values());
  }

  clearOldProcesses(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [id, tracker] of this.processes.entries()) {
      if (now - tracker.startTime > maxAge) {
        this.processes.delete(id);
      }
    }
  }
}

export const processTracker = new ProcessTracker();

