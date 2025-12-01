import { logger } from '../../utils/logger'
import { CreativityEnhancer } from '../creativity/enhancer'
import { TrendCollector } from '../trends/collector'

/**
 * 다양한 장르 및 스타일 관리
 * 모든 분야에서 다양한 사람들이 즐길 수 있는 콘텐츠 생성
 */
export class GenreManager {
  private creativityEnhancer: CreativityEnhancer
  private trendCollector: TrendCollector

  constructor() {
    this.creativityEnhancer = new CreativityEnhancer()
    this.trendCollector = new TrendCollector()
  }

  /**
   * 지원하는 모든 장르 목록
   */
  getAvailableGenres(): string[] {
    return [
      'drama', 'comedy', 'thriller', 'romance', 'fantasy',
      'sciFi', 'mystery', 'horror', 'sliceOfLife', 'adventure',
      'action', 'historical', 'biographical', 'educational',
      'motivational', 'philosophical', 'poetic', 'experimental'
    ]
  }

  /**
   * 지원하는 모든 스타일 목록
   */
  getAvailableStyles(): string[] {
    return [
      'engaging', 'emotional', 'informative', 'entertaining',
      'inspiring', 'thoughtful', 'humorous', 'dramatic',
      'poetic', 'conversational', 'professional', 'casual'
    ]
  }

  /**
   * 지원하는 모든 대상 독자 목록
   */
  getAvailableAudiences(): string[] {
    return [
      'universal', 'young', 'professional', 'creative',
      'academic', 'general', 'enthusiasts', 'beginners',
      'experts', 'families', 'students', 'seniors'
    ]
  }

  /**
   * 장르별 콘텐츠 생성
   */
  async generateGenreContent(
    topic: string,
    genre: string,
    style: string = 'engaging',
    audience: string = 'universal'
  ): Promise<string> {
    try {
      // 트렌드 수집
      const trends = await this.trendCollector.collectAllTrends('ko')

      // 장르별 프롬프트 생성
      const prompt = this.creativityEnhancer.generateGenrePrompt(topic, genre, trends)

      // 실제 AI 생성은 contentGenerator에서 처리
      return prompt
    } catch (error) {
      logger.error('장르별 콘텐츠 생성 실패:', error)
      throw error
    }
  }

  /**
   * 문화별 콘텐츠 생성
   */
  async generateCulturalContent(
    topic: string,
    cultures: string[]
  ): Promise<string> {
    try {
      const trends = await this.trendCollector.collectAllTrends('ko')
      const prompt = this.creativityEnhancer.generateCulturalPrompt(topic, cultures, trends)
      return prompt
    } catch (error) {
      logger.error('문화별 콘텐츠 생성 실패:', error)
      throw error
    }
  }

  /**
   * 다국어 및 다문화 콘텐츠 생성
   */
  async generateMulticulturalContent(
    topic: string,
    languages: string[],
    cultures: string[]
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {}

    for (const language of languages) {
      try {
        const trends = await this.trendCollector.collectAllTrends(language)
        const prompt = this.creativityEnhancer.generateCulturalPrompt(topic, cultures, trends)
        results[language] = prompt
      } catch (error) {
        logger.error(`${language} 콘텐츠 생성 실패:`, error)
      }
    }

    return results
  }
}

