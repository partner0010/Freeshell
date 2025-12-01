import axios from 'axios'
import { logger } from '../../utils/logger'
import fs from 'fs/promises'
import path from 'path'

/**
 * Kling AI 통합
 * 텍스트나 이미지를 입력하면 고화질의 동영상을 생성
 */
export class KlingAI {
  private apiKey?: string
  private baseUrl: string

  constructor() {
    // Kling AI API 설정
    this.apiKey = process.env.KLING_API_KEY
    this.baseUrl = process.env.KLING_API_URL || 'https://api.klingai.com/v1'
  }

  /**
   * 텍스트로부터 동영상 생성
   */
  async generateVideoFromText(
    prompt: string,
    options: {
      duration?: number // 초 단위 (기본값: 10초, 최대: 60초)
      aspectRatio?: '16:9' | '9:16' | '1:1'
      style?: 'realistic' | 'anime' | 'cinematic'
      fps?: number
    } = {}
  ): Promise<string> {
    logger.info('Kling AI 동영상 생성 시작:', prompt)

    try {
      // Kling AI API 호출
      if (!this.apiKey) {
        logger.warn('Kling API 키가 없습니다. 대체 서비스 사용')
        return await this.generateWithFallback(prompt, options)
      }

      const response = await axios.post(
        `${this.baseUrl}/generate/video`,
        {
          prompt: this.enhancePrompt(prompt, options.style),
          duration: Math.min(options.duration || 10, 60), // 최대 60초
          aspect_ratio: options.aspectRatio || '16:9',
          style: options.style || 'realistic',
          fps: options.fps || 24
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 300000 // 5분 타임아웃 (동영상 생성은 시간이 걸림)
        }
      )

      // 비동기 작업인 경우
      if (response.data.taskId) {
        return await this.pollVideoGeneration(response.data.taskId)
      }

      // 즉시 완료된 경우
      const videoUrl = response.data.videoUrl || response.data.video
      if (videoUrl) {
        return await this.downloadAndSaveVideo(videoUrl, prompt)
      }

      throw new Error('동영상 생성 실패: 응답에 동영상이 없습니다')

    } catch (error: any) {
      logger.error('Kling AI 동영상 생성 실패:', error)
      // 대체 서비스 사용
      return await this.generateWithFallback(prompt, options)
    }
  }

  /**
   * 이미지로부터 동영상 생성 (이미지 애니메이션)
   */
  async generateVideoFromImage(
    imagePath: string,
    prompt: string,
    options: {
      duration?: number
      motion?: 'subtle' | 'moderate' | 'strong'
    } = {}
  ): Promise<string> {
    logger.info('Kling AI 이미지 애니메이션 시작:', imagePath)

    try {
      if (!this.apiKey) {
        logger.warn('Kling API 키가 없습니다. 대체 서비스 사용')
        return await this.animateImageWithFallback(imagePath, prompt, options)
      }

      // 이미지 업로드
      const imageBuffer = await fs.readFile(imagePath)
      const imageBase64 = imageBuffer.toString('base64')

      const response = await axios.post(
        `${this.baseUrl}/generate/animate`,
        {
          image: imageBase64,
          prompt,
          duration: Math.min(options.duration || 5, 30),
          motion: options.motion || 'moderate'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 300000
        }
      )

      if (response.data.taskId) {
        return await this.pollVideoGeneration(response.data.taskId)
      }

      const videoUrl = response.data.videoUrl
      if (videoUrl) {
        return await this.downloadAndSaveVideo(videoUrl, prompt)
      }

      throw new Error('이미지 애니메이션 실패')

    } catch (error: any) {
      logger.error('Kling AI 이미지 애니메이션 실패:', error)
      return await this.animateImageWithFallback(imagePath, prompt, options)
    }
  }

  /**
   * 비동기 작업 폴링
   */
  private async pollVideoGeneration(taskId: string, maxAttempts: number = 60): Promise<string> {
    logger.info('동영상 생성 작업 폴링 시작:', taskId)

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
          const videoUrl = response.data.videoUrl
          return await this.downloadAndSaveVideo(videoUrl, 'generated')
        }

        if (status === 'failed') {
          throw new Error('동영상 생성 실패')
        }

        // 진행 중이면 대기
        await new Promise(resolve => setTimeout(resolve, 5000)) // 5초 대기

      } catch (error: any) {
        if (i === maxAttempts - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    throw new Error('동영상 생성 타임아웃')
  }

  /**
   * 대체 동영상 생성 서비스 사용
   */
  private async generateWithFallback(
    prompt: string,
    options: any
  ): Promise<string> {
    logger.info('대체 동영상 생성 서비스 사용')

    // FFmpeg 기반 기본 동영상 생성으로 대체
    // 또는 Runway ML, Pika 등 다른 서비스 사용
    const { generateVideo } = require('../videoGenerator')
    const { generateContentAudio } = require('../audioGenerator')

    // 간단한 비디오 생성 (이미지 슬라이드쇼)
    const { nanobanaAI } = require('./nanobanaAI')
    const image = await nanobanaAI.generateCharacter(prompt, 'realistic')
    
    // 이미지로부터 비디오 생성
    const GeneratedContent = require('../../types').GeneratedContent
    const content: any = {
      id: `temp_${Date.now()}`,
      script: prompt,
      duration: options.duration || 10
    }

    return await generateVideo(content, [image], undefined, undefined, true)
  }

  /**
   * 이미지 애니메이션 대체 방법
   */
  private async animateImageWithFallback(
    imagePath: string,
    prompt: string,
    options: any
  ): Promise<string> {
    logger.info('대체 이미지 애니메이션 사용')

    // FFmpeg를 사용한 간단한 애니메이션
    const ffmpeg = require('fluent-ffmpeg')
    const outputPath = path.join('./uploads/videos', `animated_${Date.now()}.mp4`)

    return new Promise((resolve, reject) => {
      ffmpeg(imagePath)
        .inputOptions(['-loop', '1'])
        .outputOptions([
          '-t', (options.duration || 5).toString(),
          '-vf', 'zoompan=z=1.1:d=150:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2)',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run()
    })
  }

  /**
   * 프롬프트 향상
   */
  private enhancePrompt(prompt: string, style?: string): string {
    const stylePrompts = {
      realistic: 'cinematic, realistic, high quality, 4K',
      anime: 'anime style, vibrant, detailed, high quality',
      cinematic: 'cinematic, dramatic lighting, film quality, professional'
    }

    const stylePrompt = style ? stylePrompts[style as keyof typeof stylePrompts] : ''
    return `${prompt}, ${stylePrompt}, smooth motion, high frame rate`
  }

  /**
   * 동영상 다운로드 및 저장
   */
  private async downloadAndSaveVideo(videoUrl: string, prompt: string): Promise<string> {
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      timeout: 300000 // 5분 타임아웃
    })

    const videoDir = './uploads/videos'
    await fs.mkdir(videoDir, { recursive: true })

    const filename = `kling_${Date.now()}_${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.mp4`
    const filepath = path.join(videoDir, filename)

    await fs.writeFile(filepath, Buffer.from(response.data))

    logger.info('동영상 저장 완료:', filepath)
    return filepath
  }

  /**
   * 긴 동영상 생성 (여러 클립 합성)
   */
  async generateLongVideo(
    prompts: string[],
    options: {
      duration?: number // 전체 길이 (초)
      transition?: 'fade' | 'cut' | 'slide'
    } = {}
  ): Promise<string> {
    logger.info(`긴 동영상 생성 시작: ${prompts.length}개 클립`)

    // 각 프롬프트로 짧은 클립 생성
    const clips = await Promise.all(
      prompts.map(prompt => this.generateVideoFromText(prompt, {
        duration: Math.floor((options.duration || 600) / prompts.length)
      }))
    )

    // 클립 합성
    return await this.mergeClips(clips, options.transition || 'fade')
  }

  /**
   * 클립 합성
   */
  private async mergeClips(clips: string[], transition: string): Promise<string> {
    const ffmpeg = require('fluent-ffmpeg')
    const outputPath = path.join('./uploads/videos', `merged_${Date.now()}.mp4`)

    return new Promise((resolve, reject) => {
      let command = ffmpeg()

      clips.forEach(clip => {
        command = command.input(clip)
      })

      const filterComplex = clips.map((_, i) => {
        if (i === 0) return `[0:v][0:a]`
        if (transition === 'fade') {
          return `[${i}:v][${i}:a]xfade=transition=fade:duration=1:offset=${i * 5}[v${i}][a${i}]`
        }
        return `[${i}:v][${i}:a]`
      }).join(';')

      command
        .complexFilter(filterComplex)
        .outputOptions(['-c:v', 'libx264', '-c:a', 'aac'])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run()
    })
  }
}

export const klingAI = new KlingAI()

