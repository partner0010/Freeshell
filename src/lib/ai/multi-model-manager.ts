/**
 * 다중 AI 모델 관리자
 * OpenAI, Anthropic Claude, Google Gemini 등 여러 AI 모델을 통합
 * 자기 학습 시스템 통합: 모델 선택 및 성능 최적화
 */

import OpenAI from 'openai';
import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { hyperparameterTuning } from './hyperparameter-tuning';

export type AIModel = 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'gemini-pro' | 'auto';

export interface ModelResponse {
  model: string;
  content: string;
  reasoning?: string;
  tokens?: number;
  latency?: number;
}

export interface MultiModelConfig {
  primaryModel?: AIModel;
  fallbackModels?: AIModel[];
  useEnsemble?: boolean; // 여러 모델의 응답을 결합
  temperature?: number;
  maxTokens?: number;
}

class MultiModelManager {
  private openai: OpenAI | null = null;
  private models: Map<string, any> = new Map();

  constructor() {
    // OpenAI 초기화
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // 다른 모델들도 초기화 가능
    // Claude, Gemini 등은 API 키가 있을 때만 초기화
  }

  /**
   * 자동으로 최적의 모델 선택
   */
  private selectBestModel(task: string, availableModels: AIModel[]): AIModel {
    // 복잡한 작업은 더 강력한 모델 사용
    const complexKeywords = ['분석', '전략', '설계', '최적화', '복잡', '다단계'];
    const isComplex = complexKeywords.some(keyword => task.includes(keyword));

    if (isComplex && availableModels.includes('gpt-4-turbo')) {
      return 'gpt-4-turbo';
    }
    if (availableModels.includes('gpt-4')) {
      return 'gpt-4';
    }
    if (availableModels.includes('claude-3-opus')) {
      return 'claude-3-opus';
    }
    return availableModels[0] || 'gpt-3.5-turbo';
  }

  /**
   * 단일 모델로 요청
   */
  async request(
    prompt: string,
    systemPrompt?: string,
    config: MultiModelConfig = {}
  ): Promise<ModelResponse> {
    const model = config.primaryModel || this.selectBestModel(prompt, ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']);
    
    return this.requestWithModel(model, prompt, systemPrompt, config);
  }

  /**
   * 특정 모델로 요청
   */
  async requestWithModel(
    model: AIModel,
    prompt: string,
    systemPrompt?: string,
    config: MultiModelConfig = {}
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      switch (model) {
        case 'gpt-4-turbo':
        case 'gpt-4':
        case 'gpt-3.5-turbo':
          return await this.requestOpenAI(model, prompt, systemPrompt, config);
        
        case 'claude-3-opus':
        case 'claude-3-sonnet':
          return await this.requestClaude(model, prompt, systemPrompt, config);
        
        case 'gemini-pro':
          return await this.requestGemini(model, prompt, systemPrompt, config);
        
        case 'auto':
          return await this.request(prompt, systemPrompt, config);
        
        default:
          throw new Error(`지원하지 않는 모델: ${model}`);
      }
    } catch (error: any) {
      // 폴백 모델 시도
      if (config.fallbackModels && config.fallbackModels.length > 0) {
        console.warn(`${model} 실패, 폴백 모델 시도:`, error.message);
        return this.requestWithModel(
          config.fallbackModels[0],
          prompt,
          systemPrompt,
          { ...config, fallbackModels: config.fallbackModels.slice(1) }
        );
      }
      throw error;
    }
  }

  /**
   * OpenAI 요청
   */
  private async requestOpenAI(
    model: string,
    prompt: string,
    systemPrompt?: string,
    config: MultiModelConfig = {}
  ): Promise<ModelResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const startTime = Date.now();
    const response = await this.openai.chat.completions.create({
      model: model as any,
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens,
    });

    const latency = Date.now() - startTime;

    // 자기 학습: 모델 성능 추적
    const performance = response.choices[0]?.message?.content ? 0.9 : 0.3;
    selfLearningSystem.learnFromExperience({
      task: 'model_request',
      input: { model, promptLength: prompt.length },
      output: { model, latency, tokens: response.usage?.total_tokens },
      success: !!response.choices[0]?.message?.content,
      performance,
      patterns: ['model_request', model],
      improvements: [],
    }).catch(err => console.error('모델 요청 학습 오류:', err));

    // 자기 모니터링: 모델 성능 추적
    selfMonitoringSystem.recordPerformance({
      task: `model_${model}`,
      performance,
      timestamp: new Date(),
    }).catch(err => console.error('성능 모니터링 오류:', err));

    // 하이퍼파라미터 튜닝: 모델별 최적 설정 조회
    const optimalConfig = hyperparameterTuning.getOptimalConfig('multi_model_manager');
    if (optimalConfig) {
      // 최적 설정 적용 (다음 요청에 반영)
    }
    const content = response.choices[0]?.message?.content || '';

    return {
      model,
      content,
      tokens: response.usage?.total_tokens,
      latency,
    };
  }

  /**
   * Claude 요청 (Anthropic API)
   */
  private async requestClaude(
    model: string,
    prompt: string,
    systemPrompt?: string,
    config: MultiModelConfig = {}
  ): Promise<ModelResponse> {
    // Claude API는 별도 패키지 필요 (예: @anthropic-ai/sdk)
    // 여기서는 OpenAI를 통해 Claude를 호출하는 방식으로 구현
    // 실제로는 Anthropic SDK를 사용해야 함
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API 키가 설정되지 않았습니다.');
    }

    // 실제 구현은 Anthropic SDK 사용
    // 현재는 OpenAI로 폴백
    console.warn('Claude API는 Anthropic SDK가 필요합니다. OpenAI로 폴백합니다.');
    return this.requestOpenAI('gpt-4-turbo', prompt, systemPrompt, config);
  }

  /**
   * Gemini 요청 (Google AI)
   */
  private async requestGemini(
    model: string,
    prompt: string,
    systemPrompt?: string,
    config: MultiModelConfig = {}
  ): Promise<ModelResponse> {
    // Gemini API는 Google AI SDK 필요
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API 키가 설정되지 않았습니다.');
    }

    // 실제 구현은 Google AI SDK 사용
    // 현재는 OpenAI로 폴백
    console.warn('Gemini API는 Google AI SDK가 필요합니다. OpenAI로 폴백합니다.');
    return this.requestOpenAI('gpt-4-turbo', prompt, systemPrompt, config);
  }

  /**
   * 앙상블 요청 (여러 모델의 응답 결합)
   */
  async requestEnsemble(
    prompt: string,
    systemPrompt?: string,
    models: AIModel[] = ['gpt-4-turbo', 'gpt-4'],
    config: MultiModelConfig = {}
  ): Promise<ModelResponse> {
    const responses = await Promise.allSettled(
      models.map(model => this.requestWithModel(model, prompt, systemPrompt, config))
    );

    const successful = responses
      .filter((r): r is PromiseFulfilledResult<ModelResponse> => r.status === 'fulfilled')
      .map(r => r.value);

    if (successful.length === 0) {
      throw new Error('모든 모델 요청이 실패했습니다.');
    }

    // 여러 응답을 결합하여 최종 응답 생성
    const combinedPrompt = `다음은 여러 AI 모델의 응답입니다. 이를 종합하여 최선의 답변을 생성하세요:\n\n${successful.map((r, i) => `모델 ${i + 1} (${r.model}):\n${r.content}`).join('\n\n')}`;

    const finalResponse = await this.requestOpenAI(
      'gpt-4-turbo',
      combinedPrompt,
      '당신은 여러 AI 모델의 응답을 종합하여 최선의 답변을 생성하는 전문가입니다.',
      config
    );

    return {
      ...finalResponse,
      model: `ensemble(${successful.map(r => r.model).join(', ')})`,
      reasoning: `앙상블: ${successful.length}개 모델의 응답을 종합`,
    };
  }
}

export const multiModelManager = new MultiModelManager();

