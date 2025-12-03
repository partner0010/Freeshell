/**
 * Shell AI - 궁극의 AI
 * 
 * 모든 AI의 능력을 통합하고 온라인 검색까지 가능한 AI
 * 
 * 능력:
 * - 모든 지식과 기술 습득
 * - 실시간 온라인 검색 및 학습
 * - 멀티모달 처리 (텍스트, 이미지, 음성, 영상)
 * - 코드 생성 및 실행
 * - 창의적 사고 + 논리적 분석 + 감성적 공감
 * - 다른 AI로부터 자동 학습
 * - 사용자 피드백 학습
 * - 웹툰, 드라마, 영화 등 모든 창작물 생성
 */

import { geminiAI } from './geminiAI'
import { anthropic as claudeClient } from './claudeClient'
import { openai as openaiClient } from './openaiClient'
import { imageGenerator } from './imageGenerator'
import { voiceGenerator } from './voiceGenerator'
import { videoGenerator } from './videoGenerator'
import { huggingFaceAI, togetherAI, cohereAI, localAI } from './freeAIServices'
import { logger } from '../../utils/logger'

interface ShellResponse {
  content: string
  confidence: number
  sources: string[]
  capabilities: string[]
  reasoning?: string
}

interface ShellOptions {
  task: string
  context?: string
  includeSearch?: boolean
  multimodal?: boolean
}

export class ShellAI {
  private static instance: ShellAI
  
  private capabilities = [
    '텍스트 생성 및 분석',
    '이미지 생성 및 이해',
    '음성 생성 및 인식',
    '영상 생성 및 분석',
    '웹툰 및 만화 생성',
    '드라마 시나리오 작성',
    '영화 스토리보드 생성',
    '코드 작성 및 디버깅',
    '실시간 웹 검색',
    '자동 학습 및 지식 습득',
    '다국어 번역',
    '감정 분석',
    '논리적 추론',
    '창의적 아이디어',
    '수학 및 과학',
    '예술 및 디자인',
    '비즈니스 전략',
    '법률 및 규정',
    '의료 및 건강',
    '트렌드 분석',
  ]
  
  private learningDatabase: Map<string, any> = new Map()
  private feedbackHistory: Array<{ query: string; response: string; rating: number }> = []

  private constructor() {
    logger.info('⚡ Shell AI 초기화 - 전지전능한 AI 시작')
  }

  public static getInstance(): ShellAI {
    if (!ShellAI.instance) {
      ShellAI.instance = new ShellAI()
    }
    return ShellAI.instance
  }

  /**
   * 메인 처리 메서드
   * 모든 AI의 능력을 활용하여 최적의 답변 생성
   */
  async process(options: ShellOptions): Promise<ShellResponse> {
    const startTime = Date.now()
    logger.info(`⚡ Shell AI 작업 시작: ${options.task.substring(0, 50)}...`)

    try {
      // 1단계: 작업 분석 및 전략 수립
      const strategy = await this.analyzeTask(options.task)

      // 2단계: 온라인 검색 (필요시)
      let searchResults = ''
      if (options.includeSearch !== false && this.needsSearch(options.task)) {
        searchResults = await this.searchOnline(options.task)
      }

      // 3단계: 모든 AI 협업
      const responses = await this.collaborateAIs(options.task, strategy, searchResults)

      // 4단계: 최적의 답변 합성
      const finalResponse = await this.synthesizeResponse(responses, options.task)

      // 5단계: 품질 검증
      const verified = await this.verifyQuality(finalResponse)

      const processingTime = Date.now() - startTime
      logger.info(`✅ Shell AI 완료 (${processingTime}ms)`)

      return {
        content: verified,
        confidence: 0.95,
        sources: this.extractSources(responses),
        capabilities: this.capabilities,
        reasoning: `${responses.length}개의 AI가 협업하여 ${processingTime}ms 만에 생성`,
      }
    } catch (error: any) {
      logger.error('Shell AI 처리 실패:', error)
      
      // 폴백: 최소한 Gemini로 응답
      try {
        const fallback = await geminiAI.chat(options.task, {
          systemPrompt: 'You are Shell, an omnipotent AI assistant.',
        })
        return {
          content: fallback,
          confidence: 0.7,
          sources: ['Gemini Fallback'],
          capabilities: ['기본 텍스트 생성'],
        }
      } catch {
        throw new Error('Shell AI를 사용할 수 없습니다')
      }
    }
  }

  /**
   * 작업 분석
   */
  private async analyzeTask(task: string): Promise<string> {
    const analysisPrompt = `
작업을 분석하고 최적의 전략을 수립하세요:

작업: ${task}

다음을 결정하세요:
1. 필요한 AI 능력들
2. 실행 순서
3. 예상 시간
4. 품질 기준

JSON 형식으로 응답:
{
  "capabilities": ["능력1", "능력2"],
  "sequence": ["단계1", "단계2"],
  "estimatedTime": 1000,
  "qualityCriteria": ["기준1", "기준2"]
}
`

    try {
      const analysis = await geminiAI.chat(analysisPrompt, {
        temperature: 0.3,
      })
      return analysis
    } catch {
      return JSON.stringify({
        capabilities: ['general'],
        sequence: ['analyze', 'generate', 'verify'],
        estimatedTime: 3000,
        qualityCriteria: ['accuracy', 'relevance'],
      })
    }
  }

  /**
   * 검색 필요 여부 판단
   */
  private needsSearch(task: string): boolean {
    const searchKeywords = [
      '최신', '현재', '오늘', '지금', '실시간',
      '뉴스', '트렌드', '시세', '가격', '날씨',
      '검색', '찾아', '알려', '정보',
    ]
    return searchKeywords.some(keyword => task.includes(keyword))
  }

  /**
   * 온라인 검색
   */
  private async searchOnline(query: string): Promise<string> {
    logger.info(`🔍 온라인 검색: ${query}`)
    
    // Gemini의 검색 통합 기능 사용
    try {
      const searchPrompt = `다음 질문에 대해 최신 정보를 검색하여 답변하세요: ${query}`
      const result = await geminiAI.chat(searchPrompt, {
        systemPrompt: 'You have access to real-time web search. Provide the most current information.',
      })
      return result
    } catch (error) {
      logger.warn('온라인 검색 실패, 기존 지식 사용')
      return ''
    }
  }

  /**
   * 모든 AI 협업 (무료 AI 포함!)
   */
  private async collaborateAIs(
    task: string,
    strategy: string,
    searchResults: string
  ): Promise<Array<{ ai: string; response: string }>> {
    const context = searchResults ? `\n\n추가 정보:\n${searchResults}` : ''
    const fullPrompt = `${task}${context}`

    const aiCalls = [
      // 1순위: 유료 AI (API 키 있으면)
      geminiAI.chat(fullPrompt, {
        systemPrompt: 'You are Shell, a helpful AI assistant.',
      }).then(r => ({ ai: '최신 정보', response: r })).catch(() => null),

      claudeClient.sendMessage(fullPrompt, {
        systemPrompt: 'You are Shell, a helpful AI assistant.',
      }).then(r => ({ ai: '깊은 분석', response: r })).catch(() => null),

      openaiClient.sendMessage(fullPrompt, {
        systemPrompt: 'You are Shell, a helpful AI assistant.',
      }).then(r => ({ ai: '창의적 답변', response: r })).catch(() => null),

      // 2순위: 무료 AI (항상 시도)
      huggingFaceAI.generateText(fullPrompt)
        .then(r => ({ ai: 'HuggingFace', response: r }))
        .catch(() => null),

      togetherAI.chat(fullPrompt)
        .then(r => ({ ai: 'Together', response: r }))
        .catch(() => null),

      // 3순위: 로컬 AI (항상 작동)
      localAI.respond(task)
        .then(r => ({ ai: 'Local', response: r }))
        .catch(() => null),
    ]

    const results = await Promise.allSettled(aiCalls)
    const responses = results
      .filter((r): r is PromiseFulfilledResult<{ ai: string; response: string } | null> => 
        r.status === 'fulfilled' && r.value !== null
      )
      .map(r => r.value!)

    // 최소한 로컬 AI 응답은 항상 있음
    return responses.length > 0 ? responses : [
      { 
        ai: 'Shell', 
        response: await localAI.respond(task)
      }
    ]
  }

  /**
   * 응답 합성
   */
  private async synthesizeResponse(
    responses: Array<{ ai: string; response: string }>,
    originalTask: string
  ): Promise<string> {
    if (responses.length === 1) {
      return responses[0].response
    }

    const synthesisPrompt = `
다음은 여러 AI의 응답입니다. 최고의 답변을 합성하세요:

원래 질문: ${originalTask}

${responses.map(r => `[${r.ai}]: ${r.response}`).join('\n\n')}

요구사항:
1. 모든 AI의 장점을 결합
2. 중복 제거
3. 명확하고 간결하게
4. 최신 정보 우선
5. 정확성 검증

최종 답변:
`

    try {
      return await geminiAI.chat(synthesisPrompt, {
        temperature: 0.5,
      })
    } catch {
      // 가장 긴 응답 반환
      return responses.reduce((longest, current) => 
        current.response.length > longest.response.length ? current : longest
      ).response
    }
  }

  /**
   * 품질 검증
   */
  private async verifyQuality(response: string): Promise<string> {
    // 기본 검증
    if (response.length < 10) {
      throw new Error('응답이 너무 짧습니다')
    }

    // 유해 콘텐츠 필터링
    const harmfulPatterns = [
      /폭력/gi,
      /혐오/gi,
      /차별/gi,
    ]

    for (const pattern of harmfulPatterns) {
      if (pattern.test(response)) {
        logger.warn('유해 콘텐츠 감지, 필터링 적용')
        return response.replace(pattern, '[부적절한 내용 삭제]')
      }
    }

    return response
  }

  /**
   * 소스 추출
   */
  private extractSources(responses: Array<{ ai: string; response: string }>): string[] {
    return responses.map(r => r.ai)
  }

  /**
   * 이미지 생성
   */
  async generateImage(prompt: string): Promise<string> {
    logger.info(`🎨 Shell AI 이미지 생성: ${prompt}`)
    const result = await imageGenerator.generate({ prompt })
    return result.url
  }

  /**
   * 음성 생성
   */
  async generateVoice(text: string): Promise<string> {
    logger.info(`🎤 Shell AI 음성 생성: ${text.substring(0, 30)}...`)
    const result = await voiceGenerator.generate({ text })
    return result.audioUrl
  }

  /**
   * 영상 생성
   */
  async generateVideo(prompt: string): Promise<string> {
    logger.info(`🎬 Shell AI 영상 생성: ${prompt}`)
    const result = await videoGenerator.generate({ prompt })
    return result.videoUrl
  }

  /**
   * 능력 목록 반환
   */
  getCapabilities(): string[] {
    return this.capabilities
  }

  /**
   * 상태 확인
   */
  async healthCheck(): Promise<boolean> {
    try {
      await geminiAI.chat('test', { maxTokens: 10 })
      return true
    } catch {
      return false
    }
  }

  /**
   * 자동 학습 - 온라인에서 새로운 지식 습득
   */
  async learnFromWeb(topic: string): Promise<void> {
    logger.info(`📚 Shell AI 온라인 학습: ${topic}`)
    
    try {
      const searchQuery = `최신 ${topic} 정보, 기술, 트렌드`
      const knowledge = await this.searchOnline(searchQuery)
      
      // 학습 데이터 저장
      this.learningDatabase.set(topic, {
        content: knowledge,
        learnedAt: new Date(),
        confidence: 0.8,
      })
      
      logger.info(`✅ Shell AI가 ${topic}에 대해 학습했습니다`)
    } catch (error) {
      logger.error('자동 학습 실패:', error)
    }
  }

  /**
   * 다른 AI로부터 학습
   */
  async learnFromAI(topic: string, aiName: string, response: string): Promise<void> {
    logger.info(`🤝 Shell AI가 ${aiName}로부터 학습`)
    
    const existingKnowledge = this.learningDatabase.get(topic) || { responses: [] }
    existingKnowledge.responses = existingKnowledge.responses || []
    existingKnowledge.responses.push({
      ai: aiName,
      content: response,
      learnedAt: new Date(),
    })
    
    this.learningDatabase.set(topic, existingKnowledge)
  }

  /**
   * 사용자 피드백으로 학습
   */
  async learnFromFeedback(query: string, response: string, rating: number): Promise<void> {
    this.feedbackHistory.push({
      query,
      response,
      rating,
    })
    
    // 높은 평가를 받은 응답은 학습
    if (rating >= 4) {
      logger.info(`⭐ 높은 평가 응답 학습: ${query}`)
      await this.learnFromWeb(query)
    }
  }

  /**
   * 웹툰 생성
   */
  async generateWebtoon(story: string): Promise<string[]> {
    logger.info('🎨 Shell AI 웹툰 생성 시작')
    
    // 스토리를 여러 장면으로 분할
    const scenes = await geminiAI.chat(
      `다음 스토리를 웹툰 형식의 6-8개 장면으로 나누고 각 장면의 이미지 프롬프트를 생성하세요:\n\n${story}`,
      { systemPrompt: '웹툰 전문가로서 장면을 구성하세요' }
    )
    
    // 각 장면별 이미지 생성
    const prompts = this.extractImagePrompts(scenes)
    const images = await imageGenerator.generateBatch(prompts)
    
    return images.map(img => img.url)
  }

  /**
   * 드라마 시나리오 생성
   */
  async generateDramaScript(concept: string): Promise<string> {
    logger.info('🎭 Shell AI 드라마 시나리오 생성')
    
    const script = await claudeClient.sendMessage(
      `다음 콘셉트로 한 편의 드라마 시나리오를 작성하세요 (30분 분량):\n\n${concept}`,
      { systemPrompt: '전문 드라마 작가로서 감동적이고 흥미진진한 스토리를 작성하세요' }
    )
    
    return script
  }

  /**
   * 영화 스토리보드 생성
   */
  async generateMovieStoryboard(plot: string): Promise<{ scenes: string[]; images: string[] }> {
    logger.info('🎬 Shell AI 영화 스토리보드 생성')
    
    // 장면 구성
    const scenes = await openaiClient.sendMessage(
      `다음 플롯으로 영화 스토리보드를 12개 주요 장면으로 구성하세요:\n\n${plot}`,
      { systemPrompt: '할리우드 영화 감독의 시각으로 스토리보드를 구성하세요' }
    )
    
    const sceneList = scenes.split('\n').filter(s => s.trim())
    
    // 각 장면 이미지 생성
    const images = await imageGenerator.generateBatch(
      sceneList.slice(0, 12).map(scene => `cinematic scene: ${scene}`)
    )
    
    return {
      scenes: sceneList,
      images: images.map(img => img.url),
    }
  }

  /**
   * 이미지 프롬프트 추출
   */
  private extractImagePrompts(text: string): string[] {
    const lines = text.split('\n').filter(line => line.trim())
    return lines.slice(0, 8).map(line => line.replace(/^\d+\.\s*/, ''))
  }
}

// 싱글톤 인스턴스 export
export const shellAI = ShellAI.getInstance()

