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
   * 성과 최적화 제안 (강화 버전)
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

  /**
   * 실시간 성과 모니터링 (강화 버전)
   */
  async getRealTimeDashboard(userId: string) {
    const prisma = getPrismaClient()
    
    // 최근 24시간 통계
    const last24Hours = new Date()
    last24Hours.setHours(last24Hours.getHours() - 24)
    
    const contents = await prisma.content.findMany({
      where: { userId },
      include: {
        uploads: true,
        versions: true
      }
    })

    const contentIds = contents.map(c => c.id)
    
    const recentStats = await prisma.analytics.findMany({
      where: {
        contentId: { in: contentIds },
        date: { gte: last24Hours }
      },
      orderBy: { date: 'desc' }
    })

    // 실시간 메트릭 계산
    const realTimeMetrics = {
      views: recentStats.reduce((sum, s) => sum + s.views, 0),
      likes: recentStats.reduce((sum, s) => sum + s.likes, 0),
      comments: recentStats.reduce((sum, s) => sum + s.comments, 0),
      shares: recentStats.reduce((sum, s) => sum + s.shares, 0),
      revenue: recentStats.reduce((sum, s) => sum + s.revenue, 0),
      engagement: recentStats.length > 0
        ? recentStats.reduce((sum, s) => sum + s.engagement, 0) / recentStats.length
        : 0
    }

    // 시간대별 통계 (최근 24시간)
    const hourlyStats = this.groupByHour(recentStats)
    
    // 플랫폼별 비교
    const platformComparison = await this.getPlatformComparison(userId)
    
    // 성과 예측
    const predictions = await this.predictPerformance(userId)
    
    // 트렌드 분석
    const trends = await this.analyzeTrends(userId)

    return {
      realTimeMetrics,
      hourlyStats,
      platformComparison,
      predictions,
      trends,
      timestamp: new Date()
    }
  }

  /**
   * 시간대별 그룹화
   */
  private groupByHour(stats: any[]) {
    const grouped: Record<number, any> = {}
    
    for (const stat of stats) {
      const hour = new Date(stat.date).getHours()
      if (!grouped[hour]) {
        grouped[hour] = {
          hour,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0
        }
      }
      
      grouped[hour].views += stat.views
      grouped[hour].likes += stat.likes
      grouped[hour].comments += stat.comments
      grouped[hour].shares += stat.shares
    }
    
    return Object.values(grouped).sort((a: any, b: any) => a.hour - b.hour)
  }

  /**
   * 플랫폼별 비교
   */
  private async getPlatformComparison(userId: string) {
    const prisma = getPrismaClient()
    
    const contents = await prisma.content.findMany({
      where: { userId },
      select: { id: true }
    })

    const contentIds = contents.map(c => c.id)
    
    const stats = await prisma.analytics.findMany({
      where: {
        contentId: { in: contentIds },
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    })

    const platformStats: Record<string, any> = {}
    
    for (const stat of stats) {
      if (!platformStats[stat.platform]) {
        platformStats[stat.platform] = {
          platform: stat.platform,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          revenue: 0,
          engagement: 0,
          count: 0
        }
      }
      
      platformStats[stat.platform].views += stat.views
      platformStats[stat.platform].likes += stat.likes
      platformStats[stat.platform].comments += stat.comments
      platformStats[stat.platform].shares += stat.shares
      platformStats[stat.platform].revenue += stat.revenue
      platformStats[stat.platform].engagement += stat.engagement
      platformStats[stat.platform].count += 1
    }

    // 평균 계산
    Object.values(platformStats).forEach((platform: any) => {
      if (platform.count > 0) {
        platform.avgEngagement = platform.engagement / platform.count
        platform.avgViews = platform.views / platform.count
      }
    })

    return Object.values(platformStats)
  }

  /**
   * 성과 예측 (AI 기반)
   */
  private async predictPerformance(userId: string) {
    const prisma = getPrismaClient()
    
    const contents = await prisma.content.findMany({
      where: { userId },
      include: {
        uploads: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // 최근 콘텐츠의 성과 분석
    const recentPerformance = contents.map(content => ({
      contentId: content.id,
      views: content.uploads.reduce((sum, u) => sum + (u.views || 0), 0),
      likes: content.uploads.reduce((sum, u) => sum + (u.likes || 0), 0),
      createdAt: content.createdAt
    }))

    // 성장률 계산
    const growthRate = this.calculateGrowthRate(recentPerformance)
    
    // 7일 후 예측
    const avgDailyViews = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, p) => sum + p.views, 0) / recentPerformance.length / 7
      : 0

    return {
      next7Days: {
        predictedViews: Math.round(avgDailyViews * 7 * (1 + growthRate)),
        predictedLikes: Math.round(avgDailyViews * 7 * 0.01 * (1 + growthRate)),
        confidence: recentPerformance.length >= 5 ? 'high' : 'medium'
      },
      next30Days: {
        predictedViews: Math.round(avgDailyViews * 30 * (1 + growthRate)),
        predictedLikes: Math.round(avgDailyViews * 30 * 0.01 * (1 + growthRate)),
        confidence: recentPerformance.length >= 10 ? 'high' : 'medium'
      },
      growthRate: Math.round(growthRate * 100) / 100
    }
  }

  /**
   * 성장률 계산
   */
  private calculateGrowthRate(performance: any[]): number {
    if (performance.length < 2) return 0

    // 최근 3개와 이전 3개 비교
    const recent = performance.slice(0, 3)
    const previous = performance.slice(3, 6)

    if (previous.length === 0) return 0

    const recentAvg = recent.reduce((sum, p) => sum + p.views, 0) / recent.length
    const previousAvg = previous.reduce((sum, p) => sum + p.views, 0) / previous.length

    if (previousAvg === 0) return 0

    return (recentAvg - previousAvg) / previousAvg
  }

  /**
   * 트렌드 분석
   */
  private async analyzeTrends(userId: string) {
    const prisma = getPrismaClient()
    
    const contents = await prisma.content.findMany({
      where: { userId },
      include: {
        uploads: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // 콘텐츠 유형별 성과
    const typePerformance: Record<string, { views: number; count: number }> = {}
    
    contents.forEach(content => {
      const type = content.contentType
      const views = content.uploads.reduce((sum, u) => sum + (u.views || 0), 0)
      
      if (!typePerformance[type]) {
        typePerformance[type] = { views: 0, count: 0 }
      }
      
      typePerformance[type].views += views
      typePerformance[type].count += 1
    })

    // 최고 성과 유형
    let bestType = ''
    let bestAvg = 0
    
    Object.entries(typePerformance).forEach(([type, stats]) => {
      const avg = stats.views / stats.count
      if (avg > bestAvg) {
        bestAvg = avg
        bestType = type
      }
    })

    return {
      bestPerformingType: bestType,
      typePerformance,
      recommendation: bestType
        ? `${bestType} 유형의 콘텐츠가 가장 좋은 성과를 보이고 있습니다`
        : '더 많은 데이터가 필요합니다'
    }
  }
}

export const analytics = new RealTimeAnalytics()

