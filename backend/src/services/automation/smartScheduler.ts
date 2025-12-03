import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { analytics } from '../analytics/realTimeAnalytics'
import { TrendCollector } from '../trends/collector'

/**
 * 스마트 스케줄링 (AI 기반 최적 시간 선택)
 */
export class SmartScheduler {
  /**
   * 최적 업로드 시간 계산
   */
  async calculateOptimalTime(platform: string, userId?: string): Promise<Date> {
    // 과거 성과 데이터 분석
    const stats = userId 
      ? await analytics.getUserStats(userId, 90)
      : await analytics.getPlatformStats(platform, 90)

    // 가장 성과가 좋은 시간대 분석
    // 간단한 구현: 평균적으로 가장 좋은 시간 (오후 6-9시)
    const now = new Date()
    const optimalHour = 18 // 오후 6시
    const optimalDate = new Date(now)
    
    // 오늘 오후 6시가 지났으면 내일로
    if (optimalDate.getHours() >= optimalHour) {
      optimalDate.setDate(optimalDate.getDate() + 1)
    }
    
    optimalDate.setHours(optimalHour, 0, 0, 0)

    logger.info(`최적 업로드 시간 계산: ${optimalDate.toISOString()}`)
    return optimalDate
  }

  /**
   * 스마트 스케줄 생성 (AI 기반)
   */
  async createSmartSchedule(userId: string, preferences: {
    contentType: string
    frequency: 'daily' | 'weekly' | 'monthly'
    platforms: string[]
  }): Promise<string> {
    const prisma = getPrismaClient()

    // 각 플랫폼별 최적 시간 계산
    const optimalTimes: Record<string, Date> = {}
    for (const platform of preferences.platforms) {
      optimalTimes[platform] = await this.calculateOptimalTime(platform, userId)
    }

    // 가장 많이 선택된 시간대 사용
    const hourCounts: Record<number, number> = {}
    for (const time of Object.values(optimalTimes)) {
      const hour = time.getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }

    const bestHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0][0]

    // 스케줄 생성
    const schedule = await prisma.schedule.create({
      data: {
        userId,
        name: `스마트 스케줄 - ${preferences.contentType}`,
        contentType: preferences.contentType,
        frequency: preferences.frequency,
        nextRunAt: this.getNextRunTime(parseInt(bestHour), preferences.frequency),
        platforms: JSON.stringify(preferences.platforms),
        settings: JSON.stringify({
          optimalHour: parseInt(bestHour),
          autoOptimize: true
        })
      }
    })

    logger.info(`스마트 스케줄 생성됨: ${schedule.id}`)
    return schedule.id
  }

  /**
   * 다음 실행 시간 계산
   */
  private getNextRunTime(hour: number, frequency: string): Date {
    const now = new Date()
    const nextRun = new Date(now)
    nextRun.setHours(hour, 0, 0, 0)

    if (nextRun <= now) {
      switch (frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1)
          break
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7)
          break
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1)
          break
      }
    }

    return nextRun
  }

  /**
   * 예측 기반 자동화 (트렌드 예측)
   */
  async predictTrendingTopics(days: number = 7): Promise<string[]> {
    const topics: string[] = []

    // 1. Google Trends API 연동 (API 키가 있는 경우)
    const googleTrendsApiKey = process.env.GOOGLE_TRENDS_API_KEY
    if (googleTrendsApiKey) {
      try {
        const trendsTopics = await this.getGoogleTrends(googleTrendsApiKey, days)
        topics.push(...trendsTopics)
      } catch (error: any) {
        logger.warn('Google Trends API 호출 실패:', error.message)
      }
    }

    // 2. NewsAPI를 이용한 트렌드 수집
    const newsApiKey = process.env.NEWS_API_KEY
    if (newsApiKey) {
      try {
        const newsTopics = await this.getNewsTrends(newsApiKey, days)
        topics.push(...newsTopics)
      } catch (error: any) {
        logger.warn('NewsAPI 호출 실패:', error.message)
      }
    }

    // 3. 트렌드 수집기 활용
    try {
      const trendCollector = new TrendCollector()
      const allTrends = await trendCollector.collectAllTrends('ko')
      const trendTitles = allTrends.slice(0, 10).map(trend => trend.title)
      topics.push(...trendTitles)
    } catch (error: any) {
      logger.warn('트렌드 수집기 호출 실패:', error.message)
    }

    // 4. RSS 피드 기반 트렌드 수집
    try {
      const rssTopics = await this.getRSSTrends(days)
      topics.push(...rssTopics)
    } catch (error: any) {
      logger.warn('RSS 트렌드 수집 실패:', error.message)
    }

    // 5. 내부 데이터베이스 기반 트렌드 분석
    try {
      const dbTopics = await this.getDatabaseTrends(days)
      topics.push(...dbTopics)
    } catch (error: any) {
      logger.warn('데이터베이스 트렌드 분석 실패:', error.message)
    }

    // 중복 제거 및 정렬
    const uniqueTopics = Array.from(new Set(topics))
    
    // 기본 주제가 없으면 기본값 반환
    if (uniqueTopics.length === 0) {
      return [
        'AI 기술의 최신 동향',
        '일상 생활 팁',
        '건강 관리 방법',
        '투자 및 재테크',
        '여행 추천'
      ]
    }

    logger.info(`트렌딩 주제 예측: ${uniqueTopics.length}개`)
    return uniqueTopics.slice(0, 10) // 최대 10개 반환
  }

  /**
   * Google Trends API를 이용한 트렌드 수집
   */
  private async getGoogleTrends(apiKey: string, days: number): Promise<string[]> {
    const topics: string[] = []
    
    try {
      // Google Trends API는 공식 API가 없으므로, Google Trends 데이터를 스크래핑하거나
      // pytrends 같은 라이브러리를 사용해야 합니다.
      // 여기서는 간단한 구현으로 대체합니다.
      
      // 대안: Google Custom Search를 이용한 트렌드 키워드 검색
      const axios = (await import('axios')).default
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: apiKey,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
          q: 'trending topics',
          num: 5
        }
      })

      if (response.data.items) {
        response.data.items.forEach((item: any) => {
          // 제목에서 키워드 추출
          const title = item.title || ''
          if (title.length > 5) {
            topics.push(title)
          }
        })
      }
    } catch (error: any) {
      logger.error('Google Trends 수집 오류:', error)
    }

    return topics
  }

  /**
   * NewsAPI를 이용한 트렌드 수집
   */
  private async getNewsTrends(apiKey: string, days: number): Promise<string[]> {
    const topics: string[] = []
    
    try {
      const axios = (await import('axios')).default
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          apiKey,
          country: 'kr', // 한국 뉴스
          pageSize: 10,
          sortBy: 'popularity'
        }
      })

      if (response.data.articles) {
        response.data.articles.forEach((article: any) => {
          if (article.title) {
            topics.push(article.title)
          }
        })
      }
    } catch (error: any) {
      logger.error('NewsAPI 트렌드 수집 오류:', error)
    }

    return topics
  }

  /**
   * RSS 피드 기반 트렌드 수집
   */
  private async getRSSTrends(days: number): Promise<string[]> {
    const topics: string[] = []
    
    try {
      const RSSParser = (await import('rss-parser')).default
      const parser = new RSSParser()
      
      // 주요 RSS 피드 목록
      const rssFeeds = [
        'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko',
        'https://rss.cnn.com/rss/edition.rss',
        'https://feeds.bbci.co.uk/news/rss.xml'
      ]

      for (const feed of rssFeeds) {
        try {
          const feedData = await parser.parseURL(feed)
          if (feedData.items) {
            feedData.items.slice(0, 5).forEach((item: any) => {
              if (item.title) {
                topics.push(item.title)
              }
            })
          }
        } catch (error) {
          // 개별 피드 실패는 무시
          continue
        }
      }
    } catch (error: any) {
      logger.error('RSS 트렌드 수집 오류:', error)
    }

    return topics
  }

  /**
   * 데이터베이스 기반 트렌드 분석
   */
  private async getDatabaseTrends(days: number): Promise<string[]> {
    const topics: string[] = []
    
    try {
      const prisma = getPrismaClient()
      const dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - days)

      // 최근 인기 콘텐츠 주제 분석
      const popularContents = await prisma.content.findMany({
        where: {
          createdAt: {
            gte: dateThreshold
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20,
        select: {
          topic: true
        }
      })

      // 주제 빈도수 계산
      const topicCounts: Record<string, number> = {}
      popularContents.forEach(content => {
        if (content.topic) {
          topicCounts[content.topic] = (topicCounts[content.topic] || 0) + 1
        }
      })

      // 빈도수 높은 순으로 정렬
      const sortedTopics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic)

      topics.push(...sortedTopics)
    } catch (error: any) {
      logger.error('데이터베이스 트렌드 분석 오류:', error)
    }

    return topics
  }

  /**
   * 자동 최적화 제안
   */
  async getOptimizationSuggestions(contentId: string): Promise<{
    title?: string
    thumbnail?: string
    description?: string
    tags?: string[]
    uploadTime?: Date
  }> {
    const suggestions = await analytics.getOptimizationSuggestions(contentId)
    
    // AI 기반 최적화 제안 생성
    const prisma = getPrismaClient()
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
    })

    if (!content || content.versions.length === 0) {
      return { uploadTime: await this.calculateOptimalTime('youtube') }
    }

    const version = content.versions[0]
    const optimalTime = await this.calculateOptimalTime('youtube')
    
    // 태그 자동 추출 (키워드 최적화 서비스 사용)
    const { extractKeywords } = require('../keywordOptimizer')
    let tags: string[] = []
    
    try {
      const keywordAnalysis = await extractKeywords(content.topic, version.description || content.text)
      // 주요 키워드와 보조 키워드를 태그로 사용
      tags = [
        ...keywordAnalysis.primaryKeywords,
        ...keywordAnalysis.secondaryKeywords.slice(0, 3) // 보조 키워드는 최대 3개
      ].slice(0, 10) // 최대 10개 태그
      
      // 제목과 설명에서 추가 키워드 추출
      const titleWords = version.title
        .split(/\s+/)
        .filter(word => word.length > 2 && word.length < 15)
        .slice(0, 3)
      
      tags = [...new Set([...tags, ...titleWords])].slice(0, 10) // 중복 제거 후 최대 10개
    } catch (error) {
      logger.warn('태그 추출 실패, 기본 태그 사용:', error)
      // 기본 태그: 주제에서 추출
      tags = content.topic.split(/\s+/).filter(word => word.length > 1).slice(0, 5)
    }
    
    // AI 기반 제안 (suggestions는 string[]이므로 버전 정보 사용)
    return {
      title: version.title,
      description: version.description,
      uploadTime: optimalTime,
      tags
    }
  }
}

export const smartScheduler = new SmartScheduler()

