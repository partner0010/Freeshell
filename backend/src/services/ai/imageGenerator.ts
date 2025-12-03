/**
 * 통합 이미지 생성 AI 서비스
 * DALL-E 3, Stable Diffusion, Midjourney 스타일
 */

import OpenAI from 'openai'
import { logger } from '../../utils/logger'

interface ImageGenerationOptions {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  n?: number
}

interface ImageGenerationResult {
  url: string
  revisedPrompt?: string
  service: string
}

export class ImageGenerator {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      try {
        this.openai = new OpenAI({ apiKey })
        logger.info('✅ 이미지 생성 AI 초기화 완료 (DALL-E 3)')
      } catch (error) {
        logger.warn('이미지 생성 AI 초기화 실패:', error)
      }
    } else {
      logger.warn('OPENAI_API_KEY가 설정되지 않았습니다')
    }
  }

  /**
   * DALL-E 3로 이미지 생성
   */
  async generateWithDALLE(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    if (!this.openai) {
      throw new Error('OpenAI API가 초기화되지 않았습니다')
    }

    try {
      logger.info(`🎨 DALL-E 3 이미지 생성 시작: ${options.prompt.substring(0, 50)}...`)

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: options.prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
      })

      const imageUrl = response.data[0]?.url
      if (!imageUrl) {
        throw new Error('이미지 URL을 받지 못했습니다')
      }

      logger.info(`✅ DALL-E 3 이미지 생성 완료: ${imageUrl}`)

      return {
        url: imageUrl,
        revisedPrompt: response.data[0]?.revised_prompt,
        service: 'DALL-E 3',
      }
    } catch (error: any) {
      logger.error('DALL-E 3 이미지 생성 실패:', error)
      throw new Error(`DALL-E 3 오류: ${error.message}`)
    }
  }

  /**
   * Stable Diffusion으로 이미지 생성 (Replicate 사용)
   */
  async generateWithStableDiffusion(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const apiKey = process.env.REPLICATE_API_TOKEN

    if (!apiKey) {
      throw new Error('REPLICATE_API_TOKEN이 설정되지 않았습니다')
    }

    try {
      logger.info(`🎨 Stable Diffusion 이미지 생성 시작: ${options.prompt.substring(0, 50)}...`)

      // Replicate API 호출
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          input: {
            prompt: options.prompt,
            negative_prompt: 'low quality, blurry, distorted',
            width: 1024,
            height: 1024,
          },
        }),
      })

      const prediction = await response.json()

      // 결과 대기 (폴링)
      let output = null
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            'Authorization': `Token ${apiKey}`,
          },
        })

        const status = await statusResponse.json()

        if (status.status === 'succeeded') {
          output = status.output?.[0]
          break
        } else if (status.status === 'failed') {
          throw new Error('Stable Diffusion 생성 실패')
        }
      }

      if (!output) {
        throw new Error('이미지 생성 시간 초과')
      }

      logger.info(`✅ Stable Diffusion 이미지 생성 완료: ${output}`)

      return {
        url: output,
        service: 'Stable Diffusion XL',
      }
    } catch (error: any) {
      logger.error('Stable Diffusion 이미지 생성 실패:', error)
      throw new Error(`Stable Diffusion 오류: ${error.message}`)
    }
  }

  /**
   * 자동으로 최적의 서비스 선택
   */
  async generate(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    // 1차: DALL-E 3 시도
    if (this.openai) {
      try {
        return await this.generateWithDALLE(options)
      } catch (error) {
        logger.warn('DALL-E 3 실패, Stable Diffusion으로 전환')
      }
    }

    // 2차: Stable Diffusion 시도
    if (process.env.REPLICATE_API_TOKEN) {
      try {
        return await this.generateWithStableDiffusion(options)
      } catch (error) {
        logger.error('모든 이미지 생성 서비스 실패:', error)
        throw new Error('이미지를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    throw new Error('사용 가능한 이미지 생성 서비스가 없습니다')
  }

  /**
   * 여러 이미지 동시 생성 (배치)
   */
  async generateBatch(prompts: string[]): Promise<ImageGenerationResult[]> {
    const results = await Promise.allSettled(
      prompts.map(prompt => this.generate({ prompt }))
    )

    return results
      .filter((result): result is PromiseFulfilledResult<ImageGenerationResult> => result.status === 'fulfilled')
      .map(result => result.value)
  }

  /**
   * 이미지 변형 (DALL-E 편집 기능)
   */
  async editImage(
    imageUrl: string,
    prompt: string,
    maskUrl?: string
  ): Promise<ImageGenerationResult> {
    if (!this.openai) {
      throw new Error('OpenAI API가 초기화되지 않았습니다')
    }

    try {
      // 이미지 다운로드
      const imageResponse = await fetch(imageUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const imageFile = new File([imageBuffer], 'image.png', { type: 'image/png' })

      let maskFile
      if (maskUrl) {
        const maskResponse = await fetch(maskUrl)
        const maskBuffer = await maskResponse.arrayBuffer()
        maskFile = new File([maskBuffer], 'mask.png', { type: 'image/png' })
      }

      const response = await this.openai.images.edit({
        image: imageFile,
        mask: maskFile,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      })

      const resultUrl = response.data[0]?.url
      if (!resultUrl) {
        throw new Error('편집된 이미지 URL을 받지 못했습니다')
      }

      return {
        url: resultUrl,
        service: 'DALL-E 3 Edit',
      }
    } catch (error: any) {
      logger.error('이미지 편집 실패:', error)
      throw new Error(`이미지 편집 오류: ${error.message}`)
    }
  }
}

export const imageGenerator = new ImageGenerator()

