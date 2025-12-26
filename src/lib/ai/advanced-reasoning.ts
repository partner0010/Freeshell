/**
 * 고급 추론 엔진 및 Chain of Thought
 * 자기 학습 시스템 통합: 추론 과정에서 학습하여 정확도 향상
 */

import { multiModelManager } from './multi-model-manager';
import { knowledgeGraph } from './knowledge-graph';
import { onlineServices } from './online-services';
import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';

export interface ReasoningStep {
  step: number;
  thought: string;
  action: string;
  result?: any;
  confidence: number;
}

export interface ReasoningChain {
  goal: string;
  steps: ReasoningStep[];
  finalAnswer: string;
  confidence: number;
}

class AdvancedReasoningEngine {
  /**
   * Chain of Thought 추론
   */
  async chainOfThought(question: string, context?: Record<string, any>): Promise<ReasoningChain> {
    const steps: ReasoningStep[] = [];
    let currentContext = { ...context };
    let stepNumber = 1;

    // 1단계: 문제 분석
    const analysis = await this.analyzeProblem(question, currentContext);
    steps.push({
      step: stepNumber++,
      thought: analysis.thought,
      action: '문제 분석',
      result: analysis,
      confidence: 0.9,
    });
    currentContext = { ...currentContext, analysis };

    // 2단계: 관련 지식 검색
    const knowledge = await knowledgeGraph.searchSimilar(question, 5);
    if (knowledge.length > 0) {
      steps.push({
        step: stepNumber++,
        thought: `관련 지식 ${knowledge.length}개 발견`,
        action: '지식 검색',
        result: knowledge.map(k => k.content),
        confidence: 0.8,
      });
      currentContext = { ...currentContext, knowledge };
    }

    // 3단계: 컨텍스트 정보 수집
    const contextualInfo = await onlineServices.gatherContextualInfo(question);
    if (Object.keys(contextualInfo).length > 0) {
      steps.push({
        step: stepNumber++,
        thought: '실시간 정보 수집',
        action: '온라인 서비스 조회',
        result: contextualInfo,
        confidence: 0.85,
      });
      currentContext = { ...currentContext, ...contextualInfo };
    }

    // 4단계: 단계별 추론
    const reasoningPrompt = `문제: ${question}
컨텍스트: ${JSON.stringify(currentContext, null, 2)}

위 문제를 단계별로 추론하여 답변하세요. 각 단계의 사고 과정을 명확히 설명하세요.

응답 형식:
{
  "reasoning": [
    {"step": 1, "thought": "...", "conclusion": "..."},
    {"step": 2, "thought": "...", "conclusion": "..."}
  ],
  "finalAnswer": "...",
  "confidence": 0.0-1.0
}`;

    const reasoning = await multiModelManager.request(
      reasoningPrompt,
      '당신은 논리적 추론 전문가입니다. 단계별로 명확하게 사고하고 결론을 도출하세요.',
      { primaryModel: 'gpt-4-turbo', temperature: 0.3 }
    );

    const reasoningData = JSON.parse(reasoning.content);
    
    reasoningData.reasoning?.forEach((r: any, index: number) => {
      steps.push({
        step: stepNumber++,
        thought: r.thought,
        action: `추론 단계 ${index + 1}`,
        result: r.conclusion,
        confidence: reasoningData.confidence || 0.8,
      });
    });

    // 5단계: 검증
    const validation = await this.validateAnswer(question, reasoningData.finalAnswer, steps);
    steps.push({
      step: stepNumber++,
      thought: validation.thought,
      action: '답변 검증',
      result: validation,
      confidence: validation.confidence,
    });

    const result: ReasoningChain = {
      goal: question,
      steps,
      finalAnswer: reasoningData.finalAnswer,
      confidence: validation.confidence,
    };

    // 자기 학습: 추론 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'advanced_reasoning',
      input: { question, context },
      output: result,
      success: validation.confidence >= 0.7,
      performance: validation.confidence,
      patterns: steps.map(s => s.action),
      improvements: validation.improvements || [],
    }).catch(err => console.error('추론 학습 오류:', err));

    // 자기 모니터링: 성능 추적
    selfMonitoringSystem.recordPerformance({
      task: 'advanced_reasoning',
      performance: validation.confidence,
      timestamp: new Date(),
    }).catch(err => console.error('성능 모니터링 오류:', err));

    return result;
  }

  /**
   * 문제 분석
   */
  private async analyzeProblem(question: string, context: Record<string, any>): Promise<any> {
    const prompt = `다음 문제를 분석하세요:

${question}

${Object.keys(context).length > 0 ? `컨텍스트: ${JSON.stringify(context, null, 2)}` : ''}

다음 형식으로 응답:
{
  "thought": "문제 분석 내용",
  "complexity": "low|medium|high",
  "requiredInfo": ["필요한 정보 목록"],
  "approach": "접근 방법"
}`;

    const response = await multiModelManager.request(
      prompt,
      '당신은 문제 분석 전문가입니다.',
      { primaryModel: 'gpt-4-turbo' }
    );

    return JSON.parse(response.content);
  }

  /**
   * 답변 검증
   */
  private async validateAnswer(question: string, answer: string, steps: ReasoningStep[]): Promise<any> {
    const prompt = `다음 질문과 답변을 검증하세요:

질문: ${question}
답변: ${answer}
추론 과정: ${JSON.stringify(steps.map(s => s.thought), null, 2)}

다음 형식으로 응답:
{
  "thought": "검증 과정",
  "valid": true/false,
  "confidence": 0.0-1.0,
  "issues": ["문제점 목록"],
  "improvements": ["개선 사항"]
}`;

    const response = await multiModelManager.request(
      prompt,
      '당신은 답변 검증 전문가입니다. 엄격하게 검증하세요.',
      { primaryModel: 'gpt-4-turbo', temperature: 0.2 }
    );

    return JSON.parse(response.content);
  }

  /**
   * 다단계 추론
   */
  async multiStepReasoning(question: string, maxSteps: number = 5): Promise<ReasoningChain> {
    const steps: ReasoningStep[] = [];
    let currentQuestion = question;
    let stepNumber = 1;

    while (stepNumber <= maxSteps) {
      const stepResult = await this.singleStepReasoning(currentQuestion, steps);
      steps.push({
        step: stepNumber++,
        thought: stepResult.thought,
        action: stepResult.action,
        result: stepResult.result,
        confidence: stepResult.confidence,
      });

      // 최종 답변에 도달했는지 확인
      if (stepResult.isFinal) {
        return {
          goal: question,
          steps,
          finalAnswer: stepResult.answer || '',
          confidence: stepResult.confidence,
        };
      }

      // 다음 단계로 진행
      currentQuestion = stepResult.nextQuestion || currentQuestion;
    }

    // 최종 답변 생성
    const finalAnswer = await this.synthesizeAnswer(question, steps);
    
    return {
      goal: question,
      steps,
      finalAnswer,
      confidence: steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length,
    };
  }

  /**
   * 단일 단계 추론
   */
  private async singleStepReasoning(question: string, previousSteps: ReasoningStep[]): Promise<any> {
    const prompt = `이전 단계: ${JSON.stringify(previousSteps.slice(-2), null, 2)}

현재 질문: ${question}

다음 단계를 수행하세요. 최종 답변에 도달했다면 isFinal: true로 설정하세요.

응답 형식:
{
  "thought": "사고 과정",
  "action": "수행한 작업",
  "result": "결과",
  "nextQuestion": "다음 질문 (필요시)",
  "isFinal": true/false,
  "answer": "최종 답변 (isFinal이 true일 때)",
  "confidence": 0.0-1.0
}`;

    const response = await multiModelManager.request(
      prompt,
      '당신은 단계별 추론 전문가입니다.',
      { primaryModel: 'gpt-4-turbo' }
    );

    return JSON.parse(response.content);
  }

  /**
   * 답변 종합
   */
  private async synthesizeAnswer(question: string, steps: ReasoningStep[]): Promise<string> {
    const prompt = `질문: ${question}

추론 과정:
${steps.map(s => `${s.step}. ${s.thought}: ${s.result || ''}`).join('\n')}

위 추론 과정을 바탕으로 최종 답변을 종합하세요.`;

    const response = await multiModelManager.request(
      prompt,
      '당신은 정보를 종합하는 전문가입니다.',
      { primaryModel: 'gpt-4-turbo' }
    );

    return response.content;
  }
}

export const advancedReasoning = new AdvancedReasoningEngine();

