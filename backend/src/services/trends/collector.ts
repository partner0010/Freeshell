import axios from 'axios'
import { logger } from '../../utils/logger'
import { getCache, setCache, getTrendCacheKey } from '../../utils/cache'

export interface TrendData {
  source: string
  title: string
  content: string
  category: string
  keywords: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  popularity: number
  timestamp: Date
}

/**
 * 실시간 트렌드 수집 시스템
 * 온라인의 모든 이야기를 수집하여 창작에 활용
 */
export class TrendCollector {
  /**
   * 뉴스 트렌드 수집
   */
  async collectNewsTrends(language: string = 'ko'): Promise<TrendData[]> {
    try {
      // 캐시 확인
      const cacheKey = getTrendCacheKey(`news:${language}`)
      const cached = await getCache<TrendData[]>(cacheKey)
      if (cached) {
        logger.info('트렌드 데이터 캐시에서 조회:', cacheKey)
        return cached
      }

      // NewsAPI 또는 다른 뉴스 API 사용
      const apiKey = process.env.NEWS_API_KEY
      if (!apiKey) {
        logger.warn('NEWS_API_KEY가 설정되지 않았습니다')
        return []
      }

      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: language === 'ko' ? 'kr' : 'us',
          apiKey,
          pageSize: 50
        }
      })

      const trends = response.data.articles.map((article: any) => ({
        source: 'news',
        title: article.title,
        content: article.description || article.content || '',
        category: 'news',
        keywords: this.extractKeywords(article.title + ' ' + (article.description || '')),
        sentiment: this.analyzeSentiment(article.title),
        popularity: 0,
        timestamp: new Date(article.publishedAt)
      }))

      // 캐시 저장 (30분)
      await setCache(cacheKey, trends, 1800)
      return trends
    } catch (error) {
      logger.error('뉴스 트렌드 수집 실패:', error)
      return []
    }
  }

  /**
   * 소셜 미디어 트렌드 수집 (Twitter/X, Reddit 등)
   */
  async collectSocialTrends(): Promise<TrendData[]> {
    try {
      // Twitter API 또는 Reddit API 사용
      // 실제 구현은 각 플랫폼의 API 필요
      const trends: TrendData[] = []

      // Reddit 트렌드
      try {
        const redditResponse = await axios.get('https://www.reddit.com/r/all/hot.json', {
          params: { limit: 50 }
        })

        redditResponse.data.data.children.forEach((post: any) => {
          trends.push({
            source: 'reddit',
            title: post.data.title,
            content: post.data.selftext || '',
            category: post.data.subreddit,
            keywords: this.extractKeywords(post.data.title),
            sentiment: this.analyzeSentiment(post.data.title),
            popularity: post.data.score,
            timestamp: new Date(post.data.created_utc * 1000)
          })
        })
      } catch (error) {
        logger.warn('Reddit 트렌드 수집 실패:', error)
      }

      return trends
    } catch (error) {
      logger.error('소셜 미디어 트렌드 수집 실패:', error)
      return []
    }
  }

  /**
   * 블로그/포럼 트렌드 수집
   */
  async collectBlogTrends(): Promise<TrendData[]> {
    try {
      const trends: TrendData[] = []

      // RSS 파서 사용
      const RSSParser = (await import('rss-parser')).default
      const parser = new RSSParser()

      // Medium 트렌드 (RSS 피드)
      try {
        const mediumFeed = await parser.parseURL('https://medium.com/feed/tag/trending')
        if (mediumFeed.items) {
          mediumFeed.items.slice(0, 10).forEach((item: any) => {
            trends.push({
              source: 'medium',
              title: item.title || '',
              content: item.contentSnippet || item.content || '',
              category: 'blog',
              keywords: this.extractKeywords(item.title || ''),
              sentiment: this.analyzeSentiment(item.title || ''),
              popularity: 0,
              timestamp: item.pubDate ? new Date(item.pubDate) : new Date()
            })
          })
        }
      } catch (error) {
        logger.warn('Medium 트렌드 수집 실패:', error)
      }

      // Google News RSS
      try {
        const googleNewsFeed = await parser.parseURL('https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko')
        if (googleNewsFeed.items) {
          googleNewsFeed.items.slice(0, 10).forEach((item: any) => {
            trends.push({
              source: 'google-news',
              title: item.title || '',
              content: item.contentSnippet || item.content || '',
              category: 'news',
              keywords: this.extractKeywords(item.title || ''),
              sentiment: this.analyzeSentiment(item.title || ''),
              popularity: 0,
              timestamp: item.pubDate ? new Date(item.pubDate) : new Date()
            })
          })
        }
      } catch (error) {
        logger.warn('Google News RSS 수집 실패:', error)
      }

      return trends
    } catch (error) {
      logger.error('블로그 트렌드 수집 실패:', error)
      return []
    }
  }

  /**
   * 모든 트렌드 통합 수집
   */
  async collectAllTrends(language: string = 'ko'): Promise<TrendData[]> {
    // 캐시 확인
    const cacheKey = getTrendCacheKey(`all:${language}`)
    const cached = await getCache<TrendData[]>(cacheKey)
    if (cached) {
      logger.info('전체 트렌드 데이터 캐시에서 조회:', cacheKey)
      return cached
    }

    logger.info('🌍 모든 트렌드 수집 시작...')

    const [newsTrends, socialTrends, blogTrends] = await Promise.all([
      this.collectNewsTrends(language),
      this.collectSocialTrends(),
      this.collectBlogTrends()
    ])

    const allTrends = [...newsTrends, ...socialTrends, ...blogTrends]

    // 인기순 정렬
    allTrends.sort((a, b) => b.popularity - a.popularity)

    logger.info(`✅ ${allTrends.length}개의 트렌드 수집 완료`)

    // 캐시 저장 (30분)
    await setCache(cacheKey, allTrends, 1800)

    return allTrends
  }

  /**
   * 키워드 추출
   */
  private extractKeywords(text: string): string[] {
    // 간단한 키워드 추출 (실제로는 NLP 라이브러리 사용)
    const words = text.toLowerCase().split(/\s+/)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10)
  }

  /**
   * 감정 분석
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    // 간단한 감정 분석 (실제로는 고급 NLP 모델 사용)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'love', '좋', '훌륭', '멋', '사랑']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', '나쁜', '끔찍', '싫', '슬', '화']

    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }
}

