import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { analytics } from '../analytics/realTimeAnalytics'

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
    // TODO: 트렌드 수집기와 연동
    // 현재는 기본 주제 반환
    const topics = [
      'AI 기술의 최신 동향',
      '일상 생활 팁',
      '건강 관리 방법',
      '투자 및 재테크',
      '여행 추천'
    ]

    logger.info(`트렌딩 주제 예측: ${topics.length}개`)
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
    
    // AI 기반 제안 (간단한 구현)
    return {
      title: suggestions.length > 0 && suggestions[0].title 
        ? suggestions[0].title 
        : version.title,
      description: suggestions.length > 0 && suggestions[0].description
        ? suggestions[0].description
        : version.description,
      uploadTime: optimalTime,
      tags: suggestions.length > 0 && suggestions[0].tags
        ? suggestions[0].tags
        : []
    }
  }
}

export const smartScheduler = new SmartScheduler()

