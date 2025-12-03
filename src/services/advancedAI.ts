/**
 * 🚀 고급 AI 서비스 - 프론트엔드에서 사용
 */

import api from './api'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIOptions {
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export type AIModel = 
  | 'gpt-4-turbo' 
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'

export const advancedAIService = {
  /**
   * 🤖 AI 채팅
   */
  async chat(messages: AIMessage[], model: AIModel = 'gpt-4-turbo', options?: AIOptions) {
    const response = await api.post('/api/advanced-ai/chat', {
      messages,
      model,
      options
    })
    return response.data
  },

  /**
   * 🎬 비디오 생성
   */
  async generateVideo(
    prompt: string,
    engine: 'runway' | 'pika' | 'stable' = 'runway',
    options?: any
  ) {
    const response = await api.post('/api/advanced-ai/video/generate', {
      prompt,
      engine,
      options
    })
    return response.data
  },

  /**
   * 🎨 이미지 생성
   */
  async generateImage(
    prompt: string,
    engine: 'dalle3' | 'sdxl' | 'midjourney' = 'dalle3',
    options?: any
  ) {
    const response = await api.post('/api/advanced-ai/image/generate', {
      prompt,
      engine,
      options
    })
    return response.data
  },

  /**
   * 🔍 이미지 업스케일링
   */
  async upscaleImage(imageUrl: string, scale: 2 | 4 = 4) {
    const response = await api.post('/api/advanced-ai/image/upscale', {
      imageUrl,
      scale
    })
    return response.data
  },

  /**
   * 🎭 배경 제거
   */
  async removeBackground(imageUrl: string) {
    const response = await api.post('/api/advanced-ai/image/remove-background', {
      imageUrl
    })
    return response.data
  },

  /**
   * 🗣️ 음성 생성
   */
  async generateVoice(text: string, voice?: string, options?: any) {
    const response = await api.post('/api/advanced-ai/audio/generate-voice', {
      text,
      voice,
      options
    })
    return response.data
  },

  /**
   * 🎼 음악 생성
   */
  async generateMusic(
    genre: 'cinematic' | 'electronic' | 'rock' | 'pop' | 'classical' | 'ambient',
    duration: number = 60,
    mood?: 'happy' | 'sad' | 'energetic' | 'calm'
  ) {
    const response = await api.post('/api/advanced-ai/audio/generate-music', {
      genre,
      duration,
      mood
    })
    return response.data
  },

  /**
   * 📊 통계 조회
   */
  async getStats() {
    const response = await api.get('/api/advanced-ai/stats')
    return response.data
  },

  /**
   * 🎯 자동 모델 선택
   */
  async autoSelectModel(task: string, content: string) {
    const response = await api.post('/api/advanced-ai/auto-select', {
      task,
      content
    })
    return response.data
  }
}

export default advancedAIService

