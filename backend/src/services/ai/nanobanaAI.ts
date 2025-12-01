import axios from 'axios'
import { logger } from '../../utils/logger'
import fs from 'fs/promises'
import path from 'path'

/**
 * NanoBana AI (또는 유사한 이미지 생성 AI) 통합
 * 구글의 나노바나나 AI를 이용한 캐릭터/이미지 생성
 */
export class NanoBanaAI {
  private apiKey?: string
  private baseUrl: string

  constructor() {
    // NanoBana AI API 설정
    // 실제 API가 없을 경우 대체 서비스 사용
    this.apiKey = process.env.NANOBANA_API_KEY || process.env.GOOGLE_AI_API_KEY
    this.baseUrl = process.env.NANOBANA_API_URL || 'https://api.nanobana.ai/v1'
  }

  /**
   * 캐릭터 이미지 생성
   */
  async generateCharacter(
    prompt: string,
    style: 'anime' | 'realistic' | 'cartoon' | '3d' = 'anime',
    options: {
      width?: number
      height?: number
      seed?: number
    } = {}
  ): Promise<string> {
    logger.info('NanoBana AI 캐릭터 생성 시작:', prompt)

    try {
      // NanoBana AI API 호출
      // 실제 API가 없을 경우 DALL-E 또는 다른 이미지 생성 AI 사용
      if (!this.apiKey) {
        logger.warn('NanoBana API 키가 없습니다. 대체 서비스 사용')
        return await this.generateWithFallback(prompt, style, options)
      }

      const response = await axios.post(
        `${this.baseUrl}/generate/character`,
        {
          prompt: this.enhancePrompt(prompt, style),
          style,
          width: options.width || 1024,
          height: options.height || 1024,
          seed: options.seed
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60초 타임아웃
        }
      )

      // 이미지 URL 또는 base64 데이터
      const imageUrl = response.data.imageUrl || response.data.image
      
      if (imageUrl) {
        // 이미지 다운로드 및 저장
        return await this.downloadAndSaveImage(imageUrl, prompt)
      }

      throw new Error('이미지 생성 실패: 응답에 이미지가 없습니다')

    } catch (error: any) {
      logger.error('NanoBana AI 캐릭터 생성 실패:', error)
      // 대체 서비스 사용
      return await this.generateWithFallback(prompt, style, options)
    }
  }

  /**
   * 대체 이미지 생성 서비스 사용 (DALL-E 등)
   */
  private async generateWithFallback(
    prompt: string,
    style: string,
    options: any
  ): Promise<string> {
    logger.info('대체 이미지 생성 서비스 사용')

    // OpenAI DALL-E 사용
    const OpenAI = require('openai')
    const openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null

    if (!openai) {
      throw new Error('이미지 생성 API를 사용할 수 없습니다')
    }

    const enhancedPrompt = this.enhancePrompt(prompt, style as any)

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      size: '1024x1024',
      quality: 'hd',
      n: 1
    })

    const imageUrl = response.data[0].url
    return await this.downloadAndSaveImage(imageUrl, prompt)
  }

  /**
   * 프롬프트 향상 (스타일 적용)
   */
  private enhancePrompt(prompt: string, style: string): string {
    const stylePrompts = {
      anime: 'anime style, high quality, detailed, vibrant colors',
      realistic: 'photorealistic, high quality, detailed, professional photography',
      cartoon: 'cartoon style, colorful, fun, animated',
      '3d': '3D rendered, high quality, detailed, modern 3D graphics'
    }

    const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || ''
    return `${prompt}, ${stylePrompt}, masterpiece, best quality`
  }

  /**
   * 이미지 다운로드 및 저장
   */
  private async downloadAndSaveImage(imageUrl: string, prompt: string): Promise<string> {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    })

    const imageDir = './uploads/images'
    await fs.mkdir(imageDir, { recursive: true })

    const filename = `nanobana_${Date.now()}_${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.png`
    const filepath = path.join(imageDir, filename)

    await fs.writeFile(filepath, Buffer.from(response.data))

    logger.info('이미지 저장 완료:', filepath)
    return filepath
  }

  /**
   * 여러 캐릭터 일괄 생성
   */
  async generateMultipleCharacters(
    prompts: string[],
    style: 'anime' | 'realistic' | 'cartoon' | '3d' = 'anime'
  ): Promise<string[]> {
    logger.info(`여러 캐릭터 생성 시작: ${prompts.length}개`)

    const images = await Promise.all(
      prompts.map(prompt => this.generateCharacter(prompt, style))
    )

    return images
  }
}

export const nanobanaAI = new NanoBanaAI()

