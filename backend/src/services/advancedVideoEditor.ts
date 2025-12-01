import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs/promises'
import { logger } from '../utils/logger'

export interface SubtitleStyle {
  fontFamily?: string
  fontSize?: number
  fontColor?: string
  backgroundColor?: string
  position?: 'top' | 'center' | 'bottom'
  animation?: 'fade' | 'slide' | 'typewriter' | 'none'
}

export interface TransitionEffect {
  type: 'fade' | 'slide' | 'zoom' | 'blur' | 'none'
  duration?: number
}

export interface VideoEditOptions {
  subtitles?: Array<{
    text: string
    startTime: number
    endTime: number
    style?: SubtitleStyle
  }>
  transitions?: TransitionEffect[]
  backgroundMusic?: string
  filters?: string[]
  outputFormat?: 'mp4' | 'mov' | 'avi'
}

/**
 * 고급 비디오 편집
 */
export async function advancedVideoEdit(
  inputVideoPath: string,
  outputPath: string,
  options: VideoEditOptions
): Promise<string> {
  logger.info('고급 비디오 편집 시작:', { inputVideoPath, options })

  try {
    // 입력 파일 확인
    await fs.access(inputVideoPath)

    let command = ffmpeg(inputVideoPath)

    // 자막 추가
    if (options.subtitles && options.subtitles.length > 0) {
      command = addSubtitles(command, options.subtitles)
    }

    // 전환 효과 추가
    if (options.transitions && options.transitions.length > 0) {
      command = addTransitions(command, options.transitions)
    }

    // 배경음악 추가
    if (options.backgroundMusic) {
      command = addBackgroundMusic(command, options.backgroundMusic)
    }

    // 필터 적용
    if (options.filters && options.filters.length > 0) {
      options.filters.forEach(filter => {
        command = command.videoFilters(filter)
      })
    }

    // 출력 포맷 설정
    const format = options.outputFormat || 'mp4'
    command = command.format(format)

    // 비디오 품질 설정
    command = command
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset medium',
        '-crf 23',
        '-movflags +faststart'
      ])

    // 실행
    await new Promise<void>((resolve, reject) => {
      command
        .on('end', () => {
          logger.info('고급 비디오 편집 완료:', outputPath)
          resolve()
        })
        .on('error', (err) => {
          logger.error('고급 비디오 편집 실패:', err)
          reject(err)
        })
        .save(outputPath)
    })

    return outputPath
  } catch (error: any) {
    logger.error('고급 비디오 편집 실패:', error)
    throw new Error(`비디오 편집 실패: ${error.message}`)
  }
}

/**
 * 자막 추가
 */
function addSubtitles(
  command: ffmpeg.FfmpegCommand,
  subtitles: Array<{
    text: string
    startTime: number
    endTime: number
    style?: SubtitleStyle
  }>
): ffmpeg.FfmpegCommand {
  // SRT 파일 생성
  const srtPath = path.join('./uploads/temp', `subtitles_${Date.now()}.srt`)
  
  let srtContent = ''
  subtitles.forEach((subtitle, index) => {
    const start = formatTime(subtitle.startTime)
    const end = formatTime(subtitle.endTime)
    const style = subtitle.style || {}
    
    srtContent += `${index + 1}\n`
    srtContent += `${start} --> ${end}\n`
    
    // 스타일 적용
    let styledText = subtitle.text
    if (style.fontColor) {
      styledText = `<font color="${style.fontColor}">${styledText}</font>`
    }
    if (style.fontSize) {
      styledText = `<font size="${style.fontSize}">${styledText}</font>`
    }
    
    srtContent += `${styledText}\n\n`
  })

  // SRT 파일 저장 (비동기로 처리해야 하지만 여기서는 간단히)
  // 실제로는 임시 파일로 저장 후 사용

  // FFmpeg 자막 필터
  const subtitleFilter = subtitles.map((subtitle, index) => {
    const style = subtitle.style || {}
    const fontSize = style.fontSize || 24
    const fontColor = style.fontColor || 'white'
    const position = style.position || 'bottom'
    
    let yPos = 'h-th-10' // bottom
    if (position === 'top') yPos = '10'
    else if (position === 'center') yPos = '(h-text_h)/2'

    return `drawtext=text='${escapeText(subtitle.text)}':x=(w-text_w)/2:y=${yPos}:fontsize=${fontSize}:fontcolor=${fontColor}:enable='between(t,${subtitle.startTime},${subtitle.endTime})'`
  }).join(',')

  return command.videoFilters(subtitleFilter)
}

/**
 * 전환 효과 추가
 */
function addTransitions(
  command: ffmpeg.FfmpegCommand,
  transitions: TransitionEffect[]
): ffmpeg.FfmpegCommand {
  // 전환 효과는 복잡하므로 기본적인 fade 효과만 구현
  const fadeTransitions = transitions.filter(t => t.type === 'fade')
  
  if (fadeTransitions.length > 0) {
    // Fade in/out 효과
    const fadeIn = 'fade=t=in:st=0:d=0.5'
    const fadeOut = 'fade=t=out:st=0:d=0.5' // 실제로는 비디오 길이에 맞춰야 함
    
    return command.videoFilters([fadeIn, fadeOut])
  }

  return command
}

/**
 * 배경음악 추가
 */
function addBackgroundMusic(
  command: ffmpeg.FfmpegCommand,
  musicPath: string
): ffmpeg.FfmpegCommand {
  return command
    .input(musicPath)
    .complexFilter([
      {
        filter: 'amix',
        options: {
          inputs: 2,
          duration: 'longest'
        }
      }
    ])
}

/**
 * 시간 포맷팅 (SRT 형식)
 */
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`
}

/**
 * 텍스트 이스케이프 (FFmpeg drawtext용)
 */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
}

/**
 * 자막 스타일을 FFmpeg 필터로 변환
 */
export function createSubtitleFilter(
  text: string,
  startTime: number,
  endTime: number,
  style: SubtitleStyle
): string {
  const fontSize = style.fontSize || 24
  const fontColor = style.fontColor || 'white'
  const bgColor = style.backgroundColor || 'black@0.5'
  
  let yPos = 'h-th-10' // bottom
  if (style.position === 'top') yPos = '10'
  else if (style.position === 'center') yPos = '(h-text_h)/2'

  let filter = `drawtext=text='${escapeText(text)}':x=(w-text_w)/2:y=${yPos}:fontsize=${fontSize}:fontcolor=${fontColor}`

  if (style.backgroundColor) {
    filter += `:box=1:boxcolor=${bgColor}:boxborderw=5`
  }

  // 애니메이션 효과
  if (style.animation === 'fade') {
    filter += `:alpha='if(lt(t,${startTime}),0,if(lt(t,${startTime + 0.5}),((t-${startTime})/0.5),if(lt(t,${endTime - 0.5}),1,if(lt(t,${endTime}),1-((t-${endTime - 0.5})/0.5),0))))'`
  }

  filter += `:enable='between(t,${startTime},${endTime})'`

  return filter
}

