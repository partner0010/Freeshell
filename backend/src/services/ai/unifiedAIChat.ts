/**
 * 통합 AI 대화 시스템
 * 모든 AI 서비스를 하나의 인터페이스로 통합
 */

import { logger } from '../../utils/logger'
import { getCache, setCache } from '../../utils/cache'
import { getPrismaClient } from '../../utils/database'
import { ErrorMessageProvider } from '../../utils/errorMessages'
import { aiApiDuration, aiApiCalls, aiApiErrors, aiApiTokens, aiApiResponseTime } from '../monitoring/metrics'
import { openai } from './openaiClient'
import { anthropic } from './claudeClient'
import { geminiAI } from './geminiAI'
import { nanobanaAI } from './nanobanaAI'
import { klingAI } from './klingAI'
import { superToneAI } from './superToneAI'
import crypto from 'crypto'
import { 
  createCollaborationPlan, 
  generateCollaborationSummary, 
  type AIServiceType,
  type CollaborationPlan 
} from './aiOrchestrator'

export type AIService = 
  | 'openai' 
  | 'claude' 
  | 'gemini' 
  | 'nanobana' 
  | 'kling' 
  | 'supertone'
  | 'all' // 모든 AI 동시 사용

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  aiService?: AIService | AIService[]
  messageId?: string
  rating?: 1 | -1 | null
}

export interface ChatRequest {
  message: string
  aiService: AIService | AIService[] // 단일 또는 배열로 여러 AI 선택 가능
  conversationId?: string
  systemPrompt?: string
  options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }
}

export interface ChatResponse {
  response: string
  aiService: AIService | AIService[] // 단일 또는 배열
  conversationId: string
  timestamp: Date
  tokensUsed?: number
  model?: string
  responseTime?: number // 응답 시간 (초)
}

/**
 * 통합 AI 대화 서비스
 */
export class UnifiedAIChat {
  private conversations: Map<string, ChatMessage[]> = new Map() // 메모리 캐시
  private prisma = getPrismaClient()

  /**
   * AI와 대화 (캐싱 포함)
   */
  async chat(request: ChatRequest, userId?: string): Promise<ChatResponse> {
    const conversationId = request.conversationId || this.generateConversationId()
    
    // 대화 기록 로드 (메모리 또는 데이터베이스)
    let history = this.conversations.get(conversationId) || []
    if (history.length === 0 && request.conversationId) {
      // 기존 대화가 있으면 데이터베이스에서 로드
      history = await this.getConversation(conversationId, userId)
    }

    // 캐시 키 생성 (메시지 + AI 서비스 조합)
    const cacheKey = `ai-chat:${crypto.createHash('md5').update(
      request.message + JSON.stringify(request.aiService) + (request.systemPrompt || '')
    ).digest('hex')}`

    // 캐시 확인 (5분간 유효)
    const cached = await getCache(cacheKey) as ChatResponse | null
    if (cached) {
      logger.info('AI 응답 캐시 히트')
      return {
        response: cached.response,
        aiService: cached.aiService,
        conversationId,
        timestamp: new Date(),
        tokensUsed: cached.tokensUsed,
        model: cached.model
      }
    }

    // 대화 기록에 사용자 메시지 추가
    history.push({
      role: 'user',
      content: request.message,
      timestamp: new Date()
    })

    try {
      // 전체 응답 시간 측정 시작
      const chatStartTime = Date.now()
      
      let response: string
      let model: string | undefined
      let tokensUsed: number | undefined
      let selectedServices: AIService[] = []

      // AI 서비스 배열 처리
      if (Array.isArray(request.aiService)) {
        selectedServices = request.aiService
      } else if (request.aiService === 'all') {
        // 모든 사용 가능한 AI 선택
        selectedServices = this.getAvailableAIServices().filter(s => s !== 'all')
      } else {
        selectedServices = [request.aiService]
      }

      // 여러 AI 동시 사용 - 협업 모드
      if (selectedServices.length > 1) {
        // AI 협업 계획 수립
        const collabPlan = createCollaborationPlan(
          request.message, 
          selectedServices as AIServiceType[]
        )
        
        logger.info('AI 협업 모드 시작', { 
          taskType: collabPlan.taskType, 
          ais: collabPlan.selectedAIs,
          strategy: collabPlan.mergeStrategy 
        })

        // 협업 요약 생성
        const collabSummary = generateCollaborationSummary(collabPlan)
        
        // 병합 전략에 따라 실행
        if (collabPlan.mergeStrategy === 'sequential') {
          // 순차적 실행: 각 AI가 이전 결과를 개선
          response = await this.executeSequentialCollaboration(collabPlan, history, request)
        } else if (collabPlan.mergeStrategy === 'hierarchical') {
          // 계층적 실행: 각 AI가 작업 후 통합 AI가 최종 정리
          response = await this.executeHierarchicalCollaboration(collabPlan, history, request)
        } else {
          // 병렬 실행: 모든 AI 동시 실행 후 통합
          const responsePromises = selectedServices.map(service => {
            switch (service) {
              case 'openai':
                return this.chatWithOpenAI(request.message, history, request.systemPrompt, request.options)
              case 'claude':
                return this.chatWithClaude(request.message, history, request.systemPrompt, request.options)
              case 'gemini':
                return this.chatWithGemini(request.message, history, request.systemPrompt, request.options)
              case 'nanobana':
                return this.handleNanobanaRequest(request.message)
              case 'kling':
                return this.handleKlingRequest(request.message)
              case 'supertone':
                return this.handleSuperToneRequest(request.message)
              default:
                return Promise.reject(new Error(`지원하지 않는 AI 서비스: ${service}`))
            }
          })

          const responses = await Promise.allSettled(responsePromises)

          // 성공한 응답들을 결합
          const successfulResponses = responses
            .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
            .map(r => r.value)

          if (successfulResponses.length > 0) {
            // 선택된 AI들의 응답을 통합
            response = await this.mergeAIResponses(successfulResponses, request.message)
            model = `multiple-ai:${selectedServices.join('+')}`
          } else {
            throw new Error('모든 AI 서비스 호출 실패')
          }
        }
      } else {
        // 단일 AI 사용
        const service = selectedServices[0]
        switch (service) {
          case 'openai':
            response = await this.chatWithOpenAI(request.message, history, request.systemPrompt, request.options)
            model = 'gpt-4'
            break
          case 'claude':
            response = await this.chatWithClaude(request.message, history, request.systemPrompt, request.options)
            model = 'claude-3-sonnet'
            break
          case 'gemini':
            response = await this.chatWithGemini(request.message, history, request.systemPrompt, request.options)
            model = 'gemini-2.0-flash-exp'
            break
          case 'nanobana':
            // 나노바나는 이미지 생성 AI이므로 특별 처리
            response = await this.handleNanobanaRequest(request.message)
            model = 'nanobana'
            break
          case 'kling':
            // Kling은 비디오 생성 AI이므로 특별 처리
            response = await this.handleKlingRequest(request.message)
            model = 'kling'
            break
          case 'supertone':
            // SuperTone은 음성 생성 AI이므로 특별 처리
            response = await this.handleSuperToneRequest(request.message)
            model = 'supertone'
            break
          default:
            throw new Error(`지원하지 않는 AI 서비스: ${request.aiService}`)
        }
      }

      // 전체 응답 시간 계산
      const responseTime = (Date.now() - chatStartTime) / 1000 // 초 단위

      // 대화 기록에 응답 추가
      history.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        aiService: request.aiService
      })
      this.conversations.set(conversationId, history)

      const responseData = {
        response,
        aiService: Array.isArray(request.aiService) ? request.aiService : [request.aiService],
        conversationId,
        timestamp: new Date(),
        tokensUsed,
        model,
        responseTime // 응답 시간 추가
      }

      // 응답 캐싱 (5분간 유효)
      await setCache(cacheKey, responseData, 300)

      // 데이터베이스에 대화 기록 저장 (비동기, 실패해도 계속 진행)
      this.saveConversationToDB(conversationId, request, responseData, history, userId).catch(err => {
        logger.warn('대화 기록 저장 실패 (계속 진행):', err)
      })

      return responseData
    } catch (error: any) {
      logger.error('AI 대화 실패:', error)
      throw new Error(`AI 대화 실패: ${error.message}`)
    }
  }

  /**
   * OpenAI와 대화 (타임아웃 및 재시도 포함)
   */
  private async chatWithOpenAI(
    message: string,
    history: ChatMessage[],
    systemPrompt?: string,
    options?: any
  ): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다')
    }

    const messages: any[] = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }

    // 대화 기록 추가
    history.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    })

    messages.push({ role: 'user', content: message })

    // 재시도 로직 (최대 3회)
    const maxRetries = 3
    let lastError: Error | null = null
    const startTime = Date.now()

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 타임아웃 설정 (30초)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('OpenAI API 타임아웃')), 30000)
        })

        const apiPromise = openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2048
        })

        const response = await Promise.race([apiPromise, timeoutPromise])
        
        // 성능 메트릭 기록
        const duration = (Date.now() - startTime) / 1000
        aiApiDuration.observe({ provider: 'openai' }, duration)
        aiApiCalls.inc({ provider: 'openai', status: 'success' })
        aiApiResponseTime.observe({ provider: 'openai' }, duration)
        
        // 토큰 사용량 기록
        if (response.usage) {
          aiApiTokens.inc({ provider: 'openai', type: 'input' }, response.usage.prompt_tokens || 0)
          aiApiTokens.inc({ provider: 'openai', type: 'output' }, response.usage.completion_tokens || 0)
        }
        
        return response.choices[0]?.message?.content || '응답을 생성할 수 없습니다.'
      } catch (error: any) {
        lastError = error
        const duration = (Date.now() - startTime) / 1000
        aiApiErrors.inc({ provider: 'openai', error_type: error.message || 'unknown' })
        aiApiCalls.inc({ provider: 'openai', status: 'error' })
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // 지수 백오프
          logger.warn(`OpenAI API 호출 실패 (시도 ${attempt}/${maxRetries}), ${delay}ms 후 재시도...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    const errorDetails = ErrorMessageProvider.getAIError('OpenAI', lastError)
    const error = new Error(errorDetails.message) as any
    error.code = errorDetails.code
    error.suggestions = errorDetails.suggestions
    error.recoverable = errorDetails.recoverable
    throw error
  }

  /**
   * Claude와 대화 (타임아웃 및 재시도 포함)
   */
  private async chatWithClaude(
    message: string,
    history: ChatMessage[],
    systemPrompt?: string,
    options?: any
  ): Promise<string> {
    const startTime = Date.now()
    if (!anthropic) {
      throw new Error('Claude API 키가 설정되지 않았습니다')
    }

    // Claude는 시스템 메시지를 별도로 처리
    const systemMessage = systemPrompt || 'You are a helpful AI assistant.'

    // 대화 기록을 Claude 형식으로 변환
    const messages = history
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
        content: msg.content
      }))

    messages.push({ role: 'user' as const, content: message })

    // 재시도 로직 (최대 3회)
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 타임아웃 설정 (30초)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Claude API 타임아웃')), 30000)
        })

        const apiPromise = (anthropic as any).messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7,
          system: systemMessage,
          messages: messages as any
        })

        const response = await Promise.race([apiPromise, timeoutPromise])
        
        // 성능 메트릭 기록
        const duration = (Date.now() - startTime) / 1000
        aiApiDuration.observe({ provider: 'claude' }, duration)
        aiApiCalls.inc({ provider: 'claude', status: 'success' })
        aiApiResponseTime.observe({ provider: 'claude' }, duration)
        
        return response.content[0].type === 'text' 
          ? response.content[0].text 
          : '응답을 생성할 수 없습니다.'
      } catch (error: any) {
        lastError = error
        const duration = (Date.now() - startTime) / 1000
        aiApiErrors.inc({ provider: 'claude', error_type: error.message || 'unknown' })
        aiApiCalls.inc({ provider: 'claude', status: 'error' })
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // 지수 백오프
          logger.warn(`Claude API 호출 실패 (시도 ${attempt}/${maxRetries}), ${delay}ms 후 재시도...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    const errorDetails = ErrorMessageProvider.getAIError('Claude', lastError)
    const error = new Error(errorDetails.message) as any
    error.code = errorDetails.code
    error.suggestions = errorDetails.suggestions
    error.recoverable = errorDetails.recoverable
    throw error
  }

  /**
   * Gemini와 대화 (타임아웃 및 재시도 포함)
   */
  private async chatWithGemini(
    message: string,
    history: ChatMessage[],
    systemPrompt?: string,
    options?: any
  ): Promise<string> {
    const startTime = Date.now()
    const historyForGemini = history
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: msg.content
      }))

    // 재시도 로직 (최대 3회)
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 타임아웃 설정 (30초)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Gemini API 타임아웃')), 30000)
        })

        const apiPromise = geminiAI.chat(message, {
          systemPrompt,
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
          history: historyForGemini
        })

        const response = await Promise.race([apiPromise, timeoutPromise])
        
        // 성능 메트릭 기록
        const duration = (Date.now() - startTime) / 1000
        aiApiDuration.observe({ provider: 'gemini' }, duration)
        aiApiCalls.inc({ provider: 'gemini', status: 'success' })
        aiApiResponseTime.observe({ provider: 'gemini' }, duration)
        
        return response
      } catch (error: any) {
        lastError = error
        const duration = (Date.now() - startTime) / 1000
        aiApiErrors.inc({ provider: 'gemini', error_type: error.message || 'unknown' })
        aiApiCalls.inc({ provider: 'gemini', status: 'error' })
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // 지수 백오프
          logger.warn(`Gemini API 호출 실패 (시도 ${attempt}/${maxRetries}), ${delay}ms 후 재시도...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    const errorDetails = ErrorMessageProvider.getAIError('Gemini', lastError)
    const error = new Error(errorDetails.message) as any
    error.code = errorDetails.code
    error.suggestions = errorDetails.suggestions
    error.recoverable = errorDetails.recoverable
    throw error
  }

  /**
   * 여러 AI 응답 통합 (개선 버전)
   * - 응답 길이, 품질, 일관성 분석
   * - 가장 좋은 응답 선택 또는 통합
   */
  private async mergeAIResponses(
    responses: string[],
    userMessage: string
  ): Promise<string> {
    if (responses.length === 1) {
      return responses[0]
    }

    // 응답 품질 분석
    const analyzedResponses = responses.map((response, index) => {
      const length = response.length
      const hasDetails = response.split('\n').length > 3 // 여러 줄로 구성
      const hasCode = response.includes('```') || response.includes('`')
      const hasList = response.includes('-') || response.includes('*') || response.includes('1.')
      
      // 품질 점수 계산
      let qualityScore = 0
      if (length > 100) qualityScore += 2 // 충분한 길이
      if (length > 500) qualityScore += 1 // 매우 상세
      if (hasDetails) qualityScore += 1
      if (hasCode) qualityScore += 1
      if (hasList) qualityScore += 1
      
      return { index, response, length, qualityScore }
    })

    // 가장 높은 품질 점수의 응답 찾기
    const bestResponse = analyzedResponses.reduce((best, current) => 
      current.qualityScore > best.qualityScore ? current : best
    )

    // 모든 응답이 비슷한 품질이면 통합, 아니면 최고 품질 응답 사용
    const qualityVariance = analyzedResponses.reduce((sum, r) => 
      sum + Math.abs(r.qualityScore - bestResponse.qualityScore), 0
    ) / analyzedResponses.length

    if (qualityVariance < 1 && responses.length <= 3) {
      // 품질이 비슷하면 통합 시도
      const combined = responses
        .map((r, i) => `[AI ${i + 1}]: ${r}`)
        .join('\n\n')

      try {
        const merged = await geminiAI.chat(
          `다음은 여러 AI의 응답입니다. 사용자의 질문에 대한 최선의 통합 답변을 제공하세요. 중복을 제거하고 핵심 내용만 포함하세요.\n\n사용자 질문: ${userMessage}\n\nAI 응답들:\n${combined}`,
          {
            systemPrompt: 'You are an AI that synthesizes responses from multiple AI assistants. Provide a concise, comprehensive answer that combines the best insights from all responses.',
            temperature: 0.5,
            maxTokens: 3000
          }
        )
        return merged
      } catch (error) {
        logger.warn('AI 응답 통합 실패, 최고 품질 응답 사용:', error)
        return bestResponse.response
      }
    } else {
      // 품질 차이가 크면 최고 품질 응답 사용
      return bestResponse.response
    }
  }

  /**
   * 나노바나 요청 처리 (이미지 생성)
   */
  private async handleNanobanaRequest(message: string): Promise<string> {
    try {
      const imagePath = await nanobanaAI.generateCharacter(message, 'anime')
      return `이미지가 생성되었습니다: ${imagePath}`
    } catch (error: any) {
      return `이미지 생성 실패: ${error.message}`
    }
  }

  /**
   * Kling 요청 처리 (비디오 생성)
   */
  private async handleKlingRequest(message: string): Promise<string> {
    try {
      const videoPath = await klingAI.generateVideoFromText(message)
      return `비디오가 생성되었습니다: ${videoPath}`
    } catch (error: any) {
      return `비디오 생성 실패: ${error.message}`
    }
  }

  /**
   * SuperTone 요청 처리 (음성 생성)
   */
  private async handleSuperToneRequest(message: string): Promise<string> {
    try {
      const audioPath = await superToneAI.generateNarration(message)
      return `음성이 생성되었습니다: ${audioPath}`
    } catch (error: any) {
      return `음성 생성 실패: ${error.message}`
    }
  }

  /**
   * 대화 기록을 데이터베이스에 저장
   */
  private async saveConversationToDB(
    conversationId: string,
    request: ChatRequest,
    response: ChatResponse,
    history: ChatMessage[],
    userId?: string
  ): Promise<void> {
    try {
      const aiServicesJson = JSON.stringify(
        Array.isArray(request.aiService) ? request.aiService : [request.aiService]
      )

      // 대화가 이미 존재하는지 확인
      let conversation = await this.prisma.aIConversation.findUnique({
        where: { id: conversationId }
      })

      if (!conversation) {
        // 새 대화 생성
        const firstUserMessage = history.find(m => m.role === 'user')
        conversation = await this.prisma.aIConversation.create({
          data: {
            id: conversationId,
            userId: userId || null,
            title: firstUserMessage?.content.substring(0, 100) || '새 대화',
            aiServices: aiServicesJson,
            messageCount: history.length
          }
        })
      } else {
        // 기존 대화 업데이트
        await this.prisma.aIConversation.update({
          where: { id: conversationId },
          data: {
            messageCount: history.length,
            updatedAt: new Date()
          }
        })
      }

      // 마지막 메시지들 저장 (사용자 메시지 + AI 응답)
      const lastUserMessage = history.filter(m => m.role === 'user').slice(-1)[0]
      const lastAssistantMessage = history.filter(m => m.role === 'assistant').slice(-1)[0]

      if (lastUserMessage) {
        await this.prisma.aIMessage.upsert({
          where: {
            id: `${conversationId}_user_${lastUserMessage.timestamp?.getTime()}`
          },
          update: {},
          create: {
            id: `${conversationId}_user_${lastUserMessage.timestamp?.getTime()}`,
            conversationId,
            role: 'user',
            content: lastUserMessage.content,
            createdAt: lastUserMessage.timestamp || new Date()
          }
        })
      }

      if (lastAssistantMessage) {
        await this.prisma.aIMessage.upsert({
          where: {
            id: `${conversationId}_assistant_${lastAssistantMessage.timestamp?.getTime()}`
          },
          update: {},
          create: {
            id: `${conversationId}_assistant_${lastAssistantMessage.timestamp?.getTime()}`,
            conversationId,
            role: 'assistant',
            content: lastAssistantMessage.content,
            aiService: Array.isArray(response.aiService) 
              ? response.aiService.join(',') 
              : response.aiService,
            tokensUsed: response.tokensUsed || null,
            responseTime: response.responseTime || null, // 응답 시간 저장
            createdAt: lastAssistantMessage.timestamp || new Date()
          }
        })
      }
    } catch (error: any) {
      logger.error('대화 기록 저장 실패:', error)
      throw error
    }
  }

  /**
   * 대화 기록 조회 (데이터베이스에서)
   */
  async getConversation(conversationId: string, userId?: string): Promise<ChatMessage[]> {
    // 먼저 메모리 캐시 확인
    const memoryHistory = this.conversations.get(conversationId)
    if (memoryHistory && memoryHistory.length > 0) {
      return memoryHistory
    }

    // 데이터베이스에서 조회
    try {
      const conversation = await this.prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!conversation) {
        return []
      }

      // 사용자 확인 (선택적)
      if (userId && conversation.userId && conversation.userId !== userId) {
        throw new Error('대화 기록에 접근할 권한이 없습니다')
      }

      // 데이터베이스 메시지를 ChatMessage 형식으로 변환
      const messages: ChatMessage[] = conversation.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.createdAt,
        aiService: msg.aiService ? msg.aiService.split(',') as any : undefined,
        messageId: msg.id, // DB 메시지 ID 포함
        rating: (msg.rating === 1 || msg.rating === -1) ? msg.rating : null
      }))

      // 메모리 캐시에 저장
      this.conversations.set(conversationId, messages)

      return messages
    } catch (error: any) {
      logger.error('대화 기록 조회 실패:', error)
      return []
    }
  }

  /**
   * 대화 기록 삭제
   */
  async deleteConversation(conversationId: string, userId?: string): Promise<void> {
    // 메모리 캐시에서 삭제
    this.conversations.delete(conversationId)

    // 데이터베이스에서 삭제
    try {
      if (userId) {
        // 사용자 확인 후 삭제
        const conversation = await this.prisma.aIConversation.findUnique({
          where: { id: conversationId }
        })

        if (conversation && conversation.userId !== userId) {
          throw new Error('대화 기록을 삭제할 권한이 없습니다')
        }
      }

      await this.prisma.aIConversation.delete({
        where: { id: conversationId }
      })
    } catch (error: any) {
      logger.error('대화 기록 삭제 실패:', error)
      throw error
    }
  }

  /**
   * 스트리밍 대화 (실시간 응답)
   */
  async chatStream(
    request: ChatRequest,
    userId: string | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const conversationId = request.conversationId || this.generateConversationId()
    
    // 대화 기록 로드
    let history = this.conversations.get(conversationId) || []
    if (history.length === 0 && request.conversationId) {
      history = await this.getConversation(conversationId, userId)
    }

    // 사용자 메시지 추가
    history.push({
      role: 'user',
      content: request.message,
      timestamp: new Date()
    })

    try {
      // 전체 응답 시간 측정 시작
      const streamStartTime = Date.now()
      
      // 단일 AI만 스트리밍 지원 (다중 AI는 복잡하므로 일반 응답 사용)
      const selectedServices = Array.isArray(request.aiService) 
        ? request.aiService[0] 
        : (request.aiService === 'all' ? 'gemini' : request.aiService)

      let fullResponse = ''
      
      // 스트리밍 지원 AI 선택
      switch (selectedServices) {
        case 'openai':
          fullResponse = await this.chatWithOpenAIStream(
            request.message,
            history,
            request.systemPrompt,
            request.options,
            onChunk
          )
          break
        case 'gemini':
          fullResponse = await this.chatWithGeminiStream(
            request.message,
            history,
            request.systemPrompt,
            request.options,
            onChunk
          )
          break
        default:
          // 스트리밍 미지원 AI는 일반 응답 사용
          const response = await this.chat(request, userId)
          fullResponse = response.response
          // 전체 응답을 한 번에 전송
          onChunk(fullResponse)
      }

      // 전체 응답 시간 계산
      const responseTime = (Date.now() - streamStartTime) / 1000 // 초 단위

      // 대화 기록에 응답 추가
      history.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        aiService: selectedServices
      })
      this.conversations.set(conversationId, history)

      // 데이터베이스 저장 (비동기)
      const responseData = {
        response: fullResponse,
        aiService: [selectedServices],
        conversationId,
        timestamp: new Date(),
        tokensUsed: undefined,
        model: selectedServices,
        responseTime // 응답 시간 추가
      }
      
      this.saveConversationToDB(conversationId, request, responseData, history, userId).catch(err => {
        logger.warn('대화 기록 저장 실패 (계속 진행):', err)
      })
    } catch (error: any) {
      logger.error('스트리밍 대화 실패:', error)
      throw error
    }
  }

  /**
   * OpenAI 스트리밍 대화
   */
  private async chatWithOpenAIStream(
    message: string,
    history: ChatMessage[],
    systemPrompt?: string,
    options?: any,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다')
    }

    const messages: any[] = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    history.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content })
      }
    })
    messages.push({ role: 'user', content: message })

    let fullResponse = ''

    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2048,
        stream: true
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          onChunk?.(content)
        }
      }
    } catch (error: any) {
      logger.error('OpenAI 스트리밍 실패:', error)
      throw error
    }

    return fullResponse
  }

  /**
   * Gemini 스트리밍 대화 (실제 스트리밍 지원)
   */
  private async chatWithGeminiStream(
    message: string,
    history: ChatMessage[],
    systemPrompt?: string,
    options?: any,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      // geminiAI 서비스에 스트리밍 지원이 있는지 확인
      if (geminiAI && typeof (geminiAI as any).chatStream === 'function') {
        // 실제 스트리밍 사용
        const historyForGemini = history
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content
          }))

        return await (geminiAI as any).chatStream(
          message,
          {
            systemPrompt,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
            history: historyForGemini
          },
          onChunk
        )
      }

      // 스트리밍 미지원 시 일반 응답 사용 후 시뮬레이션
      const response = await this.chatWithGemini(message, history, systemPrompt, options)
      
      // 시뮬레이션: 응답을 작은 청크로 나누어 전송 (더 자연스럽게)
      const chunkSize = 15
      const words = response.split(/(\s+)/)
      let currentChunk = ''
      
      for (const word of words) {
        currentChunk += word
        if (currentChunk.length >= chunkSize || word.match(/[.!?]\s*$/)) {
          onChunk?.(currentChunk)
          currentChunk = ''
          // 자연스러운 스트리밍 효과를 위한 약간의 지연
          await new Promise(resolve => setTimeout(resolve, 30))
        }
      }
      
      // 남은 청크 전송
      if (currentChunk) {
        onChunk?.(currentChunk)
      }
      
      return response
    } catch (error: any) {
      logger.error('Gemini 스트리밍 실패, 일반 응답 사용', error)
      // 실패 시 일반 응답 반환
      return await this.chatWithGemini(message, history, systemPrompt, options)
    }
  }

  /**
   * 대화 기록 검색 (캐싱 포함)
   */
  async searchConversations(
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<Array<{
    conversationId: string
    title: string
    messageId: string
    content: string
    role: string
    createdAt: Date
    relevanceScore?: number
  }>> {
    try {
      // 캐시 키 생성
      const cacheKey = `ai-search:${userId}:${crypto.createHash('md5').update(query.toLowerCase().trim()).digest('hex')}`
      
      // 캐시 확인 (5분간 유효)
      const cached = await getCache(cacheKey)
      if (cached) {
        logger.info('검색 결과 캐시 히트')
        return cached as any
      }

      // SQLite의 LIKE 검색 사용 (간단한 텍스트 검색)
      const searchTerm = `%${query}%`
      
      // 사용자의 대화에서 검색
      const messages = await this.prisma.aIMessage.findMany({
        where: {
          conversation: {
            userId
          },
          content: {
            contains: query // Prisma의 contains는 대소문자 구분 안 함
          }
        },
        include: {
          conversation: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      // 결과 포맷팅
      const results = messages.map(msg => ({
        conversationId: msg.conversationId,
        title: msg.conversation.title || '제목 없음',
        messageId: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt,
        // 간단한 관련도 점수 (검색어가 포함된 정도)
        relevanceScore: this.calculateRelevanceScore(msg.content, query)
      }))

      // 관련도 점수로 정렬
      results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

      // 캐시 저장 (5분간 유효)
      await setCache(cacheKey, results, 300)

      return results
    } catch (error: any) {
      logger.error('대화 검색 실패:', error)
      return []
    }
  }

  /**
   * 관련도 점수 계산 (간단한 버전)
   */
  private calculateRelevanceScore(content: string, query: string): number {
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    
    // 검색어가 정확히 일치하는 경우 높은 점수
    if (lowerContent.includes(lowerQuery)) {
      const occurrences = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length
      return Math.min(occurrences * 10, 100) // 최대 100점
    }
    
    // 단어 단위로 검색
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0)
    const matchedWords = queryWords.filter(word => lowerContent.includes(word)).length
    
    if (queryWords.length > 0) {
      return (matchedWords / queryWords.length) * 50 // 최대 50점
    }
    
    return 0
  }

  /**
   * 메시지 평가 (좋아요/싫어요)
   */
  async rateMessage(messageId: string, rating: 1 | -1, userId?: string): Promise<boolean> {
    try {
      // 메시지 조회 및 권한 확인
      const message = await this.prisma.aIMessage.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            select: {
              userId: true
            }
          }
        }
      })

      if (!message) {
        throw new Error('메시지를 찾을 수 없습니다')
      }

      // 권한 확인 (자신의 대화만 평가 가능)
      if (userId && message.conversation.userId && message.conversation.userId !== userId) {
        throw new Error('이 메시지를 평가할 권한이 없습니다')
      }

      // 평가 업데이트
      await this.prisma.aIMessage.update({
        where: { id: messageId },
        data: { rating }
      })

      return true
    } catch (error: any) {
      logger.error('메시지 평가 실패:', error)
      throw error
    }
  }

  /**
   * 평가 통계 조회
   */
  async getRatingStats(userId: string): Promise<{
    total: number
    positive: number
    negative: number
    positiveRate: number
  }> {
    try {
      const stats = await this.prisma.aIMessage.groupBy({
        by: ['rating'],
        where: {
          conversation: {
            userId
          },
          role: 'assistant',
          rating: {
            not: null
          }
        },
        _count: {
          id: true
        }
      })

      const positive = stats.find(s => s.rating === 1)?._count.id || 0
      const negative = stats.find(s => s.rating === -1)?._count.id || 0
      const total = positive + negative

      return {
        total,
        positive,
        negative,
        positiveRate: total > 0 ? (positive / total) * 100 : 0
      }
    } catch (error: any) {
      logger.error('평가 통계 조회 실패:', error)
      return {
        total: 0,
        positive: 0,
        negative: 0,
        positiveRate: 0
      }
    }
  }

  /**
   * 사용자의 모든 대화 목록 조회 (페이지네이션 지원)
   */
  async getUserConversations(
    userId: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    conversations: Array<{
      id: string
      title: string
      messageCount: number
      createdAt: Date
      updatedAt: Date
    }>
    total: number
    hasMore: boolean
  }> {
    try {
      // 전체 개수 조회
      const total = await this.prisma.aIConversation.count({
        where: { userId }
      })

      // 페이지네이션된 대화 목록 조회
      const conversations = await this.prisma.aIConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          messageCount: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return {
        conversations: conversations.map(conv => ({
          ...conv,
          title: conv.title || '제목 없음'
        })),
        total,
        hasMore: offset + limit < total
      }
    } catch (error: any) {
      logger.error('대화 목록 조회 실패:', error)
      return {
        conversations: [],
        total: 0,
        hasMore: false
      }
    }
  }

  /**
   * 대화 ID 생성
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  /**
   * 사용 가능한 AI 서비스 목록
   */
  getAvailableAIServices(): AIService[] {
    const available: AIService[] = []

    if (process.env.OPENAI_API_KEY) available.push('openai')
    if (process.env.CLAUDE_API_KEY) available.push('claude')
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) available.push('gemini')
    if (process.env.NANOBANA_API_KEY || process.env.GOOGLE_AI_API_KEY) available.push('nanobana')
    if (process.env.KLING_API_KEY) available.push('kling')
    if (process.env.SUPERTONE_API_KEY) available.push('supertone')

    if (available.length > 1) available.push('all')

    return available
  }

  /**
   * 순차적 AI 협업 실행
   * 각 AI가 이전 AI의 결과를 개선
   */
  private async executeSequentialCollaboration(
    plan: CollaborationPlan,
    history: ChatMessage[],
    request: ChatRequest
  ): Promise<string> {
    let currentResult = ''
    let currentPrompt = request.message

    for (const step of plan.steps) {
      logger.info(`협업 단계 ${step.step}: ${step.ai} - ${step.role}`)

      // 이전 결과가 있으면 프롬프트에 포함
      if (currentResult) {
        currentPrompt = `이전 AI(${plan.steps[step.step - 2]?.ai})의 결과를 개선하세요.\n\n[이전 결과]\n${currentResult}\n\n[원래 요청]\n${request.message}\n\n[당신의 역할]\n${step.role}`
      } else {
        currentPrompt = `${step.role}의 관점에서 다음 요청에 답변하세요:\n\n${request.message}`
      }

      // AI 실행
      currentResult = await this.executeAI(step.ai as AIService, currentPrompt, history, request)
    }

    // 최종 결과에 협업 정보 추가
    const summary = `🤝 **AI 협업 결과** (${plan.selectedAIs.join(' → ')})\n\n${currentResult}\n\n---\n*${plan.selectedAIs.length}개의 AI가 순차적으로 협업하여 결과를 개선했습니다.*`
    
    return summary
  }

  /**
   * 계층적 AI 협업 실행
   * 각 AI가 독립적으로 작업 후 통합
   */
  private async executeHierarchicalCollaboration(
    plan: CollaborationPlan,
    history: ChatMessage[],
    request: ChatRequest
  ): Promise<string> {
    const results: Array<{ ai: string, role: string, result: string }> = []

    // 모든 AI 병렬 실행
    const promises = plan.steps.map(async (step) => {
      logger.info(`협업 단계 ${step.step}: ${step.ai} - ${step.role}`)
      
      const prompt = `${step.role}의 관점에서 다음 요청에 답변하세요:\n\n${request.message}`
      const result = await this.executeAI(step.ai as AIService, prompt, history, request)
      
      return {
        ai: step.ai,
        role: step.role,
        result
      }
    })

    const executedResults = await Promise.all(promises)
    results.push(...executedResults)

    // Claude를 사용해 통합 (가장 분석 능력이 뛰어남)
    const integratorAI = plan.selectedAIs.includes('claude' as AIServiceType) ? 'claude' : plan.selectedAIs[0]
    
    const integrationPrompt = `다음은 여러 AI가 같은 질문에 대해 각자의 관점에서 답변한 내용입니다. 이를 종합하여 최고의 답변을 만들어주세요.\n\n` +
      results.map((r, i) => `**${i + 1}. ${r.ai.toUpperCase()} - ${r.role}**\n${r.result}\n`).join('\n---\n\n') +
      `\n\n**원래 질문**: ${request.message}\n\n위 답변들을 분석하고 통합하여, 가장 완벽한 답변을 작성해주세요.`

    const finalResult = await this.executeAI(integratorAI as AIService, integrationPrompt, history, request)

    // 최종 결과에 협업 정보 추가
    const summary = `🤝 **AI 협업 결과** (${plan.selectedAIs.join(' + ')})\n\n${finalResult}\n\n---\n*${plan.selectedAIs.length}개의 AI가 협업하여 각자의 전문성을 발휘했습니다.*`
    
    return summary
  }

  /**
   * 개별 AI 실행 헬퍼
   */
  private async executeAI(
    service: AIService,
    message: string,
    history: ChatMessage[],
    request: ChatRequest
  ): Promise<string> {
    try {
      switch (service) {
        case 'openai':
          return await this.chatWithOpenAI(message, history, request.systemPrompt, request.options)
        case 'claude':
          return await this.chatWithClaude(message, history, request.systemPrompt, request.options)
        case 'gemini':
          return await this.chatWithGemini(message, history, request.systemPrompt, request.options)
        case 'nanobana':
          return await this.handleNanobanaRequest(message)
        case 'kling':
          return await this.handleKlingRequest(message)
        case 'supertone':
          return await this.handleSuperToneRequest(message)
        default:
          throw new Error(`지원하지 않는 AI 서비스: ${service}`)
      }
    } catch (error: any) {
      logger.error(`${service} AI 실행 실패:`, error)
      return `[${service} 오류: ${error.message}]`
    }
  }
}

export const unifiedAIChat = new UnifiedAIChat()

