/**
 * 📈 실시간 트렌드 분석기
 * 뉴스, 날씨, Google Trends, 계절, 시간 분석
 */

import axios from 'axios'
import { logger } from '../../utils/logger'

export interface TrendRecommendation {
  topic: string
  score: number
  reason: string
  category: 'news' | 'weather' | 'season' | 'trending' | 'time'
  keywords: string[]
}

export interface DailyRecommendations {
  date: string
  recommendations: TrendRecommendation[]
  weather: any
  news: any[]
  trends: string[]
}

class TrendAnalyzer {
  /**
   * 📰 오늘의 뉴스 가져오기
   */
  async getLatestNews(): Promise<any[]> {
    try {
      // NewsAPI 무료 버전
      const apiKey = process.env.NEWS_API_KEY || 'demo'
      
      if (apiKey === 'demo') {
        // 데모 뉴스 (실제로는 API 사용)
        return [
          { title: '크리스마스 시즌 시작', category: 'entertainment' },
          { title: '겨울 날씨 예보', category: 'weather' },
          { title: 'AI 기술 발전', category: 'technology' }
        ]
      }

      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'kr',
          apiKey,
          pageSize: 10
        }
      })

      return response.data.articles
    } catch (error: any) {
      logger.warn('뉴스 가져오기 실패 (데모 모드):', error.message)
      return []
    }
  }

  /**
   * 🌤️ 날씨 정보
   */
  async getWeather(): Promise<any> {
    try {
      // OpenWeatherMap 무료 API
      const apiKey = process.env.WEATHER_API_KEY || 'demo'
      
      if (apiKey === 'demo') {
        return {
          temp: 5,
          condition: 'Clear',
          season: this.getCurrentSeason()
        }
      }

      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: 'Seoul',
          appid: apiKey,
          units: 'metric'
        }
      })

      return {
        temp: response.data.main.temp,
        condition: response.data.weather[0].main,
        season: this.getCurrentSeason()
      }
    } catch (error: any) {
      logger.warn('날씨 정보 실패 (데모 모드):', error.message)
      return { temp: 10, condition: 'Clear', season: 'winter' }
    }
  }

  /**
   * 📅 현재 계절
   */
  getCurrentSeason(): string {
    const month = new Date().getMonth() + 1
    
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    return 'winter'
  }

  /**
   * 🕐 시간대
   */
  getTimeOfDay(): string {
    const hour = new Date().getHours()
    
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  /**
   * 📈 Google Trends (간단 버전)
   */
  async getTrendingKeywords(): Promise<string[]> {
    // 실제로는 Google Trends API 사용
    // 무료 대안: Serper API, SerpApi
    
    const season = this.getCurrentSeason()
    const month = new Date().getMonth() + 1
    
    // 계절/월별 키워드
    const seasonKeywords: Record<string, string[]> = {
      winter: ['크리스마스', '연말', '스키', '따뜻한', '겨울여행'],
      spring: ['벚꽃', '봄날', '소풍', '새학기', '꽃구경'],
      summer: ['휴가', '바다', '수영', '여름축제', '캠핑'],
      fall: ['단풍', '가을', '독서', '등산', '할로윈']
    }

    return seasonKeywords[season] || []
  }

  /**
   * 🎯 오늘의 추천 생성
   */
  async getDailyRecommendations(): Promise<DailyRecommendations> {
    logger.info('📈 오늘의 추천 분석 시작...')

    const [news, weather, trends] = await Promise.all([
      this.getLatestNews(),
      this.getWeather(),
      this.getTrendingKeywords()
    ])

    const season = this.getCurrentSeason()
    const timeOfDay = this.getTimeOfDay()

    // AI 추천 로직
    const recommendations: TrendRecommendation[] = []

    // 1. 계절 기반 추천
    if (season === 'winter') {
      recommendations.push({
        topic: '크리스마스 분위기 브이로그',
        score: 95,
        reason: '12월 크리스마스 시즌',
        category: 'season',
        keywords: ['크리스마스', '겨울', '연말']
      })
    }

    // 2. 날씨 기반 추천
    if (weather.temp < 10) {
      recommendations.push({
        topic: '추운 날씨 대처법',
        score: 85,
        reason: `현재 기온 ${weather.temp}°C`,
        category: 'weather',
        keywords: ['겨울', '추위', '따뜻한']
      })
    }

    // 3. 뉴스 기반 추천
    news.slice(0, 3).forEach(article => {
      recommendations.push({
        topic: `${article.title} 관련 콘텐츠`,
        score: 80,
        reason: '실시간 뉴스 이슈',
        category: 'news',
        keywords: [article.category]
      })
    })

    // 4. 트렌드 기반 추천
    trends.slice(0, 5).forEach(keyword => {
      recommendations.push({
        topic: `${keyword} 관련 숏폼`,
        score: 75,
        reason: '현재 인기 키워드',
        category: 'trending',
        keywords: [keyword]
      })
    })

    // 5. 시간대 기반 추천
    if (timeOfDay === 'morning') {
      recommendations.push({
        topic: '아침 루틴 브이로그',
        score: 70,
        reason: '오전 시간대 최적',
        category: 'time',
        keywords: ['모닝', '루틴', '아침']
      })
    }

    // 점수순 정렬
    recommendations.sort((a, b) => b.score - a.score)

    logger.info(`✅ 오늘의 추천 ${recommendations.length}개 생성`)

    return {
      date: new Date().toISOString().split('T')[0],
      recommendations: recommendations.slice(0, 10), // 상위 10개
      weather,
      news,
      trends
    }
  }

  /**
   * 🎲 랜덤 추천 (사용자가 영감 필요할 때)
   */
  async getRandomRecommendations(count: number = 5): Promise<TrendRecommendation[]> {
    const categories = ['VLOG', '챌린지', '리뷰', 'How-to', '스토리텔링']
    const styles = ['감성적', '유머러스', '정보성', '드라마틱', '미니멀']
    
    const recommendations: TrendRecommendation[] = []

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const style = styles[Math.floor(Math.random() * styles.length)]
      
      recommendations.push({
        topic: `${style} ${category} 콘텐츠`,
        score: Math.floor(Math.random() * 30) + 70,
        reason: 'AI 랜덤 추천',
        category: 'trending',
        keywords: [category, style]
      })
    }

    return recommendations
  }
}

// 싱글톤
export const trendAnalyzer = new TrendAnalyzer()
export default trendAnalyzer

