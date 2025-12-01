import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs/promises'
import { logger } from '../utils/logger'

export interface SubtitleStyle {
  fontName?: string
  fontSize?: number
  fontColor?: string
  backgroundColor?: string
  outlineColor?: string
  outlineWidth?: number
  position?: 'top' | 'center' | 'bottom'
  alignment?: number // 2=center, 1=left, 3=right
  marginV?: number
}

export interface SubtitleSegment {
  start: number // seconds
  end: number // seconds
  text: string
}

/**
 * 자막 파일 생성 (SRT 형식)
 */
export async function generateSRT(
  segments: SubtitleSegment[],
  outputPath: string
): Promise<string> {
  logger.info('SRT 자막 파일 생성:', outputPath)

  let srtContent = ''
  
  segments.forEach((segment, index) => {
    const startTime = formatSRTTime(segment.start)
    const endTime = formatSRTTime(segment.end)
    
    srtContent += `${index + 1}\n`
    srtContent += `${startTime} --> ${endTime}\n`
    srtContent += `${segment.text}\n\n`
  })

  await fs.writeFile(outputPath, srtContent, 'utf-8')
  logger.info('SRT 자막 파일 생성 완료')
  return outputPath
}

/**
 * 시간을 SRT 형식으로 변환 (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`
}

/**
 * 텍스트를 자막 세그먼트로 분할
 */
export function splitTextIntoSubtitles(
  text: string,
  maxCharsPerLine: number = 40,
  maxLines: number = 2,
  duration: number = 60
): SubtitleSegment[] {
  const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 0)
  const segments: SubtitleSegment[] = []
  
  let currentText = ''
  let currentStart = 0
  let segmentIndex = 0

  // 각 문장의 예상 시간 계산 (평균 읽기 속도: 150자/분)
  const charsPerSecond = 150 / 60 // 약 2.5자/초

  sentences.forEach((sentence, index) => {
    const sentenceWithPunctuation = sentence + (index < sentences.length - 1 ? '.' : '')
    
    // 현재 텍스트에 문장 추가 시 길이 확인
    const testText = currentText ? `${currentText} ${sentenceWithPunctuation}` : sentenceWithPunctuation
    
    if (testText.length <= maxCharsPerLine * maxLines) {
      // 추가 가능
      currentText = testText
    } else {
      // 현재 세그먼트 저장
      if (currentText) {
        const segmentDuration = Math.max(2, currentText.length / charsPerSecond)
        segments.push({
          start: currentStart,
          end: currentStart + segmentDuration,
          text: currentText
        })
        currentStart += segmentDuration
      }
      
      // 새 세그먼트 시작
      currentText = sentenceWithPunctuation
    }
  })

  // 마지막 세그먼트 저장
  if (currentText) {
    const segmentDuration = Math.max(2, currentText.length / charsPerSecond)
    const endTime = Math.min(currentStart + segmentDuration, duration)
    segments.push({
      start: currentStart,
      end: endTime,
      text: currentText
    })
  }

  return segments
}

/**
 * 비디오에 자막 추가 (FFmpeg 사용)
 */
export async function addSubtitlesToVideo(
  videoPath: string,
  subtitleSegments: SubtitleSegment[],
  outputPath: string,
  style: SubtitleStyle = {}
): Promise<string> {
  logger.info('비디오에 자막 추가 시작')

  // 기본 스타일
  const defaultStyle: SubtitleStyle = {
    fontName: 'Arial',
    fontSize: 24,
    fontColor: 'white',
    backgroundColor: 'black@0.5',
    outlineColor: 'black',
    outlineWidth: 2,
    position: 'bottom',
    alignment: 2, // center
    marginV: 20
  }

  const finalStyle = { ...defaultStyle, ...style }

  // ASS 형식 자막 파일 생성 (고급 스타일링 지원)
  const assPath = outputPath.replace('.mp4', '.ass')
  await generateASS(subtitleSegments, assPath, finalStyle)

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf', `subtitles='${assPath.replace(/\\/g, '/')}':force_style='FontName=${finalStyle.fontName},FontSize=${finalStyle.fontSize},PrimaryColour=&H${hexToAssColor(finalStyle.fontColor || 'white')},BackColour=&H${hexToAssColor(finalStyle.backgroundColor || 'black@0.5')},OutlineColour=&H${hexToAssColor(finalStyle.outlineColor || 'black')},Outline=${finalStyle.outlineWidth},Alignment=${finalStyle.alignment},MarginV=${finalStyle.marginV}'`
      ])
      .output(outputPath)
      .on('end', async () => {
        // 임시 ASS 파일 삭제
        try {
          await fs.unlink(assPath)
        } catch (error) {
          logger.warn('ASS 파일 삭제 실패:', error)
        }
        logger.info('자막 추가 완료')
        resolve(outputPath)
      })
      .on('error', (err) => {
        logger.error('자막 추가 실패:', err)
        reject(err)
      })
      .run()
  })
}

/**
 * ASS 형식 자막 파일 생성 (고급 스타일링)
 */
async function generateASS(
  segments: SubtitleSegment[],
  outputPath: string,
  style: SubtitleStyle
): Promise<void> {
  const assContent = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontName},${style.fontSize},&H${hexToAssColor(style.fontColor || 'white')},&H000000FF,&H${hexToAssColor(style.outlineColor || 'black')},&H${hexToAssColor(style.backgroundColor || 'black@0.5')},0,0,0,0,100,100,0,0,1,${style.outlineWidth || 2},0,${style.alignment || 2},10,10,${style.marginV || 20},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${segments.map(segment => 
  `Dialogue: 0,${formatASSTime(segment.start)},${formatASSTime(segment.end)},Default,,0,0,0,,${segment.text}`
).join('\n')}
`

  await fs.writeFile(outputPath, assContent, 'utf-8')
}

/**
 * 시간을 ASS 형식으로 변환 (H:MM:SS.cc)
 */
function formatASSTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const centiseconds = Math.floor((seconds % 1) * 100)

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
}

/**
 * HEX 색상을 ASS 형식으로 변환
 */
function hexToAssColor(hex: string): string {
  // 'black@0.5' 같은 형식 처리
  if (hex.includes('@')) {
    const [color, alpha] = hex.split('@')
    hex = color
  }

  // HEX 색상 코드 제거
  hex = hex.replace('#', '')
  
  // RGB를 BGR로 변환 (ASS는 BGR 형식)
  if (hex.length === 6) {
    const r = hex.substring(0, 2)
    const g = hex.substring(2, 4)
    const b = hex.substring(4, 6)
    return `${b}${g}${r}`.toUpperCase()
  }

  // 기본값
  return 'FFFFFF'
}

