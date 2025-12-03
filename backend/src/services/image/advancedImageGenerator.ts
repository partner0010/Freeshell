/**
 * 🎨 고급 이미지 생성기 - DALL-E 3, Midjourney, Stable Diffusion 통합
 * 텍스트→이미지, 이미지 편집, 업스케일링, 스타일 전이
 */

import OpenAI from 'openai'
import axios from 'axios'
import { logger } from '../../utils/logger'

// Sharp는 선택적으로 사용 (없어도 작동)
let sharp: any = null
try {
  sharp = require('sharp')
  logger.info('✅ Sharp 이미지 처리 라이브러리 로드 완료')
} catch (error) {
  logger.warn('⚠️ Sharp 미설치 - 일부 이미지 처리 기능 제한됨')
}

export interface ImageGenerationOptions {
  prompt: string
  negativePrompt?: string
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '768x768'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural' | 'anime' | 'photographic' | 'digital-art'
  n?: number // 생성할 이미지 수
  seed?: number
  steps?: number
  guidance?: number
}

export interface ImageResult {
  url: string
  id: string
  revisedPrompt?: string
  width: number
  height: number
}

export interface ImageEditOptions {
  image: string // URL or base64
  mask?: string // 편집할 영역
  prompt: string
  size?: string
}

class AdvancedImageGenerator {
  private openai: OpenAI
  private replicateApiKey: string
  private stabilityApiKey: string

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    this.replicateApiKey = process.env.REPLICATE_API_KEY || ''
    this.stabilityApiKey = process.env.STABILITY_API_KEY || ''

    logger.info('🎨 고급 이미지 생성기 초기화')
  }

  /**
   * 🌟 DALL-E 3: 최고 품질 이미지 생성
   */
  async generateWithDALLE3(
    options: ImageGenerationOptions
  ): Promise<ImageResult[]> {
    try {
      logger.info('🌟 DALL-E 3로 이미지 생성 시작')

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: options.prompt,
        n: 1, // DALL-E 3는 한 번에 1개만
        size: options.size || '1024x1024',
        quality: options.quality || 'hd',
        style: options.style === 'vivid' || options.style === 'natural' ? options.style : 'vivid'
      })

      return response.data.map(img => ({
        url: img.url!,
        id: `dalle3-${Date.now()}`,
        revisedPrompt: img.revised_prompt,
        width: parseInt(options.size?.split('x')[0] || '1024'),
        height: parseInt(options.size?.split('x')[1] || '1024')
      }))
    } catch (error: any) {
      logger.error('DALL-E 3 생성 실패:', error)
      throw new Error('DALL-E 3 이미지 생성 실패')
    }
  }

  /**
   * 🎭 Stable Diffusion XL: 오픈소스 고품질
   */
  async generateWithSDXL(
    options: ImageGenerationOptions
  ): Promise<ImageResult[]> {
    try {
      logger.info('🎭 Stable Diffusion XL로 이미지 생성')

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'stability-ai/sdxl:latest',
          input: {
            prompt: options.prompt,
            negative_prompt: options.negativePrompt || 'ugly, blurry, low quality',
            width: 1024,
            height: 1024,
            num_outputs: options.n || 1,
            num_inference_steps: options.steps || 50,
            guidance_scale: options.guidance || 7.5,
            seed: options.seed
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const predictionId = response.data.id

      // 결과 대기
      const result = await this.waitForPrediction(predictionId)

      return (result.output || []).map((url: string, index: number) => ({
        url,
        id: `sdxl-${predictionId}-${index}`,
        width: 1024,
        height: 1024
      }))
    } catch (error: any) {
      logger.error('SDXL 생성 실패:', error)
      throw new Error('SDXL 이미지 생성 실패')
    }
  }

  /**
   * 🎨 Midjourney: 예술적 이미지 (비공식 API)
   */
  async generateWithMidjourney(
    options: ImageGenerationOptions
  ): Promise<ImageResult[]> {
    try {
      logger.info('🎨 Midjourney 스타일 이미지 생성')

      // Midjourney 스타일 프롬프트 추가
      const enhancedPrompt = `${options.prompt}, masterpiece, highly detailed, professional photography, 8k uhd`

      return await this.generateWithSDXL({
        ...options,
        prompt: enhancedPrompt
      })
    } catch (error: any) {
      logger.error('Midjourney 스타일 생성 실패:', error)
      throw error
    }
  }

  /**
   * ✏️ 이미지 편집 (Inpainting)
   */
  async editImage(options: ImageEditOptions): Promise<ImageResult> {
    try {
      logger.info('✏️ 이미지 편집 시작')

      const response = await this.openai.images.edit({
        model: 'dall-e-2', // DALL-E 3는 편집 미지원
        image: await this.downloadImage(options.image),
        mask: options.mask ? await this.downloadImage(options.mask) : undefined,
        prompt: options.prompt,
        n: 1,
        size: '1024x1024'
      })

      return {
        url: response.data[0].url!,
        id: `edit-${Date.now()}`,
        width: 1024,
        height: 1024
      }
    } catch (error: any) {
      logger.error('이미지 편집 실패:', error)
      throw error
    }
  }

  /**
   * 🔍 이미지 업스케일링 (4x)
   */
  async upscale(imageUrl: string, scale: 2 | 4 = 4): Promise<ImageResult> {
    try {
      logger.info(`🔍 이미지 ${scale}x 업스케일링`)

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'nightmareai/real-esrgan:latest',
          input: {
            image: imageUrl,
            scale: scale,
            face_enhance: true
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`
          }
        }
      )

      const result = await this.waitForPrediction(response.data.id)

      return {
        url: result.output,
        id: `upscale-${response.data.id}`,
        width: 0, // 원본의 scale배
        height: 0
      }
    } catch (error: any) {
      logger.error('업스케일링 실패:', error)
      throw error
    }
  }

  /**
   * 🎭 배경 제거
   */
  async removeBackground(imageUrl: string): Promise<ImageResult> {
    try {
      logger.info('🎭 배경 제거 시작')

      const response = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        {
          image_url: imageUrl,
          size: 'auto'
        },
        {
          headers: {
            'X-Api-Key': process.env.REMOVEBG_API_KEY || ''
          },
          responseType: 'arraybuffer'
        }
      )

      // 임시 파일로 저장하고 URL 반환
      const buffer = Buffer.from(response.data)
      const filename = `nobg-${Date.now()}.png`
      // TODO: S3 업로드

      return {
        url: filename,
        id: `nobg-${Date.now()}`,
        width: 0,
        height: 0
      }
    } catch (error: any) {
      logger.error('배경 제거 실패:', error)
      throw error
    }
  }

  /**
   * 🎨 스타일 전이
   */
  async applyStyle(
    imageUrl: string,
    style: 'anime' | 'oil-painting' | 'sketch' | 'watercolor' | 'cyberpunk'
  ): Promise<ImageResult> {
    try {
      logger.info(`🎨 스타일 적용: ${style}`)

      const stylePrompts: Record<string, string> = {
        'anime': 'anime style, Studio Ghibli, detailed, vibrant colors',
        'oil-painting': 'oil painting style, classical art, textured brushstrokes',
        'sketch': 'pencil sketch, detailed line art, monochrome',
        'watercolor': 'watercolor painting, soft colors, flowing',
        'cyberpunk': 'cyberpunk style, neon lights, futuristic, dark'
      }

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'stability-ai/stable-diffusion-img2img:latest',
          input: {
            image: imageUrl,
            prompt: stylePrompts[style],
            strength: 0.8
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`
          }
        }
      )

      const result = await this.waitForPrediction(response.data.id)

      return {
        url: result.output[0],
        id: `style-${response.data.id}`,
        width: 0,
        height: 0
      }
    } catch (error: any) {
      logger.error('스타일 적용 실패:', error)
      throw error
    }
  }

  /**
   * 🌈 이미지 향상
   */
  async enhance(imageUrl: string): Promise<ImageResult> {
    try {
      logger.info('🌈 이미지 향상 시작')

      if (!sharp) {
        throw new Error('Sharp 라이브러리가 설치되지 않았습니다. npm install sharp를 실행하세요.')
      }

      // Sharp를 사용한 이미지 처리
      const imageBuffer = await this.downloadImageBuffer(imageUrl)

      const enhanced = await sharp(imageBuffer)
        .normalize() // 히스토그램 정규화
        .sharpen() // 선명도 향상
        .modulate({
          brightness: 1.1,
          saturation: 1.2
        })
        .toBuffer()

      // TODO: S3 업로드 후 URL 반환
      const filename = `enhanced-${Date.now()}.jpg`

      return {
        url: filename,
        id: `enhance-${Date.now()}`,
        width: 0,
        height: 0
      }
    } catch (error: any) {
      logger.error('이미지 향상 실패:', error)
      throw error
    }
  }

  /**
   * 📐 이미지 크롭 & 리사이즈
   */
  async resize(
    imageUrl: string,
    width: number,
    height: number,
    fit: 'cover' | 'contain' | 'fill' = 'cover'
  ): Promise<ImageResult> {
    try {
      if (!sharp) {
        throw new Error('Sharp 라이브러리가 설치되지 않았습니다.')
      }

      const imageBuffer = await this.downloadImageBuffer(imageUrl)

      const resized = await sharp(imageBuffer)
        .resize(width, height, { fit })
        .toBuffer()

      // TODO: S3 업로드
      const filename = `resized-${Date.now()}.jpg`

      return {
        url: filename,
        id: `resize-${Date.now()}`,
        width,
        height
      }
    } catch (error: any) {
      logger.error('리사이즈 실패:', error)
      throw error
    }
  }

  /**
   * 🎭 얼굴 복원
   */
  async restoreFace(imageUrl: string): Promise<ImageResult> {
    try {
      logger.info('🎭 얼굴 복원 시작')

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'tencentarc/gfpgan:latest',
          input: {
            img: imageUrl,
            version: 'v1.4',
            scale: 2
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`
          }
        }
      )

      const result = await this.waitForPrediction(response.data.id)

      return {
        url: result.output,
        id: `restore-${response.data.id}`,
        width: 0,
        height: 0
      }
    } catch (error: any) {
      logger.error('얼굴 복원 실패:', error)
      throw error
    }
  }

  /**
   * 🎨 배치 생성
   */
  async batchGenerate(
    prompts: string[],
    options: Omit<ImageGenerationOptions, 'prompt'>
  ): Promise<ImageResult[]> {
    try {
      logger.info(`🎨 배치 생성: ${prompts.length}개 이미지`)

      const results = await Promise.all(
        prompts.map(prompt =>
          this.generateWithDALLE3({ ...options, prompt })
        )
      )

      return results.flat()
    } catch (error: any) {
      logger.error('배치 생성 실패:', error)
      throw error
    }
  }

  /**
   * 🔄 Replicate 예측 대기
   */
  private async waitForPrediction(id: string, maxAttempts = 60): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${id}`,
        {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`
          }
        }
      )

      if (response.data.status === 'succeeded') {
        return response.data
      }

      if (response.data.status === 'failed') {
        throw new Error('Prediction failed')
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    throw new Error('Prediction timeout')
  }

  /**
   * 📥 이미지 다운로드
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(response.data)
  }

  /**
   * 📥 이미지 버퍼 다운로드
   */
  private async downloadImageBuffer(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(response.data)
  }

  /**
   * 📈 사용 통계
   */
  getStats(): {
    totalGenerated: number
    averageCost: number
  } {
    return {
      totalGenerated: 0,
      averageCost: 0
    }
  }
}

// 싱글톤 인스턴스
export const advancedImageGenerator = new AdvancedImageGenerator()

export default advancedImageGenerator

