/**
 * 사용자 맞춤 콘텐츠 추천 시스템
 * 사용자의 이전 콘텐츠, 조회 기록, 선호도를 기반으로 추천
 */

import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { ContentType } from '../../types'
import { getCache, setCache, createCacheKey } from '../../utils/cache'

export interface Recommendation {
  contentType: ContentType
  topic: string
  reason: string
  score: number
  estimatedViews?: number
  estimatedRevenue?: number
}

export interface UserPreferences {
  preferredContentTypes: ContentType[]
  preferredTopics: string[]
  averageVideoLength: number
  uploadFrequency: number
}

/**
 * 콘텐츠 추천 시스템
 */
export class ContentRecommender {
  /**
   * 사용자 맞춤 추천 생성
   */
  async getRecommendations(
    userId?: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    logger.info('콘텐츠 추천 생성 시작:', { userId, limit })

    // 캐시 확인
    if (userId) {
      const cacheKey = createCacheKey('recommendation', userId, limit)
      const cached = await getCache<Recommendation[]>(cacheKey)
      if (cached) {
        logger.info('추천 데이터 캐시에서 조회')
        return cached
      }
    }

    const prisma = getPrismaClient()

    // 사용자 선호도 분석
    const preferences = userId
      ? await this.analyzeUserPreferences(userId)
      : this.getDefaultPreferences()

    // 트렌드 데이터 수집
    const trends = await this.collectTrends()

    // 추천 생성
    const recommendations = await this.generateRecommendations(
      preferences,
      trends,
      limit
    )

    // 캐시 저장 (1시간)
    if (userId) {
      const cacheKey = createCacheKey('recommendation', userId, limit)
      await setCache(cacheKey, recommendations, 3600)
    }

    return recommendations
  }

  /**
   * 사용자 선호도 분석
   */
  private async analyzeUserPreferences(userId: string): Promise<UserPreferences> {
    const prisma = getPrismaClient()

    // 사용자의 콘텐츠 조회
    const contents = await prisma.content.findMany({
      where: { userId },
      include: {
        versions: true,
        uploads: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // 콘텐츠 유형 분석
    const contentTypeCounts = new Map<ContentType, number>()
    const topics: string[] = []
    let totalDuration = 0
    let contentCount = 0

    contents.forEach(content => {
      // 콘텐츠 유형 카운트
      const count = contentTypeCounts.get(content.contentType as ContentType) || 0
      contentTypeCounts.set(content.contentType as ContentType, count + 1)

      // 토픽 수집
      topics.push(content.topic)

      // 평균 길이 계산
      if (content.versions.length > 0) {
        totalDuration += content.versions[0].duration || 60
        contentCount++
      }
    })

    // 선호 콘텐츠 유형 (상위 5개)
    const preferredContentTypes = Array.from(contentTypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type)

    // 선호 토픽 (상위 10개)
    const topicCounts = new Map<string, number>()
    topics.forEach(topic => {
      const words = topic.split(/\s+/)
      words.forEach(word => {
        if (word.length > 2) {
          topicCounts.set(word, (topicCounts.get(word) || 0) + 1)
        }
      })
    })
    const preferredTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic)

    // 평균 비디오 길이
    const averageVideoLength = contentCount > 0
      ? Math.round(totalDuration / contentCount)
      : 600 // 기본 10분

    // 업로드 빈도 (주당)
    const uploadFrequency = contents.length > 0
      ? Math.round(contents.length / Math.max(1, (Date.now() - contents[contents.length - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7)))
      : 1

    return {
      preferredContentTypes: preferredContentTypes.length > 0
        ? preferredContentTypes
        : this.getDefaultPreferences().preferredContentTypes,
      preferredTopics: preferredTopics.length > 0
        ? preferredTopics
        : this.getDefaultPreferences().preferredTopics,
      averageVideoLength,
      uploadFrequency
    }
  }

  /**
   * 기본 선호도
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      preferredContentTypes: [
        'daily-talk',
        'education',
        'tips',
        'how-to',
        'entertainment'
      ] as ContentType[],
      preferredTopics: [
        'AI', '기술', '생활', '팁', '교육', '엔터테인먼트'
      ],
      averageVideoLength: 600, // 10분
      uploadFrequency: 3 // 주 3회
    }
  }

  /**
   * 트렌드 데이터 수집
   */
  private async collectTrends(): Promise<string[]> {
    try {
      const { TrendCollector } = await import('../trends/collector')
      const collector = new TrendCollector()
      const trends = await collector.collectAllTrends('ko')
      
      // 트렌드 키워드 추출
      const keywords = new Set<string>()
      trends.forEach(trend => {
        trend.keywords.forEach(keyword => {
          if (keyword.length > 2) {
            keywords.add(keyword)
          }
        })
      })
      
      return Array.from(keywords).slice(0, 20)
    } catch (error) {
      logger.warn('트렌드 수집 실패:', error)
      return []
    }
  }

  /**
   * 추천 생성
   */
  private async generateRecommendations(
    preferences: UserPreferences,
    trends: string[],
    limit: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 선호 콘텐츠 유형 기반 추천
    for (const contentType of preferences.preferredContentTypes) {
      // 트렌드 키워드와 결합
      for (const trend of trends.slice(0, 3)) {
        const topic = this.generateTopic(contentType, trend, preferences.preferredTopics)
        const score = this.calculateScore(contentType, topic, preferences, trends)
        
        recommendations.push({
          contentType,
          topic,
          reason: `당신이 선호하는 "${contentType}" 유형과 트렌드 "${trend}"를 결합한 주제입니다`,
          score,
          estimatedViews: this.estimateViews(contentType, score),
          estimatedRevenue: this.estimateRevenue(contentType, score, preferences.averageVideoLength)
        })
      }
    }

    // 점수순 정렬 및 상위 N개 반환
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * 주제 생성
   */
  private generateTopic(
    contentType: ContentType,
    trend: string,
    preferredTopics: string[]
  ): string {
    // 선호 토픽과 트렌드 결합
    const preferredTopic = preferredTopics[Math.floor(Math.random() * preferredTopics.length)] || 'AI'
    return `${preferredTopic} ${trend} ${this.getContentTypeKeyword(contentType)}`
  }

  /**
   * 콘텐츠 유형별 키워드
   */
  private getContentTypeKeyword(contentType: ContentType): string {
    const keywords: Record<string, string> = {
      'daily-talk': '이야기',
      'education': '강의',
      'tips': '팁',
      'how-to': '가이드',
      'entertainment': '재미있는',
      'tutorial': '튜토리얼',
      'storytelling': '스토리'
    }
    return keywords[contentType] || '콘텐츠'
  }

  /**
   * 점수 계산
   */
  private calculateScore(
    contentType: ContentType,
    topic: string,
    preferences: UserPreferences,
    trends: string[]
  ): number {
    let score = 50 // 기본 점수

    // 선호도 점수
    if (preferences.preferredContentTypes.includes(contentType)) {
      score += 30
    }

    // 트렌드 점수
    const trendWords = topic.split(/\s+/)
    const trendMatches = trendWords.filter(word => trends.includes(word)).length
    score += trendMatches * 10

    // 토픽 길이 점수
    if (topic.length >= 10 && topic.length <= 50) {
      score += 10
    }

    return Math.min(100, score)
  }

  /**
   * 예상 조회수 추정
   */
  private estimateViews(contentType: ContentType, score: number): number {
    const baseViews: Record<string, number> = {
      'daily-talk': 10000,
      'education': 5000,
      'tips': 8000,
      'how-to': 12000,
      'entertainment': 15000,
      'tutorial': 7000,
      'storytelling': 9000
    }

    const base = baseViews[contentType] || 5000
    return Math.round(base * (score / 100))
  }

  /**
   * 예상 수익 추정
   */
  private estimateRevenue(
    contentType: ContentType,
    score: number,
    videoLength: number
  ): number {
    // CPM (Cost Per Mille) 기준: $1-5 per 1000 views
    const cpm = 2 // 평균 $2
    const views = this.estimateViews(contentType, score)
    
    // 비디오 길이에 따른 수익 조정 (10분 이상이면 더 높음)
    const lengthMultiplier = videoLength >= 600 ? 1.5 : 1.0
    
    return Math.round((views / 1000) * cpm * lengthMultiplier)
  }
}

export const recommender = new ContentRecommender()

