import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'

export interface AnalyticsData {
  contentId?: string
  platform: string
  views: number
  likes: number
  comments: number
  shares: number
  revenue: number
  engagement: number
  reach: number
  impressions: number
}

/**
 * 실시간 분석 서비스
 */
export class RealTimeAnalytics {
  /**
   * 분석 데이터 저장
   */
  async recordAnalytics(data: AnalyticsData): Promise<void> {
    const prisma = getPrismaClient()

    await prisma.analytics.create({
      data: {
        contentId: data.contentId,
        platform: data.platform,
        views: data.views,
        likes: data.likes,
        comments: data.comments,
        shares: data.shares,
        revenue: data.revenue,
        engagement: data.engagement,
        reach: data.reach,
        impressions: data.impressions
      }
    })
  }

  /**
   * 콘텐츠별 통계 조회
   */
  async getContentStats(contentId: string, days: number = 30) {
    const prisma = getPrismaClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const stats = await prisma.analytics.findMany({
      where: {
        contentId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    })

    return this.aggregateStats(stats)
  }

  /**
   * 플랫폼별 통계 조회
   */
  async getPlatformStats(platform: string, days: number = 30) {
    const prisma = getPrismaClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const stats = await prisma.analytics.findMany({
      where: {
        platform,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    })

    return this.aggregateStats(stats)
  }

  /**
   * 사용자별 전체 통계
   */
  async getUserStats(userId: string, days: number = 30) {
    const prisma = getPrismaClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 사용자의 콘텐츠 ID 조회
    const contents = await prisma.content.findMany({
      where: { userId },
      select: { id: true }
    })

    const contentIds = contents.map(c => c.id)

    const stats = await prisma.analytics.findMany({
      where: {
        contentId: { in: contentIds },
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    })

    return this.aggregateStats(stats)
  }

  /**
   * 통계 집계
   */
  private aggregateStats(stats: any[]) {
    if (stats.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalRevenue: 0,
        avgEngagement: 0,
        totalReach: 0,
        totalImpressions: 0,
        dailyStats: []
      }
    }

    const totalViews = stats.reduce((sum, s) => sum + s.views, 0)
    const totalLikes = stats.reduce((sum, s) => sum + s.likes, 0)
    const totalComments = stats.reduce((sum, s) => sum + s.comments, 0)
    const totalShares = stats.reduce((sum, s) => sum + s.shares, 0)
    const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0)
    const totalReach = stats.reduce((sum, s) => sum + s.reach, 0)
    const totalImpressions = stats.reduce((sum, s) => sum + s.impressions, 0)
    const avgEngagement = stats.reduce((sum, s) => sum + s.engagement, 0) / stats.length

    // 일별 통계
    const dailyStats = this.groupByDate(stats)

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalRevenue,
      avgEngagement,
      totalReach,
      totalImpressions,
      dailyStats
    }
  }

  /**
   * 날짜별 그룹화
   */
  private groupByDate(stats: any[]) {
    const grouped: Record<string, any> = {}

    for (const stat of stats) {
      const date = stat.date.toISOString().split('T')[0]
      if (!grouped[date]) {
        grouped[date] = {
          date,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          revenue: 0
        }
      }

      grouped[date].views += stat.views
      grouped[date].likes += stat.likes
      grouped[date].comments += stat.comments
      grouped[date].shares += stat.shares
      grouped[date].revenue += stat.revenue
    }

    return Object.values(grouped).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    )
  }

  /**
   * 예측 분석 (간단한 선형 예측)
   */
  async predictFutureStats(contentId: string, days: number = 7) {
    const stats = await this.getContentStats(contentId, 30)
    
    if (stats.dailyStats.length < 2) {
      return null
    }

    // 간단한 선형 예측
    const recent = stats.dailyStats.slice(-7)
    const avgDailyViews = recent.reduce((sum: number, s: any) => sum + s.views, 0) / recent.length
    const avgDailyLikes = recent.reduce((sum: number, s: any) => sum + s.likes, 0) / recent.length

    const predictions = []
    for (let i = 1; i <= days; i++) {
      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedViews: Math.round(avgDailyViews * i),
        predictedLikes: Math.round(avgDailyLikes * i)
      })
    }

    return predictions
  }

  /**
   * 성과 최적화 제안
   */
  async getOptimizationSuggestions(contentId: string) {
    const stats = await this.getContentStats(contentId, 30)
    const suggestions: string[] = []

    // 참여율이 낮으면
    if (stats.avgEngagement < 0.05) {
      suggestions.push('참여율이 낮습니다. 썸네일과 제목을 개선해보세요')
    }

    // 조회수는 많지만 좋아요가 적으면
    if (stats.totalViews > 1000 && stats.totalLikes / stats.totalViews < 0.01) {
      suggestions.push('콘텐츠 품질을 개선하여 좋아요를 늘려보세요')
    }

    // 공유가 적으면
    if (stats.totalShares < stats.totalViews * 0.001) {
      suggestions.push('공유를 유도하는 콘텐츠로 변경해보세요')
    }

    return suggestions
  }
}

export const analytics = new RealTimeAnalytics()

