import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'
import { logger } from '../utils/logger'
import { superToneAI } from './ai/superToneAI'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

export interface AudioGenerationOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  speed?: number // 0.25 ~ 4.0
  language?: string
}

/**
 * 텍스트를 음성으로 변환 (TTS)
 * OpenAI TTS API 사용
 */
export async function generateSpeech(
  text: string,
  options: AudioGenerationOptions = {}
): Promise<string> {
  logger.info('음성 생성 시작:', { textLength: text.length, options })

  if (!openai) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다')
  }

  try {
    // 텍스트 길이 제한 (OpenAI TTS는 최대 4096자)
    const maxLength = 4096
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '...'
      : text

    // 음성 생성
    const response = await openai.audio.speech.create({
      model: 'tts-1', // 또는 'tts-1-hd' (고품질, 더 비쌈)
      voice: options.voice || 'nova', // 기본값: nova (자연스러운 여성 목소리)
      input: truncatedText,
      speed: options.speed || 1.0
    })

    // 오디오 파일 저장
    const audioDir = './uploads/audio'
    await fs.mkdir(audioDir, { recursive: true })
    
    const audioPath = path.join(audioDir, `speech_${Date.now()}.mp3`)
    const buffer = Buffer.from(await response.arrayBuffer())
    await fs.writeFile(audioPath, buffer)

    logger.info('음성 생성 완료:', audioPath)
    return audioPath

  } catch (error: any) {
    logger.error('음성 생성 실패:', error)
    throw new Error(`음성 생성 실패: ${error.message}`)
  }
}

/**
 * 긴 텍스트를 여러 개의 오디오로 분할하여 생성
 */
export async function generateLongSpeech(
  text: string,
  options: AudioGenerationOptions = {}
): Promise<string[]> {
  logger.info('긴 텍스트 음성 생성 시작:', { textLength: text.length })

  const maxLength = 4000 // 안전 마진 포함
  const audioFiles: string[] = []

  // 텍스트를 문장 단위로 분할
  const sentences = text.split(/[.!?]\s+/)
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      // 현재 청크가 가득 찼으면 음성 생성
      if (currentChunk.trim()) {
        const audioPath = await generateSpeech(currentChunk.trim(), options)
        audioFiles.push(audioPath)
      }
      currentChunk = sentence
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence
    }
  }

  // 마지막 청크 처리
  if (currentChunk.trim()) {
    const audioPath = await generateSpeech(currentChunk.trim(), options)
    audioFiles.push(audioPath)
  }

  logger.info('긴 텍스트 음성 생성 완료:', { fileCount: audioFiles.length })
  return audioFiles
}

/**
 * 콘텐츠에서 음성 생성 (대본 기반)
 * SUPERTONE AI 우선 사용, 실패 시 OpenAI TTS 사용
 */
export async function generateContentAudio(
  script: string,
  language: string = 'ko',
  contentType?: string,
  useSuperTone: boolean = true
): Promise<string> {
  logger.info('콘텐츠 음성 생성:', { scriptLength: script.length, language, useSuperTone })

  // SUPERTONE AI 우선 사용 (기본값)
  if (useSuperTone) {
    try {
      logger.info('SUPERTONE AI 나레이션 생성 시도')
      const audioPath = await superToneAI.generateContentNarration(
        script,
        contentType || 'narrative',
        language
      )
      logger.info('SUPERTONE AI 나레이션 생성 완료')
      return audioPath
    } catch (error) {
      logger.warn('SUPERTONE AI 생성 실패, OpenAI TTS 사용:', error)
      // OpenAI TTS로 대체
    }
  }

  // OpenAI TTS 사용 (대체 또는 useSuperTone=false인 경우)
  const voiceMap: Record<string, AudioGenerationOptions['voice']> = {
    'ko': 'nova', // 한국어: 자연스러운 여성 목소리
    'en': 'alloy', // 영어: 중성적 목소리
    'ja': 'shimmer', // 일본어: 부드러운 목소리
    'zh': 'echo' // 중국어: 명확한 목소리
  }

  const options: AudioGenerationOptions = {
    voice: voiceMap[language] || 'nova',
    speed: 1.0,
    language
  }

  // 텍스트가 길면 분할 생성
  if (script.length > 4000) {
    const audioFiles = await generateLongSpeech(script, options)
    // 여러 파일을 하나로 합치는 것은 videoGenerator에서 처리
    return audioFiles[0] // 첫 번째 파일 반환 (나중에 합성)
  } else {
    return await generateSpeech(script, options)
  }
}

