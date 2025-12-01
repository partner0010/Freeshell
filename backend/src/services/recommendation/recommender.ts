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
   * 사용자 맞춤 추천 생성 (강화 버전)
   */
  async getRecommendations(
    userId?: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    logger.info('콘텐츠 추천 생성 시작:', { userId, limit })

    // 캐시 확인 (성능 최적화)
    if (userId) {
      const cacheKey = createCacheKey('recommendation', userId, limit)
      const cached = await getCache<Recommendation[]>(cacheKey)
      if (cached) {
        logger.info('추천 데이터 캐시에서 조회')
        return cached
      }
    }

    const prisma = getPrismaClient()

    // 병렬 처리로 속도 향상 (최대 3배 빠름)
    const { performanceOptimizer } = await import('../performance/performanceOptimizer')
    
    const [preferences, behaviorAnalysis, performancePatterns, trends, optimalUploadTimes] = 
      await performanceOptimizer.parallelExecute([
        () => userId ? this.analyzeUserPreferences(userId) : Promise.resolve(this.getDefaultPreferences()),
        () => userId ? this.analyzeUserBehavior(userId) : Promise.resolve(null),
        () => userId ? this.learnPerformancePatterns(userId) : Promise.resolve(null),
        () => this.collectTrends(),
        () => userId ? this.getOptimalUploadTimes(userId) : Promise.resolve(null)
      ], 5)

    // 추천 생성 (강화)
    const recommendations = await this.generateRecommendations(
      preferences,
      trends,
      limit,
      behaviorAnalysis,
      performancePatterns,
      optimalUploadTimes
    )

    // 캐시 저장 (30분 - 더 자주 업데이트)
    if (userId) {
      const cacheKey = createCacheKey('recommendation', userId, limit)
      await setCache(cacheKey, recommendations, 1800)
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
   * 추천 생성 (강화 버전)
   */
  private async generateRecommendations(
    preferences: UserPreferences,
    trends: string[],
    limit: number,
    behaviorAnalysis?: any,
    performancePatterns?: any,
    optimalUploadTimes?: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 선호 콘텐츠 유형 기반 추천
    for (const contentType of preferences.preferredContentTypes) {
      // 트렌드 키워드와 결합
      for (const trend of trends.slice(0, 3)) {
        const topic = this.generateTopic(contentType, trend, preferences.preferredTopics)
        const score = this.calculateScore(
          contentType,
          topic,
          preferences,
          trends,
          behaviorAnalysis,
          performancePatterns
        )
        
        // 최적 업로드 시간 정보 추가
        const optimalTime = optimalUploadTimes?.[contentType] || null
        
        recommendations.push({
          contentType,
          topic,
          reason: this.generateReason(contentType, trend, behaviorAnalysis, performancePatterns, optimalTime),
          score,
          estimatedViews: this.estimateViews(contentType, score, performancePatterns),
          estimatedRevenue: this.estimateRevenue(contentType, score, preferences.averageVideoLength, performancePatterns)
        })
      }
    }

    // 점수순 정렬 및 상위 N개 반환
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * 추천 이유 생성 (강화)
   */
  private generateReason(
    contentType: ContentType,
    trend: string,
    behaviorAnalysis?: any,
    performancePatterns?: any,
    optimalTime?: any
  ): string {
    const reasons: string[] = []
    
    reasons.push(`당신이 선호하는 "${contentType}" 유형과 트렌드 "${trend}"를 결합한 주제입니다`)
    
    if (behaviorAnalysis?.highEngagementTopics?.length > 0) {
      reasons.push(`이전에 높은 참여도를 보인 주제와 유사합니다`)
    }
    
    if (performancePatterns?.bestPerformingType === contentType) {
      reasons.push(`이 유형의 콘텐츠가 평균보다 ${Math.round(performancePatterns.performanceBoost * 100)}% 더 좋은 성과를 보였습니다`)
    }
    
    if (optimalTime) {
      reasons.push(`최적 업로드 시간: ${optimalTime}`)
    }
    
    return reasons.join('. ')
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
   * 점수 계산 (강화 버전)
   */
  private calculateScore(
    contentType: ContentType,
    topic: string,
    preferences: UserPreferences,
    trends: string[],
    behaviorAnalysis?: any,
    performancePatterns?: any
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

    // 행동 분석 점수 (새로 추가)
    if (behaviorAnalysis) {
      // 높은 참여도 주제와 유사하면 점수 추가
      if (behaviorAnalysis.highEngagementTopics?.some((t: string) => 
        topic.toLowerCase().includes(t.toLowerCase())
      )) {
        score += 15
      }
      
      // 선호하는 시간대면 점수 추가
      if (behaviorAnalysis.preferredTimeSlots?.length > 0) {
        score += 5
      }
    }

    // 성과 패턴 점수 (새로 추가)
    if (performancePatterns) {
      // 최고 성과 콘텐츠 유형과 일치하면 점수 추가
      if (performancePatterns.bestPerformingType === contentType) {
        score += 20
      }
      
      // 성과 부스트 적용
      score = Math.round(score * (1 + performancePatterns.performanceBoost * 0.1))
    }

    return Math.min(100, score)
  }

  /**
   * 예상 조회수 추정 (강화 버전)
   */
  private estimateViews(contentType: ContentType, score: number, performancePatterns?: any): number {
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
    let estimated = Math.round(base * (score / 100))
    
    // 성과 패턴 기반 조정
    if (performancePatterns?.averageViews) {
      // 사용자의 평균 조회수와 비교하여 조정
      const multiplier = performancePatterns.averageViews / base
      estimated = Math.round(estimated * multiplier)
    }
    
    return estimated
  }

  /**
   * 예상 수익 추정 (강화 버전)
   */
  private estimateRevenue(
    contentType: ContentType,
    score: number,
    videoLength: number,
    performancePatterns?: any
  ): number {
    // CPM (Cost Per Mille) 기준: $1-5 per 1000 views
    const cpm = 2 // 평균 $2
    const views = this.estimateViews(contentType, score, performancePatterns)
    
    // 비디오 길이에 따른 수익 조정 (10분 이상이면 더 높음)
    const lengthMultiplier = videoLength >= 600 ? 1.5 : 1.0
    
    let revenue = Math.round((views / 1000) * cpm * lengthMultiplier)
    
    // 성과 패턴 기반 조정
    if (performancePatterns?.averageRevenue) {
      const multiplier = performancePatterns.averageRevenue / (revenue || 1)
      revenue = Math.round(revenue * multiplier)
    }
    
    return revenue
  }

  /**
   * 사용자 행동 분석 (새로 추가)
   */
  private async analyzeUserBehavior(userId: string): Promise<any> {
    const prisma = getPrismaClient()
    
    // 최근 콘텐츠의 성과 분석
    const contents = await prisma.content.findMany({
      where: { userId },
      include: {
        uploads: {
          include: {
            content: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // 높은 참여도를 보인 주제 추출
    const highEngagementTopics: string[] = []
    const engagementScores: number[] = []
    
    contents.forEach(content => {
      if (content.uploads.length > 0) {
        const upload = content.uploads[0]
        const engagement = (upload.views || 0) + (upload.likes || 0) * 10
        
        if (engagement > 1000) { // 임계값
          highEngagementTopics.push(content.topic)
        }
        engagementScores.push(engagement)
      }
    })

    // 선호하는 시간대 분석 (업로드 시간 기준)
    const uploadTimes = contents
      .filter(c => c.uploads.length > 0)
      .map(c => new Date(c.createdAt).getHours())
    
    const timeSlotCounts = new Map<number, number>()
    uploadTimes.forEach(hour => {
      timeSlotCounts.set(hour, (timeSlotCounts.get(hour) || 0) + 1)
    })
    
    const preferredTimeSlots = Array.from(timeSlotCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour)

    return {
      highEngagementTopics: [...new Set(highEngagementTopics)],
      averageEngagement: engagementScores.length > 0
        ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length
        : 0,
      preferredTimeSlots
    }
  }

  /**
   * 성과 패턴 학습 (새로 추가)
   */
  private async learnPerformancePatterns(userId: string): Promise<any> {
    const prisma = getPrismaClient()
    
    // 사용자의 모든 콘텐츠와 성과 조회
    const contents = await prisma.content.findMany({
      where: { userId },
      include: {
        uploads: true,
        versions: true
      }
    })

    // 콘텐츠 유형별 성과 분석
    const typePerformance = new Map<ContentType, { views: number; count: number }>()
    
    contents.forEach(content => {
      const type = content.contentType as ContentType
      const views = content.uploads.reduce((sum, u) => sum + (u.views || 0), 0)
      
      const current = typePerformance.get(type) || { views: 0, count: 0 }
      typePerformance.set(type, {
        views: current.views + views,
        count: current.count + 1
      })
    })

    // 최고 성과 콘텐츠 유형 찾기
    let bestPerformingType: ContentType | null = null
    let bestAverageViews = 0
    
    typePerformance.forEach((stats, type) => {
      const averageViews = stats.views / stats.count
      if (averageViews > bestAverageViews) {
        bestAverageViews = averageViews
        bestPerformingType = type
      }
    })

    // 전체 평균 대비 성과 부스트 계산
    const allViews = contents.reduce((sum, c) => 
      sum + c.uploads.reduce((s, u) => s + (u.views || 0), 0), 0
    )
    const averageViews = contents.length > 0 ? allViews / contents.length : 0
    
    const performanceBoost = bestAverageViews > 0 && averageViews > 0
      ? (bestAverageViews - averageViews) / averageViews
      : 0

    return {
      bestPerformingType,
      averageViews,
      performanceBoost: Math.max(0, performanceBoost),
      typePerformance: Object.fromEntries(typePerformance)
    }
  }

  /**
   * 최적 업로드 시간 추천 (새로 추가)
   */
  private async getOptimalUploadTimes(userId: string): Promise<Record<string, string> | null> {
    const prisma = getPrismaClient()
    
    // 사용자의 콘텐츠와 업로드 시간 분석
    const contents = await prisma.content.findMany({
      where: { userId },
      include: {
        uploads: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // 콘텐츠 유형별 최적 업로드 시간 분석
    const typeUploadTimes = new Map<ContentType, number[]>()
    
    contents.forEach(content => {
      if (content.uploads.length > 0) {
        const type = content.contentType as ContentType
        const uploadTime = new Date(content.createdAt).getHours()
        
        const times = typeUploadTimes.get(type) || []
        times.push(uploadTime)
        typeUploadTimes.set(type, times)
      }
    })

    // 각 유형별 최빈 업로드 시간 계산
    const optimalTimes: Record<string, string> = {}
    
    typeUploadTimes.forEach((times, type) => {
      if (times.length > 0) {
        // 최빈 시간 계산
        const hourCounts = new Map<number, number>()
        times.forEach(hour => {
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
        })
        
        const mostFrequentHour = Array.from(hourCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0]
        
        if (mostFrequentHour !== undefined) {
          optimalTimes[type] = `${mostFrequentHour}:00`
        }
      }
    })

    return Object.keys(optimalTimes).length > 0 ? optimalTimes : null
  }
}

export const recommender = new ContentRecommender()

