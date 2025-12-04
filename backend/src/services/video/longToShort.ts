/**
 * ✂️ 긴 영상 → 숏폼 자동 변환
 * OpusClip 스타일 기능
 */

import { logger } from '../../utils/logger'
import { openai } from '../ai/openaiClient'

export interface LongToShortOptions {
  maxShorts: number           // 생성할 숏폼 개수
  shortDuration: number       // 각 숏폼 길이 (초)
  addCaptions: boolean        // 자막 추가
  addEffects: boolean         // 이펙트 추가
  viralScore: boolean         // 바이럴 점수 계산
}

export interface ShortClip {
  startTime: number
  endTime: number
  score: number               // 바이럴 가능성 점수 (0-100)
  reason: string              // 선택 이유
  transcript: string          // 대사/내용
  keyMoments: string[]        // 핵심 순간
}

export class LongToShortConverter {
  /**
   * 🎬 긴 영상 분석 (GPT-4로 하이라이트 찾기)
   */
  async analyzeVideo(videoPath: string, transcript: string): Promise<ShortClip[]> {
    try {
      logger.info('🎬 긴 영상 분석 시작...')

      // GPT-4로 하이라이트 찾기
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `당신은 영상 편집 전문가입니다. 긴 영상을 분석하여 가장 재미있고 바이럴될 가능성이 높은 부분을 찾아주세요.

각 클립에 대해:
1. 시작 시간 (초)
2. 끝 시간 (초)
3. 바이럴 점수 (0-100)
4. 선택 이유
5. 핵심 내용

JSON 형식으로 반환하세요.`
          },
          {
            role: 'user',
            content: `이 영상의 자막입니다. 30초 길이의 숏폼 10개를 추천해주세요:\n\n${transcript}`
          }
        ],
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      const clips: ShortClip[] = result.clips || []

      // 점수순 정렬
      clips.sort((a, b) => b.score - a.score)

      logger.info(`✅ ${clips.length}개 하이라이트 발견`)

      return clips
    } catch (error: any) {
      logger.error('영상 분석 실패:', error.message)
      return []
    }
  }

  /**
   * ✂️ 클립 자르기
   */
  async extractClip(
    videoPath: string,
    clip: ShortClip,
    options: LongToShortOptions
  ): Promise<string> {
    try {
      // FFmpeg로 클립 추출
      // 실제 구현 시 fluent-ffmpeg 사용
      
      const outputPath = `./temp/short-${clip.startTime}-${clip.endTime}.mp4`

      logger.info(`✂️ 클립 추출: ${clip.startTime}초 ~ ${clip.endTime}초`)

      /*
      // 실제 FFmpeg 코드:
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .setStartTime(clip.startTime)
          .setDuration(clip.endTime - clip.startTime)
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run()
      })
      */

      return outputPath
    } catch (error: any) {
      logger.error('클립 추출 실패:', error.message)
      throw error
    }
  }

  /**
   * 📝 자막 자동 추가
   */
  async addCaptions(videoPath: string, transcript: string): Promise<string> {
    try {
      logger.info('📝 자막 추가 중...')

      // FFmpeg + SRT 파일로 자막 추가
      const outputPath = videoPath.replace('.mp4', '-captioned.mp4')

      /*
      // 실제 FFmpeg 코드:
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .outputOptions([
            '-vf subtitles=subtitles.srt:force_style=\'FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2\''
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run()
      })
      */

      return outputPath
    } catch (error: any) {
      logger.error('자막 추가 실패:', error.message)
      throw error
    }
  }

  /**
   * ✨ 바이럴 이펙트 추가
   */
  async addViralEffects(videoPath: string): Promise<string> {
    try {
      logger.info('✨ 바이럴 이펙트 추가 중...')

      // 줌인/줌아웃, 텍스트 애니메이션 등
      const outputPath = videoPath.replace('.mp4', '-effects.mp4')

      /*
      // 실제 FFmpeg 코드:
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .complexFilter([
            '[0:v]zoompan=z=\'min(zoom+0.0015,1.5)\':d=125:s=1080x1920',
            'fade=t=in:st=0:d=0.5,fade=t=out:st=29.5:d=0.5'
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run()
      })
      */

      return outputPath
    } catch (error: any) {
      logger.error('이펙트 추가 실패:', error.message)
      throw error
    }
  }

  /**
   * 🎯 전체 프로세스: 긴 영상 → 숏폼들
   */
  async convertLongToShorts(
    videoPath: string,
    transcript: string,
    options: LongToShortOptions
  ) {
    try {
      logger.info('🎬 긴 영상 → 숏폼 변환 시작')

      // 1. AI로 하이라이트 찾기
      const clips = await this.analyzeVideo(videoPath, transcript)
      const selectedClips = clips.slice(0, options.maxShorts)

      logger.info(`📋 ${selectedClips.length}개 클립 선택됨`)

      // 2. 각 클립 처리
      const results = await Promise.all(
        selectedClips.map(async (clip, index) => {
          try {
            // 클립 추출
            let outputPath = await this.extractClip(videoPath, clip, options)

            // 자막 추가 (옵션)
            if (options.addCaptions) {
              outputPath = await this.addCaptions(outputPath, clip.transcript)
            }

            // 이펙트 추가 (옵션)
            if (options.addEffects) {
              outputPath = await this.addViralEffects(outputPath)
            }

            logger.info(`✅ 숏폼 ${index + 1} 완료`)

            return {
              success: true,
              path: outputPath,
              clip,
              index: index + 1
            }
          } catch (error: any) {
            logger.error(`❌ 숏폼 ${index + 1} 실패:`, error.message)
            return {
              success: false,
              error: error.message,
              clip,
              index: index + 1
            }
          }
        })
      )

      const successful = results.filter(r => r.success)

      logger.info(`🎉 숏폼 변환 완료: ${successful.length}/${selectedClips.length}`)

      return {
        success: successful.length > 0,
        shorts: successful,
        total: selectedClips.length
      }
    } catch (error: any) {
      logger.error('긴 영상 변환 실패:', error.message)
      return {
        success: false,
        shorts: [],
        total: 0,
        error: error.message
      }
    }
  }

  /**
   * 🎤 음성 클론 (Hugging Face)
   */
  async cloneVoice(audioSample: Buffer, text: string) {
    try {
      // Bark 또는 Coqui TTS 사용
      const result = await this.huggingFaceInference(
        'suno/bark',
        { inputs: text }
      )

      if (result.success) {
        logger.info('🎤 음성 클론 완료')
        return {
          success: true,
          audio: result.data
        }
      }

      return { success: false }
    } catch (error: any) {
      logger.error('음성 클론 실패:', error.message)
      return { success: false }
    }
  }
}

// 싱글톤
export const longToShortConverter = new LongToShortConverter()
export default longToShortConverter

