/**
 * 통합 음성 생성 AI 서비스
 * ElevenLabs, OpenAI TTS, Google Cloud TTS
 */

import OpenAI from 'openai'
import { logger } from '../../utils/logger'
import * as fs from 'fs/promises'
import * as path from 'path'

interface VoiceGenerationOptions {
  text: string
  voice?: string
  model?: string
  speed?: number
  language?: string
}

interface VoiceGenerationResult {
  audioUrl: string
  audioPath: string
  duration?: number
  service: string
}

export class VoiceGenerator {
  private openai: OpenAI | null = null
  private elevenLabsApiKey: string | null = null

  constructor() {
    // OpenAI TTS 초기화
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey })
      logger.info('✅ OpenAI TTS 초기화 완료')
    }

    // ElevenLabs 초기화
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || null
    if (this.elevenLabsApiKey) {
      logger.info('✅ ElevenLabs TTS 초기화 완료')
    }

    if (!openaiKey && !this.elevenLabsApiKey) {
      logger.warn('음성 생성 API 키가 설정되지 않았습니다')
    }
  }

  /**
   * OpenAI TTS로 음성 생성
   */
  async generateWithOpenAI(options: VoiceGenerationOptions): Promise<VoiceGenerationResult> {
    if (!this.openai) {
      throw new Error('OpenAI API가 초기화되지 않았습니다')
    }

    try {
      logger.info(`🎤 OpenAI TTS 음성 생성 시작: ${options.text.substring(0, 30)}...`)

      const mp3 = await this.openai.audio.speech.create({
        model: options.model || 'tts-1-hd', // 'tts-1' 또는 'tts-1-hd'
        voice: (options.voice as any) || 'alloy', // alloy, echo, fable, onyx, nova, shimmer
        input: options.text,
        speed: options.speed || 1.0,
      })

      // 파일 저장
      const buffer = Buffer.from(await mp3.arrayBuffer())
      const fileName = `voice-${Date.now()}.mp3`
      const audioPath = path.join(process.cwd(), 'uploads', fileName)

      // uploads 디렉토리 생성
      await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true })
      await fs.writeFile(audioPath, buffer)

      logger.info(`✅ OpenAI TTS 음성 생성 완료: ${audioPath}`)

      return {
        audioUrl: `/uploads/${fileName}`,
        audioPath,
        service: 'OpenAI TTS HD',
      }
    } catch (error: any) {
      logger.error('OpenAI TTS 음성 생성 실패:', error)
      throw new Error(`OpenAI TTS 오류: ${error.message}`)
    }
  }

  /**
   * ElevenLabs로 음성 생성 (최고 품질)
   */
  async generateWithElevenLabs(options: VoiceGenerationOptions): Promise<VoiceGenerationResult> {
    if (!this.elevenLabsApiKey) {
      throw new Error('ELEVENLABS_API_KEY가 설정되지 않았습니다')
    }

    try {
      logger.info(`🎤 ElevenLabs 음성 생성 시작: ${options.text.substring(0, 30)}...`)

      // ElevenLabs API 호출
      const voiceId = options.voice || '21m00Tcm4TlvDq8ikWAM' // Rachel (기본 음성)

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: options.text,
          model_id: options.model || 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`ElevenLabs API 오류: ${response.status} ${errorText}`)
      }

      // 파일 저장
      const buffer = Buffer.from(await response.arrayBuffer())
      const fileName = `voice-${Date.now()}.mp3`
      const audioPath = path.join(process.cwd(), 'uploads', fileName)

      await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true })
      await fs.writeFile(audioPath, buffer)

      logger.info(`✅ ElevenLabs 음성 생성 완료: ${audioPath}`)

      return {
        audioUrl: `/uploads/${fileName}`,
        audioPath,
        service: 'ElevenLabs',
      }
    } catch (error: any) {
      logger.error('ElevenLabs 음성 생성 실패:', error)
      throw new Error(`ElevenLabs 오류: ${error.message}`)
    }
  }

  /**
   * Google Cloud TTS로 음성 생성 (무료 할당량)
   */
  async generateWithGoogle(options: VoiceGenerationOptions): Promise<VoiceGenerationResult> {
    const googleKey = process.env.GOOGLE_CLOUD_API_KEY

    if (!googleKey) {
      throw new Error('GOOGLE_CLOUD_API_KEY가 설정되지 않았습니다')
    }

    try {
      logger.info(`🎤 Google Cloud TTS 음성 생성 시작: ${options.text.substring(0, 30)}...`)

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text: options.text },
            voice: {
              languageCode: options.language || 'ko-KR',
              name: options.voice || 'ko-KR-Standard-A',
              ssmlGender: 'FEMALE',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: options.speed || 1.0,
              pitch: 0.0,
            },
          }),
        }
      )

      const data = await response.json()

      if (!data.audioContent) {
        throw new Error('Google TTS에서 오디오를 받지 못했습니다')
      }

      // Base64 디코딩 및 파일 저장
      const buffer = Buffer.from(data.audioContent, 'base64')
      const fileName = `voice-${Date.now()}.mp3`
      const audioPath = path.join(process.cwd(), 'uploads', fileName)

      await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true })
      await fs.writeFile(audioPath, buffer)

      logger.info(`✅ Google Cloud TTS 음성 생성 완료: ${audioPath}`)

      return {
        audioUrl: `/uploads/${fileName}`,
        audioPath,
        service: 'Google Cloud TTS',
      }
    } catch (error: any) {
      logger.error('Google Cloud TTS 음성 생성 실패:', error)
      throw new Error(`Google TTS 오류: ${error.message}`)
    }
  }

  /**
   * 자동으로 최적의 서비스 선택
   */
  async generate(options: VoiceGenerationOptions): Promise<VoiceGenerationResult> {
    // 1차: ElevenLabs 시도 (최고 품질)
    if (this.elevenLabsApiKey) {
      try {
        return await this.generateWithElevenLabs(options)
      } catch (error) {
        logger.warn('ElevenLabs 실패, OpenAI TTS로 전환')
      }
    }

    // 2차: OpenAI TTS 시도
    if (this.openai) {
      try {
        return await this.generateWithOpenAI(options)
      } catch (error) {
        logger.warn('OpenAI TTS 실패, Google TTS로 전환')
      }
    }

    // 3차: Google Cloud TTS 시도
    if (process.env.GOOGLE_CLOUD_API_KEY) {
      try {
        return await this.generateWithGoogle(options)
      } catch (error) {
        logger.error('모든 음성 생성 서비스 실패:', error)
        throw new Error('음성을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    throw new Error('사용 가능한 음성 생성 서비스가 없습니다')
  }

  /**
   * 긴 텍스트를 여러 청크로 나누어 음성 생성
   */
  async generateLongText(text: string, options: Omit<VoiceGenerationOptions, 'text'> = {}): Promise<VoiceGenerationResult[]> {
    // 문장 단위로 분할 (최대 500자)
    const chunks: string[] = []
    const sentences = text.split(/[.!?。！？]\s+/)

    let currentChunk = ''
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > 500) {
        if (currentChunk) chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim())

    // 각 청크별로 음성 생성
    const results: VoiceGenerationResult[] = []
    for (const chunk of chunks) {
      const result = await this.generate({ ...options, text: chunk })
      results.push(result)
    }

    return results
  }

  /**
   * 사용 가능한 음성 목록 가져오기
   */
  async getAvailableVoices(): Promise<Array<{ id: string; name: string; service: string }>> {
    const voices: Array<{ id: string; name: string; service: string }> = []

    // OpenAI TTS 음성
    if (this.openai) {
      voices.push(
        { id: 'alloy', name: 'Alloy (중성적)', service: 'OpenAI' },
        { id: 'echo', name: 'Echo (남성)', service: 'OpenAI' },
        { id: 'fable', name: 'Fable (영국 남성)', service: 'OpenAI' },
        { id: 'onyx', name: 'Onyx (깊은 남성)', service: 'OpenAI' },
        { id: 'nova', name: 'Nova (여성)', service: 'OpenAI' },
        { id: 'shimmer', name: 'Shimmer (부드러운 여성)', service: 'OpenAI' }
      )
    }

    // ElevenLabs 음성 (기본 음성들)
    if (this.elevenLabsApiKey) {
      voices.push(
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (여성)', service: 'ElevenLabs' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (여성)', service: 'ElevenLabs' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (여성)', service: 'ElevenLabs' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (남성)', service: 'ElevenLabs' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (남성)', service: 'ElevenLabs' }
      )
    }

    return voices
  }
}

export const voiceGenerator = new VoiceGenerator()

