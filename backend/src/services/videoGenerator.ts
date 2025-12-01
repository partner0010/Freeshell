import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs/promises'
import { GeneratedContent } from '../types'
import { logger } from '../utils/logger'
import { advancedVideoEdit, VideoEditOptions } from './advancedVideoEditor'
import { generateContentAudio } from './audioGenerator'

/**
 * 비디오 생성 (FFmpeg 사용)
 * 음성 자동 생성 및 합성 포함
 */
export async function generateVideo(
  content: GeneratedContent,
  images?: string[],
  videos?: string[],
  editOptions?: VideoEditOptions,
  includeAudio: boolean = true
): Promise<string> {
  logger.info('비디오 생성 시작:', content.id)

  const tempOutputPath = path.join('./uploads/videos', `temp_${content.id}.mp4`)
  const tempAudioPath = path.join('./uploads/audio', `temp_${content.id}.mp3`)
  const finalOutputPath = path.join('./uploads/videos', `${content.id}.mp4`)

  try {
    // FFmpeg가 설치되어 있는지 확인
    try {
      await checkFFmpeg()
    } catch (error) {
      logger.warn('FFmpeg가 설치되어 있지 않습니다. 비디오 생성 건너뜀')
      return finalOutputPath // 경로만 반환
    }

    // 음성 생성 (대본이 있는 경우) - SUPERTONE AI 사용
    let audioPath: string | null = null
    if (includeAudio && content.script) {
      try {
        // SUPERTONE AI로 나레이션 생성 (기본값: true)
        audioPath = await generateContentAudio(
          content.script,
          'ko',
          content.contentType,
          true // SUPERTONE AI 사용
        )
        logger.info('나레이션 생성 완료 (SUPERTONE AI):', audioPath)
      } catch (error) {
        logger.warn('나레이션 생성 실패 (비디오는 계속 생성):', error)
      }
    }

    // 이미지나 비디오가 있으면 조합
    if (images && images.length > 0) {
      await createVideoFromImages(images, tempOutputPath, content.duration, audioPath)
    } else if (videos && videos.length > 0) {
      await createVideoFromVideos(videos, tempOutputPath, content.duration, audioPath)
    } else {
      // 기본 비디오 생성 (텍스트만)
      await createTextVideo(content, tempOutputPath, audioPath)
    }

    // 고급 편집 옵션이 있으면 적용
    if (editOptions) {
      await advancedVideoEdit(tempOutputPath, finalOutputPath, editOptions)
      // 임시 파일 삭제
      try {
        await fs.unlink(tempOutputPath)
      } catch (error) {
        logger.warn('임시 파일 삭제 실패:', error)
      }
    } else {
      // 편집 옵션이 없으면 임시 파일을 최종 파일로 이동
      await fs.rename(tempOutputPath, finalOutputPath)
    }

    // 임시 오디오 파일 삭제
    if (audioPath && audioPath.includes('temp_')) {
      try {
        await fs.unlink(audioPath)
      } catch (error) {
        logger.warn('임시 오디오 파일 삭제 실패:', error)
      }
    }

    logger.info('비디오 생성 완료:', finalOutputPath)
    return finalOutputPath

  } catch (error) {
    logger.error('비디오 생성 실패:', error)
    // 실패해도 경로는 반환 (나중에 재시도 가능)
    return finalOutputPath
  }
}

/**
 * FFmpeg 설치 확인
 */
async function checkFFmpeg(): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg.getAvailableEncoders((err, encoders) => {
      if (err) {
        reject(new Error('FFmpeg를 찾을 수 없습니다'))
      } else {
        resolve()
      }
    })
  })
}

/**
 * 이미지로부터 비디오 생성 (음성 포함 가능)
 */
async function createVideoFromImages(
  images: string[],
  outputPath: string,
  duration: number,
  audioPath?: string | null
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (images.length === 0) {
      reject(new Error('이미지가 없습니다'))
      return
    }

    const imageDuration = Math.max(1, duration / images.length)
    let command = ffmpeg()

    // 첫 번째 이미지로 시작
    command = command.input(images[0])
      .inputOptions(['-loop', '1', '-t', imageDuration.toString()])

    // 나머지 이미지 추가
    for (let i = 1; i < images.length; i++) {
      command = command.input(images[i])
        .inputOptions(['-loop', '1', '-t', imageDuration.toString()])
    }

    // 오디오가 있으면 추가
    if (audioPath) {
      command = command.input(audioPath)
    }

    // 필터 설정
    const filters: any[] = [
      {
        filter: 'concat',
        options: {
          n: images.length,
          v: 1,
          a: audioPath ? 1 : 0
        }
      }
    ]

    command
      .complexFilter(filters)
      .outputOptions([
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        '-t', duration.toString()
      ])
      .audioCodec('aac')
      .audioBitrate('128k')
      .output(outputPath)
      .on('end', () => {
        logger.info('이미지 비디오 생성 완료 (음성 포함)')
        resolve()
      })
      .on('error', (err) => {
        logger.error('이미지 비디오 생성 실패:', err)
        reject(err)
      })
      .run()
  })
}

/**
 * 비디오 파일들로부터 비디오 생성 (음성 포함 가능)
 */
async function createVideoFromVideos(
  videos: string[],
  outputPath: string,
  duration: number,
  audioPath?: string | null
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (videos.length === 0) {
      reject(new Error('비디오가 없습니다'))
      return
    }

    let command = ffmpeg()

    videos.forEach((video) => {
      command = command.input(video)
    })

    // 오디오가 있고 기존 비디오에 오디오가 없으면 추가
    if (audioPath) {
      command = command.input(audioPath)
    }

    const filterOptions: any = {
      n: videos.length,
      v: 1,
      a: audioPath ? 1 : 1
    }

    command
      .complexFilter([
        {
          filter: 'concat',
          options: filterOptions
        }
      ])
      .outputOptions([
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-t', duration.toString()
      ])
      .output(outputPath)
      .on('end', () => {
        logger.info('비디오 합성 완료 (음성 포함)')
        resolve()
      })
      .on('error', (err) => {
        logger.error('비디오 합성 실패:', err)
        reject(err)
      })
      .run()
  })
}

/**
 * 텍스트만으로 비디오 생성 (음성 포함 가능)
 */
async function createTextVideo(
  content: GeneratedContent,
  outputPath: string,
  audioPath?: string | null
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 단색 배경 비디오 생성
    const width = 1080
    const height = 1920 // Shorts 비율
    
    let command = ffmpeg()
      .input('color=c=black:s=' + width + 'x' + height + ':d=' + content.duration)
      .inputFormat('lavfi')

    // 오디오가 있으면 추가
    if (audioPath) {
      command = command.input(audioPath)
    }

    command
      .outputOptions([
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        '-t', content.duration.toString()
      ])
      .audioCodec('aac')
      .audioBitrate('128k')
      .output(outputPath)
      .on('end', () => {
        logger.info('텍스트 비디오 생성 완료 (음성 포함)')
        resolve()
      })
      .on('error', (err) => {
        logger.warn('텍스트 비디오 생성 실패 (정상, FFmpeg 없을 수 있음):', err.message)
        // 실패해도 계속 진행
        resolve()
      })
      .run()
  })
}
