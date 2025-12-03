/**
 * 통합 영상 생성 AI 서비스
 * Runway Gen-3, Pika Labs, D-ID, HeyGen
 */

import { logger } from '../../utils/logger'
import * as fs from 'fs/promises'
import * as path from 'path'

interface VideoGenerationOptions {
  prompt: string
  duration?: number
  fps?: number
  resolution?: '720p' | '1080p' | '4k'
  style?: 'realistic' | 'animated' | 'cinematic'
}

interface VideoGenerationResult {
  videoUrl: string
  videoPath: string
  thumbnailUrl?: string
  duration: number
  service: string
}

interface AvatarVideoOptions {
  script: string
  avatarId?: string
  voice?: string
  language?: string
}

export class VideoGenerator {
  private runwayApiKey: string | null = null
  private replicateApiKey: string | null = null
  private didApiKey: string | null = null

  constructor() {
    this.runwayApiKey = process.env.RUNWAY_API_KEY || null
    this.replicateApiKey = process.env.REPLICATE_API_TOKEN || null
    this.didApiKey = process.env.DID_API_KEY || null

    if (this.runwayApiKey) {
      logger.info('✅ Runway ML 초기화 완료')
    }
    if (this.replicateApiKey) {
      logger.info('✅ Replicate (Pika Labs) 초기화 완료')
    }
    if (this.didApiKey) {
      logger.info('✅ D-ID 초기화 완료')
    }

    if (!this.runwayApiKey && !this.replicateApiKey && !this.didApiKey) {
      logger.warn('영상 생성 API 키가 설정되지 않았습니다')
    }
  }

  /**
   * Runway Gen-3로 영상 생성
   */
  async generateWithRunway(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    if (!this.runwayApiKey) {
      throw new Error('RUNWAY_API_KEY가 설정되지 않았습니다')
    }

    try {
      logger.info(`🎬 Runway Gen-3 영상 생성 시작: ${options.prompt.substring(0, 50)}...`)

      // Runway API 호출
      const response = await fetch('https://api.runwayml.com/v1/gen3/text-to-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.runwayApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: options.prompt,
          duration: options.duration || 5,
          resolution: options.resolution || '720p',
          style: options.style || 'realistic',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Runway API 오류: ${data.message || response.statusText}`)
      }

      // 작업 ID로 폴링
      const taskId = data.id
      let videoUrl = null

      for (let i = 0; i < 120; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // 5초 대기

        const statusResponse = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.runwayApiKey}`,
          },
        })

        const status = await statusResponse.json()

        if (status.status === 'succeeded') {
          videoUrl = status.output?.video_url
          break
        } else if (status.status === 'failed') {
          throw new Error('Runway 영상 생성 실패')
        }
      }

      if (!videoUrl) {
        throw new Error('영상 생성 시간 초과 (최대 10분)')
      }

      // 비디오 다운로드 및 저장
      const videoResponse = await fetch(videoUrl)
      const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())
      const fileName = `video-${Date.now()}.mp4`
      const videoPath = path.join(process.cwd(), 'uploads', fileName)

      await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true })
      await fs.writeFile(videoPath, videoBuffer)

      logger.info(`✅ Runway Gen-3 영상 생성 완료: ${videoPath}`)

      return {
        videoUrl: `/uploads/${fileName}`,
        videoPath,
        duration: options.duration || 5,
        service: 'Runway Gen-3',
      }
    } catch (error: any) {
      logger.error('Runway 영상 생성 실패:', error)
      throw new Error(`Runway 오류: ${error.message}`)
    }
  }

  /**
   * Replicate (AnimateDiff, Zeroscope)로 영상 생성
   */
  async generateWithReplicate(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    if (!this.replicateApiKey) {
      throw new Error('REPLICATE_API_TOKEN이 설정되지 않았습니다')
    }

    try {
      logger.info(`🎬 Replicate 영상 생성 시작: ${options.prompt.substring(0, 50)}...`)

      // AnimateDiff 모델 사용
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
          input: {
            prompt: options.prompt,
            num_frames: (options.duration || 2) * 8, // 8 fps 기준
            num_inference_steps: 25,
            guidance_scale: 7.5,
          },
        }),
      })

      const prediction = await response.json()

      // 결과 대기 (폴링)
      let output = null
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000))

        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`,
          },
        })

        const status = await statusResponse.json()

        if (status.status === 'succeeded') {
          output = status.output
          break
        } else if (status.status === 'failed') {
          throw new Error('Replicate 영상 생성 실패')
        }
      }

      if (!output) {
        throw new Error('영상 생성 시간 초과')
      }

      // 비디오 다운로드 및 저장
      const videoResponse = await fetch(output)
      const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())
      const fileName = `video-${Date.now()}.mp4`
      const videoPath = path.join(process.cwd(), 'uploads', fileName)

      await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true })
      await fs.writeFile(videoPath, videoBuffer)

      logger.info(`✅ Replicate 영상 생성 완료: ${videoPath}`)

      return {
        videoUrl: `/uploads/${fileName}`,
        videoPath,
        duration: options.duration || 2,
        service: 'AnimateDiff',
      }
    } catch (error: any) {
      logger.error('Replicate 영상 생성 실패:', error)
      throw new Error(`Replicate 오류: ${error.message}`)
    }
  }

  /**
   * D-ID로 아바타 영상 생성
   */
  async generateAvatarVideo(options: AvatarVideoOptions): Promise<VideoGenerationResult> {
    if (!this.didApiKey) {
      throw new Error('DID_API_KEY가 설정되지 않았습니다')
    }

    try {
      logger.info(`🎬 D-ID 아바타 영상 생성 시작: ${options.script.substring(0, 30)}...`)

      // D-ID API 호출
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.didApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: options.script,
            provider: {
              type: 'microsoft',
              voice_id: options.voice || 'ko-KR-SunHiNeural',
            },
          },
          config: {
            fluent: true,
            pad_audio: 0.0,
          },
          source_url: options.avatarId || 'https://create-images-results.d-id.com/default_presenter.jpg',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`D-ID API 오류: ${data.message || response.statusText}`)
      }

      const talkId = data.id

      // 결과 대기
      let resultUrl = null
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000))

        const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          headers: {
            'Authorization': `Basic ${this.didApiKey}`,
          },
        })

        const status = await statusResponse.json()

        if (status.status === 'done') {
          resultUrl = status.result_url
          break
        } else if (status.status === 'error') {
          throw new Error('D-ID 영상 생성 실패')
        }
      }

      if (!resultUrl) {
        throw new Error('아바타 영상 생성 시간 초과')
      }

      // 비디오 다운로드 및 저장
      const videoResponse = await fetch(resultUrl)
      const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())
      const fileName = `avatar-${Date.now()}.mp4`
      const videoPath = path.join(process.cwd(), 'uploads', fileName)

      await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true })
      await fs.writeFile(videoPath, videoBuffer)

      logger.info(`✅ D-ID 아바타 영상 생성 완료: ${videoPath}`)

      return {
        videoUrl: `/uploads/${fileName}`,
        videoPath,
        duration: 0,
        service: 'D-ID Avatar',
      }
    } catch (error: any) {
      logger.error('D-ID 아바타 영상 생성 실패:', error)
      throw new Error(`D-ID 오류: ${error.message}`)
    }
  }

  /**
   * 자동으로 최적의 서비스 선택
   */
  async generate(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    // 1차: Runway 시도 (최고 품질)
    if (this.runwayApiKey) {
      try {
        return await this.generateWithRunway(options)
      } catch (error) {
        logger.warn('Runway 실패, Replicate로 전환')
      }
    }

    // 2차: Replicate 시도
    if (this.replicateApiKey) {
      try {
        return await this.generateWithReplicate(options)
      } catch (error) {
        logger.error('모든 영상 생성 서비스 실패:', error)
        throw new Error('영상을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    throw new Error('사용 가능한 영상 생성 서비스가 없습니다')
  }

  /**
   * 여러 프롬프트로 영상 시퀀스 생성
   */
  async generateSequence(prompts: string[]): Promise<VideoGenerationResult[]> {
    const results: VideoGenerationResult[] = []

    for (const prompt of prompts) {
      const result = await this.generate({ prompt })
      results.push(result)
    }

    return results
  }

  /**
   * 이미지를 영상으로 변환
   */
  async imageToVideo(imageUrl: string, prompt: string): Promise<VideoGenerationResult> {
    if (!this.runwayApiKey && !this.replicateApiKey) {
      throw new Error('영상 생성 API 키가 설정되지 않았습니다')
    }

    // Runway의 이미지→영상 기능 사용
    if (this.runwayApiKey) {
      try {
        logger.info(`🎬 이미지→영상 변환 시작: ${imageUrl}`)

        const response = await fetch('https://api.runwayml.com/v1/gen3/image-to-video', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.runwayApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: imageUrl,
            prompt: prompt,
            duration: 5,
          }),
        })

        const data = await response.json()
        const taskId = data.id

        // 폴링
        let videoUrl = null
        for (let i = 0; i < 60; i++) {
          await new Promise(resolve => setTimeout(resolve, 5000))

          const statusResponse = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${this.runwayApiKey}` },
          })

          const status = await statusResponse.json()

          if (status.status === 'succeeded') {
            videoUrl = status.output?.video_url
            break
          }
        }

        if (!videoUrl) throw new Error('변환 시간 초과')

        const videoResponse = await fetch(videoUrl)
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())
        const fileName = `i2v-${Date.now()}.mp4`
        const videoPath = path.join(process.cwd(), 'uploads', fileName)

        await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true })
        await fs.writeFile(videoPath, videoBuffer)

        return {
          videoUrl: `/uploads/${fileName}`,
          videoPath,
          duration: 5,
          service: 'Runway Image-to-Video',
        }
      } catch (error: any) {
        logger.error('이미지→영상 변환 실패:', error)
        throw new Error(`변환 오류: ${error.message}`)
      }
    }

    throw new Error('이미지→영상 변환 서비스가 없습니다')
  }
}

export const videoGenerator = new VideoGenerator()

