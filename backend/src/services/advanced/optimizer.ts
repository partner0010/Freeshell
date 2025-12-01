import { logger } from '../../utils/logger'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

/**
 * 고급 콘텐츠 최적화 시스템
 * SEO, 가독성, 감정, 전환율 등을 종합 최적화
 */
export class ContentOptimizer {
  /**
   * SEO 최적화
   */
  async optimizeSEO(content: string, keywords: string[]): Promise<string> {
    try {
      if (!openai) {
        return content
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 SEO 전문가입니다. 콘텐츠를 검색 엔진에 최적화하면서도 자연스럽고 읽기 쉽게 만들어주세요.'
          },
          {
            role: 'user',
            content: `다음 콘텐츠를 SEO 최적화해주세요. 키워드: ${keywords.join(', ')}\n\n${content}`
          }
        ],
        temperature: 0.7
      })

      return response.choices[0].message.content || content
    } catch (error) {
      logger.error('SEO 최적화 실패:', error)
      return content
    }
  }

  /**
   * 가독성 최적화
   */
  async optimizeReadability(content: string, targetLevel: 'easy' | 'medium' | 'advanced' = 'medium'): Promise<string> {
    try {
      if (!openai) {
        return content
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 가독성 전문가입니다. 콘텐츠를 더 읽기 쉽고 이해하기 쉽게 만들어주세요.'
          },
          {
            role: 'user',
            content: `다음 콘텐츠를 ${targetLevel} 수준으로 가독성을 최적화해주세요:\n\n${content}`
          }
        ],
        temperature: 0.7
      })

      return response.choices[0].message.content || content
    } catch (error) {
      logger.error('가독성 최적화 실패:', error)
      return content
    }
  }

  /**
   * 감정 최적화
   */
  async optimizeEmotion(content: string, targetEmotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'neutral'): Promise<string> {
    try {
      if (!openai) {
        return content
      }

      const emotionMap = {
        joy: '기쁨과 행복',
        sadness: '슬픔과 공감',
        anger: '분노와 열정',
        fear: '긴장과 흥미',
        surprise: '놀라움과 호기심',
        neutral: '균형잡힌 감정'
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 감정 전문가입니다. 콘텐츠가 독자의 감정을 효과적으로 자극하도록 최적화해주세요.'
          },
          {
            role: 'user',
            content: `다음 콘텐츠를 ${emotionMap[targetEmotion]}을 느끼도록 감정을 최적화해주세요:\n\n${content}`
          }
        ],
        temperature: 0.8
      })

      return response.choices[0].message.content || content
    } catch (error) {
      logger.error('감정 최적화 실패:', error)
      return content
    }
  }

  /**
   * 전환율 최적화 (CTA 최적화)
   */
  async optimizeConversion(content: string, cta: string): Promise<string> {
    try {
      if (!openai) {
        return content
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 마케팅 전문가입니다. 콘텐츠의 전환율을 최대화하도록 최적화해주세요.'
          },
          {
            role: 'user',
            content: `다음 콘텐츠에 "${cta}"라는 행동 유도 문구를 자연스럽게 통합하여 전환율을 최적화해주세요:\n\n${content}`
          }
        ],
        temperature: 0.7
      })

      return response.choices[0].message.content || content
    } catch (error) {
      logger.error('전환율 최적화 실패:', error)
      return content
    }
  }

  /**
   * 종합 최적화
   */
  async optimizeAll(
    content: string,
    options: {
      seo?: { keywords: string[] }
      readability?: { level: 'easy' | 'medium' | 'advanced' }
      emotion?: { target: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'neutral' }
      conversion?: { cta: string }
    }
  ): Promise<string> {
    let optimized = content

    if (options.seo) {
      optimized = await this.optimizeSEO(optimized, options.seo.keywords)
    }

    if (options.readability) {
      optimized = await this.optimizeReadability(optimized, options.readability.level)
    }

    if (options.emotion) {
      optimized = await this.optimizeEmotion(optimized, options.emotion.target)
    }

    if (options.conversion) {
      optimized = await this.optimizeConversion(optimized, options.conversion.cta)
    }

    return optimized
  }
}

