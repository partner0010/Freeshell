/**
 * 🆓 무료 AI Hub
 * Hugging Face, Pollinations, Replicate, Groq 통합
 */

import axios from 'axios'
import { logger } from '../../utils/logger'

class FreeAIHub {
  /**
   * 🎨 Pollinations.ai (완전 무료, API 키 불필요!)
   */
  async pollinationsImage(prompt: string): Promise<string> {
    // API 키 불필요! URL만으로 이미지 생성
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
    
    logger.info('🎨 Pollinations 이미지 생성')
    return url
  }

  async pollinationsAudio(prompt: string): Promise<string> {
    const url = `https://audio.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
    
    logger.info('🎵 Pollinations 오디오 생성')
    return url
  }

  /**
   * ⚡ Groq (초고속 무료 LLM)
   */
  async groqChat(prompt: string, model: string = 'llama-3.1-70b-versatile') {
    try {
      const apiKey = process.env.GROQ_API_KEY
      
      if (!apiKey) {
        logger.warn('Groq API 키 없음')
        return { success: false, text: '' }
      }

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      logger.info('⚡ Groq 응답 완료 (초고속!)')

      return {
        success: true,
        text: response.data.choices[0].message.content,
        speed: '500+ tokens/초'
      }
    } catch (error: any) {
      logger.error('Groq 실패:', error.message)
      return { success: false, text: '' }
    }
  }

  /**
   * 🤗 Hugging Face Inference API
   */
  async huggingFaceInference(model: string, inputs: any) {
    try {
      const apiKey = process.env.HUGGINGFACE_API_KEY
      
      if (!apiKey) {
        logger.warn('HuggingFace API 키 없음')
        return { success: false }
      }

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        inputs,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      )

      logger.info(`🤗 HuggingFace ${model} 완료`)

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      logger.error('HuggingFace 실패:', error.message)
      return { success: false }
    }
  }

  /**
   * 🎬 SDXL Turbo (빠른 이미지 생성)
   */
  async sdxlTurbo(prompt: string) {
    return await this.huggingFaceInference(
      'stabilityai/sdxl-turbo',
      { inputs: prompt }
    )
  }

  /**
   * 🎵 MusicGen (음악 생성)
   */
  async musicGen(prompt: string) {
    return await this.huggingFaceInference(
      'facebook/musicgen-large',
      { inputs: prompt }
    )
  }

  /**
   * 🎤 BARK (텍스트→음성)
   */
  async bark(text: string) {
    return await this.huggingFaceInference(
      'suno/bark',
      { inputs: text }
    )
  }

  /**
   * 🎬 Stable Video Diffusion
   */
  async stableVideoDiffusion(imageUrl: string) {
    return await this.huggingFaceInference(
      'stabilityai/stable-video-diffusion-img2vid-xt',
      { inputs: imageUrl }
    )
  }

  /**
   * 🔄 Replicate (여러 모델)
   */
  async replicate(model: string, input: any) {
    try {
      const apiKey = process.env.REPLICATE_API_KEY
      
      if (!apiKey) {
        logger.warn('Replicate API 키 없음')
        return { success: false }
      }

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: model,
          input
        },
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      logger.info('🔄 Replicate 생성 시작')

      // 결과 대기
      const predictionId = response.data.id
      let result = response.data

      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${apiKey}`
            }
          }
        )
        
        result = statusResponse.data
      }

      if (result.status === 'succeeded') {
        logger.info('✅ Replicate 성공')
        return {
          success: true,
          output: result.output
        }
      } else {
        logger.error('Replicate 실패:', result.error)
        return { success: false }
      }
    } catch (error: any) {
      logger.error('Replicate 오류:', error.message)
      return { success: false }
    }
  }

  /**
   * 📊 모든 무료 AI 통계
   */
  getAvailableModels() {
    return {
      pollinations: {
        free: true,
        apiKeyRequired: false,
        models: ['image', 'audio', 'text']
      },
      groq: {
        free: true,
        apiKeyRequired: true,
        models: ['llama-3.1-70b', 'mixtral-8x7b', 'gemma-7b']
      },
      huggingface: {
        free: true,
        apiKeyRequired: true,
        limit: '30,000 requests/month',
        models: ['100,000+']
      },
      replicate: {
        free: '$50 credit/month',
        apiKeyRequired: true,
        models: ['SDXL', 'Llama', 'Whisper', 'Stable Video']
      }
    }
  }
}

// 싱글톤
export const freeAIHub = new FreeAIHub()
export default freeAIHub

