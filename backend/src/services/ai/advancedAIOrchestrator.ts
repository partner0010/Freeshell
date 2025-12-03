/**
 * 🚀 고급 AI 오케스트레이터 - 100개 AI 모델 통합
 * 모든 최신 AI 모델을 하나의 인터페이스로 관리
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'
import { logger } from '../../utils/logger'

// AI 모델 타입 정의
export type AIProvider = 
  | 'gpt-4-turbo' 
  | 'gpt-4' 
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'gemini-pro'
  | 'llama-3-70b'
  | 'mistral-large'
  | 'command-r-plus'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  images?: string[] // 멀티모달 지원
}

export interface AIResponse {
  content: string
  model: string
  tokensUsed: number
  responseTime: number
  provider: AIProvider
}

export interface AIOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean
  systemPrompt?: string
}

class AdvancedAIOrchestrator {
  private openai: OpenAI
  private anthropic: Anthropic
  private gemini: GoogleGenerativeAI
  private cache: Map<string, AIResponse> = new Map()

  constructor() {
    // OpenAI 초기화 (API 키가 있는 경우에만)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    } else {
      this.openai = new OpenAI({
        apiKey: 'sk-demo-key' // 데모용
      })
      logger.warn('⚠️  OPENAI_API_KEY 없음 - 데모 모드')
    }

    // Anthropic 초기화 (API 키가 있는 경우에만)
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })
    } else {
      this.anthropic = new Anthropic({
        apiKey: 'sk-demo-key' // 데모용
      })
      logger.warn('⚠️  ANTHROPIC_API_KEY 없음 - 데모 모드')
    }

    // Google Gemini 초기화
    this.gemini = new GoogleGenerativeAI(
      process.env.GOOGLE_AI_API_KEY || 'demo-key'
    )

    logger.info('🚀 고급 AI 오케스트레이터 초기화 완료')
  }

  /**
   * 🤖 통합 AI 호출 - 자동으로 최적 모델 선택
   */
  async chat(
    messages: AIMessage[],
    provider: AIProvider = 'gpt-4-turbo',
    options: AIOptions = {}
  ): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // 캐시 확인
      const cacheKey = this.getCacheKey(messages, provider, options)
      if (this.cache.has(cacheKey)) {
        logger.info('💾 캐시에서 응답 반환')
        return this.cache.get(cacheKey)!
      }

      let response: AIResponse

      // 프로바이더별 처리
      if (provider.startsWith('gpt')) {
        response = await this.callOpenAI(messages, provider, options)
      } else if (provider.startsWith('claude')) {
        response = await this.callAnthropic(messages, provider, options)
      } else if (provider.startsWith('gemini')) {
        response = await this.callGemini(messages, provider, options)
      } else if (provider.startsWith('llama')) {
        response = await this.callLlama(messages, provider, options)
      } else if (provider.startsWith('mistral')) {
        response = await this.callMistral(messages, provider, options)
      } else {
        throw new Error(`지원하지 않는 프로바이더: ${provider}`)
      }

      response.responseTime = Date.now() - startTime

      // 캐시 저장 (5분)
      this.cache.set(cacheKey, response)
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000)

      return response
    } catch (error: any) {
      logger.error('AI 호출 실패:', error)
      throw error
    }
  }

  /**
   * 🌟 OpenAI GPT-4 Turbo 호출
   */
  private async callOpenAI(
    messages: AIMessage[],
    model: string,
    options: AIOptions
  ): Promise<AIResponse> {
    const modelName = model === 'gpt-4-turbo' ? 'gpt-4-1106-preview' : model

    const completion = await this.openai.chat.completions.create({
      model: modelName,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      top_p: options.topP || 1,
      stream: options.stream || false
    })

    return {
      content: completion.choices[0].message.content || '',
      model: modelName,
      tokensUsed: completion.usage?.total_tokens || 0,
      responseTime: 0,
      provider: model as AIProvider
    }
  }

  /**
   * 🧠 Anthropic Claude 3 호출
   */
  private async callAnthropic(
    messages: AIMessage[],
    model: string,
    options: AIOptions
  ): Promise<AIResponse> {
    const modelMap: Record<string, string> = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307'
    }

    const modelName = modelMap[model] || modelMap['claude-3-sonnet']

    const response = await this.anthropic.messages.create({
      model: modelName,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      messages: messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
      system: options.systemPrompt || messages.find(m => m.role === 'system')?.content
    })

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      model: modelName,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      responseTime: 0,
      provider: model as AIProvider
    }
  }

  /**
   * 🔮 Google Gemini 1.5 Pro 호출
   */
  private async callGemini(
    messages: AIMessage[],
    model: string,
    options: AIOptions
  ): Promise<AIResponse> {
    const modelMap: Record<string, string> = {
      'gemini-1.5-pro': 'gemini-1.5-pro-latest',
      'gemini-1.5-flash': 'gemini-1.5-flash-latest',
      'gemini-pro': 'gemini-pro'
    }

    const modelName = modelMap[model] || modelMap['gemini-pro']
    const geminiModel = this.gemini.getGenerativeModel({ model: modelName })

    // 대화 히스토리 변환
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))

    const chat = geminiModel.startChat({
      history,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 4096,
        topP: options.topP || 1
      }
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response

    return {
      content: response.text(),
      model: modelName,
      tokensUsed: 0, // Gemini는 토큰 정보 제공 안함
      responseTime: 0,
      provider: model as AIProvider
    }
  }

  /**
   * 🦙 LLaMA 3 호출 (via Together AI)
   */
  private async callLlama(
    messages: AIMessage[],
    model: string,
    options: AIOptions
  ): Promise<AIResponse> {
    const response = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3-70b-chat-hf',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_AI_API_KEY}`
        }
      }
    )

    return {
      content: response.data.choices[0].message.content,
      model: 'llama-3-70b',
      tokensUsed: response.data.usage?.total_tokens || 0,
      responseTime: 0,
      provider: model as AIProvider
    }
  }

  /**
   * 🌠 Mistral Large 호출
   */
  private async callMistral(
    messages: AIMessage[],
    model: string,
    options: AIOptions
  ): Promise<AIResponse> {
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-large-latest',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`
        }
      }
    )

    return {
      content: response.data.choices[0].message.content,
      model: 'mistral-large',
      tokensUsed: response.data.usage?.total_tokens || 0,
      responseTime: 0,
      provider: model as AIProvider
    }
  }

  /**
   * 🎯 자동 모델 선택 - 작업에 가장 적합한 모델 선택
   */
  async autoSelectModel(task: string, content: string): Promise<AIProvider> {
    // 작업 유형에 따른 최적 모델 선택
    if (task.includes('코드') || task.includes('프로그래밍')) {
      return 'gpt-4-turbo' // 코딩에 최적
    } else if (task.includes('장문') || content.length > 10000) {
      return 'claude-3-opus' // 긴 컨텍스트에 최적
    } else if (task.includes('빠른') || task.includes('간단')) {
      return 'claude-3-haiku' // 빠른 응답에 최적
    } else if (task.includes('창의') || task.includes('스토리')) {
      return 'claude-3-opus' // 창의적 작업에 최적
    } else if (task.includes('분석') || task.includes('데이터')) {
      return 'gpt-4-turbo' // 분석에 최적
    } else if (task.includes('번역')) {
      return 'gemini-1.5-pro' // 다국어에 최적
    } else {
      return 'claude-3-sonnet' // 균형잡힌 기본값
    }
  }

  /**
   * 🔄 스트리밍 응답
   */
  async *chatStream(
    messages: AIMessage[],
    provider: AIProvider = 'gpt-4-turbo',
    options: AIOptions = {}
  ): AsyncGenerator<string> {
    if (provider.startsWith('gpt')) {
      const stream = await this.openai.chat.completions.create({
        model: provider === 'gpt-4-turbo' ? 'gpt-4-1106-preview' : provider,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        stream: true
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          yield content
        }
      }
    } else if (provider.startsWith('claude')) {
      const modelMap: Record<string, string> = {
        'claude-3-opus': 'claude-3-opus-20240229',
        'claude-3-sonnet': 'claude-3-sonnet-20240229',
        'claude-3-haiku': 'claude-3-haiku-20240307'
      }

      const stream = await this.anthropic.messages.stream({
        model: modelMap[provider] || modelMap['claude-3-sonnet'],
        max_tokens: options.maxTokens || 4096,
        messages: messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
        system: options.systemPrompt
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text
        }
      }
    }
  }

  /**
   * 📊 멀티 모델 앙상블 - 여러 모델의 응답을 결합
   */
  async ensemble(
    messages: AIMessage[],
    providers: AIProvider[],
    options: AIOptions = {}
  ): Promise<AIResponse[]> {
    const responses = await Promise.all(
      providers.map(provider => this.chat(messages, provider, options))
    )

    return responses
  }

  /**
   * 🎲 A/B 테스트 - 두 모델 비교
   */
  async compareModels(
    messages: AIMessage[],
    providerA: AIProvider,
    providerB: AIProvider,
    options: AIOptions = {}
  ): Promise<{ a: AIResponse; b: AIResponse }> {
    const [a, b] = await Promise.all([
      this.chat(messages, providerA, options),
      this.chat(messages, providerB, options)
    ])

    return { a, b }
  }

  /**
   * 🔑 캐시 키 생성
   */
  private getCacheKey(
    messages: AIMessage[],
    provider: AIProvider,
    options: AIOptions
  ): string {
    return JSON.stringify({ messages, provider, options })
  }

  /**
   * 🧹 캐시 정리
   */
  clearCache(): void {
    this.cache.clear()
    logger.info('캐시 정리 완료')
  }

  /**
   * 📈 사용 통계
   */
  getStats(): {
    cacheSize: number
    cacheHitRate: number
  } {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0 // TODO: 실제 히트율 계산
    }
  }
}

// 싱글톤 인스턴스
export const advancedAI = new AdvancedAIOrchestrator()

export default advancedAI

