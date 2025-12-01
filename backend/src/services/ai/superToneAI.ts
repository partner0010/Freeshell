import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import { logger } from '../../utils/logger'

/**
 * SUPERTONE AI 통합
 * 고품질 나레이션/음성 생성
 */
export class SuperToneAI {
  private apiKey?: string
  private baseUrl: string

  constructor() {
    // SUPERTONE AI API 설정
    this.apiKey = process.env.SUPERTONE_API_KEY
    this.baseUrl = process.env.SUPERTONE_API_URL || 'https://api.supertone.ai/v1'
  }

  /**
   * 텍스트를 나레이션으로 변환
   */
  async generateNarration(
    text: string,
    options: {
      voiceId?: string // 음성 ID (기본값: 한국어 여성 목소리)
      language?: string // 언어 (기본값: 'ko')
      speed?: number // 속도 (0.5 ~ 2.0, 기본값: 1.0)
      pitch?: number // 음높이 (-12 ~ 12, 기본값: 0)
      emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' // 감정
      style?: 'narrative' | 'conversational' | 'dramatic' // 스타일
    } = {}
  ): Promise<string> {
    logger.info('SUPERTONE AI 나레이션 생성 시작:', { textLength: text.length, options })

    try {
      // SUPERTONE AI API 호출
      if (!this.apiKey) {
        logger.warn('SUPERTONE API 키가 없습니다. 대체 서비스 사용')
        return await this.generateWithFallback(text, options)
      }

      const response = await axios.post(
        `${this.baseUrl}/tts/generate`,
        {
          text: text,
          voice_id: options.voiceId || this.getDefaultVoiceId(options.language || 'ko'),
          language: options.language || 'ko',
          speed: options.speed || 1.0,
          pitch: options.pitch || 0,
          emotion: options.emotion || 'neutral',
          style: options.style || 'narrative'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60초 타임아웃
        }
      )

      // 비동기 작업인 경우
      if (response.data.taskId) {
        return await this.pollAudioGeneration(response.data.taskId)
      }

      // 즉시 완료된 경우
      const audioUrl = response.data.audioUrl || response.data.audio
      if (audioUrl) {
        return await this.downloadAndSaveAudio(audioUrl, text)
      }

      // Base64 데이터인 경우
      if (response.data.audioBase64) {
        return await this.saveBase64Audio(response.data.audioBase64, text)
      }

      throw new Error('나레이션 생성 실패: 응답에 오디오가 없습니다')

    } catch (error: any) {
      logger.error('SUPERTONE AI 나레이션 생성 실패:', error)
      // 대체 서비스 사용
      return await this.generateWithFallback(text, options)
    }
  }

  /**
   * 긴 텍스트를 여러 오디오로 분할하여 생성
   */
  async generateLongNarration(
    text: string,
    options: {
      voiceId?: string
      language?: string
      speed?: number
      pitch?: number
      emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm'
      style?: 'narrative' | 'conversational' | 'dramatic'
      maxLength?: number // 최대 텍스트 길이 (기본값: 5000자)
    } = {}
  ): Promise<string[]> {
    logger.info('SUPERTONE AI 긴 나레이션 생성 시작:', { textLength: text.length })

    const maxLength = options.maxLength || 5000
    const audioFiles: string[] = []

    // 텍스트를 문장 단위로 분할
    const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 0)
    let currentChunk = ''

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength) {
        // 현재 청크가 가득 찼으면 나레이션 생성
        if (currentChunk.trim()) {
          const audioPath = await this.generateNarration(currentChunk.trim(), options)
          audioFiles.push(audioPath)
        }
        currentChunk = sentence
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence
      }
    }

    // 마지막 청크 처리
    if (currentChunk.trim()) {
      const audioPath = await this.generateNarration(currentChunk.trim(), options)
      audioFiles.push(audioPath)
    }

    logger.info('SUPERTONE AI 긴 나레이션 생성 완료:', { fileCount: audioFiles.length })
    return audioFiles
  }

  /**
   * 비동기 작업 폴링
   */
  private async pollAudioGeneration(taskId: string, maxAttempts: number = 30): Promise<string> {
    logger.info('나레이션 생성 작업 폴링 시작:', taskId)

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(
          `${this.baseUrl}/tasks/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            }
          }
        )

        const status = response.data.status

        if (status === 'completed') {
          const audioUrl = response.data.audioUrl
          return await this.downloadAndSaveAudio(audioUrl, 'generated')
        }

        if (status === 'failed') {
          throw new Error('나레이션 생성 실패')
        }

        // 진행 중이면 대기
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2초 대기

      } catch (error: any) {
        if (i === maxAttempts - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    throw new Error('나레이션 생성 타임아웃')
  }

  /**
   * 기본 음성 ID 가져오기
   */
  private getDefaultVoiceId(language: string): string {
    const voiceMap: Record<string, string> = {
      'ko': 'korean_female_01', // 한국어 여성 목소리
      'en': 'english_female_01', // 영어 여성 목소리
      'ja': 'japanese_female_01', // 일본어 여성 목소리
      'zh': 'chinese_female_01' // 중국어 여성 목소리
    }

    return voiceMap[language] || voiceMap['ko']
  }

  /**
   * 대체 음성 생성 서비스 사용 (OpenAI TTS)
   */
  private async generateWithFallback(
    text: string,
    options: any
  ): Promise<string> {
    logger.info('대체 음성 생성 서비스 사용 (OpenAI TTS)')

    const { generateSpeech } = require('../audioGenerator')
    
    // SUPERTONE 옵션을 OpenAI TTS 옵션으로 변환
    const openaiOptions = {
      voice: this.mapVoiceToOpenAI(options.voiceId, options.language),
      speed: options.speed || 1.0,
      language: options.language || 'ko'
    }

    return await generateSpeech(text, openaiOptions)
  }

  /**
   * SUPERTONE 음성을 OpenAI TTS 음성으로 매핑
   */
  private mapVoiceToOpenAI(voiceId: string | undefined, language: string | undefined): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
    const languageMap: Record<string, 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = {
      'ko': 'nova', // 한국어: 자연스러운 여성 목소리
      'en': 'alloy', // 영어: 중성적 목소리
      'ja': 'shimmer', // 일본어: 부드러운 목소리
      'zh': 'echo' // 중국어: 명확한 목소리
    }

    return languageMap[language || 'ko'] || 'nova'
  }

  /**
   * 오디오 다운로드 및 저장
   */
  private async downloadAndSaveAudio(audioUrl: string, text: string): Promise<string> {
    const response = await axios.get(audioUrl, {
      responseType: 'arraybuffer',
      timeout: 60000
    })

    const audioDir = './uploads/audio'
    await fs.mkdir(audioDir, { recursive: true })

    const filename = `supertone_${Date.now()}_${text.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.mp3`
    const filepath = path.join(audioDir, filename)

    await fs.writeFile(filepath, Buffer.from(response.data))

    logger.info('오디오 저장 완료:', filepath)
    return filepath
  }

  /**
   * Base64 오디오 저장
   */
  private async saveBase64Audio(audioBase64: string, text: string): Promise<string> {
    const audioDir = './uploads/audio'
    await fs.mkdir(audioDir, { recursive: true })

    const filename = `supertone_${Date.now()}_${text.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.mp3`
    const filepath = path.join(audioDir, filename)

    const audioBuffer = Buffer.from(audioBase64, 'base64')
    await fs.writeFile(filepath, audioBuffer)

    logger.info('오디오 저장 완료:', filepath)
    return filepath
  }

  /**
   * 사용 가능한 음성 목록 조회
   */
  async getAvailableVoices(language?: string): Promise<any[]> {
    try {
      if (!this.apiKey) {
        return []
      }

      const response = await axios.get(
        `${this.baseUrl}/voices`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          params: language ? { language } : {}
        }
      )

      return response.data.voices || []
    } catch (error) {
      logger.warn('음성 목록 조회 실패:', error)
      return []
    }
  }

  /**
   * 콘텐츠에 맞는 나레이션 생성 (자동 스타일 선택)
   */
  async generateContentNarration(
    script: string,
    contentType: string,
    language: string = 'ko'
  ): Promise<string> {
    logger.info('콘텐츠 나레이션 생성:', { contentType, language })

    // 콘텐츠 유형에 따른 스타일 자동 선택
    const styleMap: Record<string, 'narrative' | 'conversational' | 'dramatic'> = {
      'today-issue': 'narrative',
      'movie': 'dramatic',
      'drama': 'dramatic',
      'entertainment': 'conversational',
      'daily-talk': 'conversational',
      'education': 'narrative',
      'tutorial': 'narrative'
    }

    const style = styleMap[contentType] || 'narrative'

    // 감정 자동 선택
    const emotionMap: Record<string, 'neutral' | 'happy' | 'sad' | 'excited' | 'calm'> = {
      'funny': 'happy',
      'joy': 'happy',
      'sadness': 'sad',
      'anger': 'excited',
      'calm': 'calm'
    }

    const emotion = emotionMap[contentType] || 'neutral'

    // 텍스트가 길면 분할 생성
    if (script.length > 5000) {
      const audioFiles = await this.generateLongNarration(script, {
        language,
        style,
        emotion
      })
      // 여러 파일을 하나로 합치는 것은 videoGenerator에서 처리
      return audioFiles[0] // 첫 번째 파일 반환 (나중에 합성)
    } else {
      return await this.generateNarration(script, {
        language,
        style,
        emotion
      })
    }
  }
}

export const superToneAI = new SuperToneAI()

