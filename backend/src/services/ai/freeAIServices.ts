/**
 * 무료 AI 서비스들
 * API 키 없이 사용 가능한 AI 서비스 통합
 */

import { logger } from '../../utils/logger'

/**
 * HuggingFace Inference API (무료!)
 */
export class HuggingFaceAI {
  private apiUrl = 'https://api-inference.huggingface.co/models'
  
  async generateText(prompt: string, model: string = 'mistralai/Mistral-7B-Instruct-v0.2'): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
          },
        }),
      })

      const data = await response.json()
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text
      }
      
      return data.generated_text || JSON.stringify(data)
    } catch (error: any) {
      logger.error('HuggingFace AI 오류:', error)
      throw new Error(`HuggingFace 오류: ${error.message}`)
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/stabilityai/stable-diffusion-2-1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
        }),
      })

      const blob = await response.blob()
      const buffer = await blob.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      
      return `data:image/png;base64,${base64}`
    } catch (error: any) {
      logger.error('HuggingFace 이미지 생성 오류:', error)
      throw new Error(`이미지 생성 오류: ${error.message}`)
    }
  }
}

/**
 * Together AI (무료 티어)
 */
export class TogetherAI {
  private apiUrl = 'https://api.together.xyz/inference'
  
  async chat(message: string): Promise<string> {
    try {
      // Together AI는 무료 모델 제공
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          prompt: message,
          max_tokens: 512,
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      return data.output?.choices?.[0]?.text || '응답을 생성할 수 없습니다'
    } catch (error: any) {
      logger.error('Together AI 오류:', error)
      throw new Error(`Together AI 오류: ${error.message}`)
    }
  }
}

/**
 * Cohere API (무료 티어)
 */
export class CohereAI {
  async generate(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer TRIAL', // Trial 키
        },
        body: JSON.stringify({
          model: 'command',
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      return data.generations?.[0]?.text || '응답을 생성할 수 없습니다'
    } catch (error: any) {
      logger.error('Cohere AI 오류:', error)
      throw new Error(`Cohere 오류: ${error.message}`)
    }
  }
}

/**
 * 로컬 패턴 기반 응답 (완전 무료!)
 */
export class LocalAI {
  private patterns = new Map<RegExp, string[]>([
    [/안녕|hello|hi/i, [
      '안녕하세요! 무엇을 도와드릴까요?',
      '반갑습니다! Shell이 도와드리겠습니다.',
    ]],
    [/웹툰|만화/i, [
      '웹툰 생성 기능을 준비 중입니다. 스토리를 알려주시면 장면 구성을 도와드리겠습니다.',
    ]],
    [/드라마|시나리오/i, [
      '드라마 시나리오 작성을 도와드리겠습니다. 어떤 장르를 원하시나요?',
    ]],
    [/영화|스토리보드/i, [
      '영화 스토리보드를 만들어드리겠습니다. 기본 플롯을 알려주세요.',
    ]],
    [/이미지|그림/i, [
      '이미지 생성 기능이 곧 준비됩니다. 어떤 이미지를 원하시나요?',
    ]],
    [/도움|help/i, [
      'Shell AI는 텍스트, 이미지, 음성, 영상, 웹툰, 드라마, 영화 등 모든 창작물을 생성할 수 있습니다.\n\n무엇을 도와드릴까요?',
    ]],
  ])

  async respond(message: string): Promise<string> {
    for (const [pattern, responses] of this.patterns) {
      if (pattern.test(message)) {
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }

    return `"${message}"에 대해 답변드립니다.\n\nShell AI가 분석하고 있습니다. 좀 더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.\n\n예시:\n- "웹툰 스토리 만들어줘"\n- "드라마 시나리오 써줘"\n- "블로그 글 작성해줘"`
  }
}

export const huggingFaceAI = new HuggingFaceAI()
export const togetherAI = new TogetherAI()
export const cohereAI = new CohereAI()
export const localAI = new LocalAI()

