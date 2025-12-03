/**
 * Google Gemini AI 통합
 * Gemini 3 및 최신 모델 지원
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '../../utils/logger'

export class GeminiAI {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey)
        // Gemini 3 최신 모델 사용
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp' // 또는 'gemini-pro', 'gemini-1.5-pro'
        })
        logger.info('✅ Gemini AI 초기화 완료')
      } catch (error) {
        logger.warn('Gemini AI 초기화 실패:', error)
      }
    } else {
      logger.warn('GEMINI_API_KEY가 설정되지 않았습니다')
    }
  }

  /**
   * 텍스트 대화
   */
  async chat(
    message: string,
    options: {
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      history?: Array<{ role: 'user' | 'model'; parts: string }>
    } = {}
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI가 초기화되지 않았습니다. GEMINI_API_KEY를 설정하세요.')
    }

    try {
      const chat = this.model.startChat({
        history: options.history?.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.parts }]
        })) || [],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2048,
        },
        systemInstruction: options.systemPrompt || 'You are a helpful AI assistant.'
      })

      const result = await chat.sendMessage(message)
      const response = await result.response
      return response.text()
    } catch (error: any) {
      logger.error('Gemini AI 대화 실패:', error)
      throw new Error(`Gemini AI 오류: ${error.message}`)
    }
  }

  /**
   * 멀티모달 입력 (텍스트 + 이미지)
   */
  async chatWithImage(
    message: string,
    imagePath: string,
    options: {
      systemPrompt?: string
      temperature?: number
    } = {}
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI가 초기화되지 않았습니다.')
    }

    try {
      const fs = await import('fs/promises')
      const imageData = await fs.readFile(imagePath)
      const imageBase64 = imageData.toString('base64')

      const result = await this.model.generateContent([
        {
          text: message
        },
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ])

      const response = await result.response
      return response.text()
    } catch (error: any) {
      logger.error('Gemini AI 이미지 대화 실패:', error)
      throw new Error(`Gemini AI 오류: ${error.message}`)
    }
  }

  /**
   * 코드 생성
   */
  async generateCode(
    description: string,
    language: string = 'typescript',
    options: {
      temperature?: number
    } = {}
  ): Promise<string> {
    const systemPrompt = `You are an expert ${language} programmer. Generate clean, well-commented code based on the user's description.`
    
    return await this.chat(
      `Generate ${language} code for: ${description}`,
      {
        systemPrompt,
        temperature: options.temperature || 0.3
      }
    )
  }

  /**
   * 번역
   */
  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> {
    const prompt = sourceLanguage
      ? `Translate the following ${sourceLanguage} text to ${targetLanguage}: ${text}`
      : `Translate the following text to ${targetLanguage}: ${text}`
    
    return await this.chat(prompt, {
      systemPrompt: 'You are a professional translator. Provide accurate translations.',
      temperature: 0.3
    })
  }
}

export const geminiAI = new GeminiAI()

// Gemini 스트리밍 메서드를 인스턴스에 추가
if (geminiAI) {
  (geminiAI as any).chatStream = async function(
    message: string,
    options?: {
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      history?: Array<{ role: string; content: string }>
    },
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다')
    }

    try {
      // Google Generative AI SDK의 스트리밍 지원
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

      // 대화 기록 구성
      const chatHistory = options?.history?.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) || []

      // 채팅 시작
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 2048
        },
        systemInstruction: options?.systemPrompt
      })

      let fullResponse = ''

      // 스트리밍 응답 받기
      const result = await chat.sendMessageStream(message)
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        if (chunkText) {
          fullResponse += chunkText
          onChunk?.(chunkText)
        }
      }

      return fullResponse
    } catch (error: any) {
      logger.error('Gemini 스트리밍 실패', error)
      // 스트리밍 실패 시 일반 응답 사용
      const instance = geminiAI as any
      return await instance.chat(message, {
        systemPrompt: options?.systemPrompt,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
        history: options?.history?.map((h: any) => ({ role: h.role as 'user' | 'model', parts: h.content }))
      })
    }
  }
}

