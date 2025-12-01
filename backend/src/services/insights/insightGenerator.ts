import OpenAI from 'openai'
import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { analytics } from '../analytics/realTimeAnalytics'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

export interface ContentInsight {
  contentId: string
  title: string
  performance: {
    views: number
    likes: number
    comments: number
    shares: number
    engagementRate: number
    ctr: number // Click-through rate
    retentionRate?: number
  }
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  predictedPerformance?: {
    next7Days: {
      views: number
      likes: number
    }
    next30Days: {
      views: number
      likes: number
    }
  }
  competitorAnalysis?: {
    avgViews: number
    avgLikes: number
    position: 'above' | 'average' | 'below'
  }
}

/**
 * AI 기반 인사이트 생성
 */
export async function generateContentInsights(
  contentId: string
): Promise<ContentInsight | null> {
  logger.info('인사이트 생성 시작:', contentId)

  const prisma = getPrismaClient()

  try {
    // 콘텐츠 정보 조회
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        uploads: {
          where: { status: 'completed' }
        }
      }
    })

    if (!content) {
      logger.warn('콘텐츠를 찾을 수 없습니다:', contentId)
      return null
    }

    // 통계 데이터 조회
    const stats = await analytics.getContentStats(contentId, 30)
    const suggestions = await analytics.getOptimizationSuggestions(contentId)
    const predictions = await analytics.predictFutureStats(contentId, 7)

    // 성능 지표 계산
    const engagementRate = stats.totalViews > 0
      ? (stats.totalLikes + stats.totalComments + stats.totalShares) / stats.totalViews
      : 0

    const ctr = stats.totalImpressions > 0
      ? stats.totalViews / stats.totalImpressions
      : 0

    // AI 기반 분석 (있는 경우)
    let aiAnalysis: {
      strengths: string[]
      weaknesses: string[]
      recommendations: string[]
    } | null = null

    if (openai && stats.totalViews > 0) {
      try {
        aiAnalysis = await analyzeWithAI(content, stats)
      } catch (error) {
        logger.warn('AI 분석 실패, 기본 분석 사용:', error)
      }
    }

    // 기본 분석
    const defaultAnalysis = {
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: suggestions
    }

    // 강점 분석
    if (engagementRate > 0.1) {
      defaultAnalysis.strengths.push('높은 참여율')
    }
    if (stats.totalLikes / stats.totalViews > 0.05) {
      defaultAnalysis.strengths.push('좋아요 비율이 높음')
    }
    if (stats.totalShares > stats.totalViews * 0.01) {
      defaultAnalysis.strengths.push('공유율이 높음')
    }

    // 약점 분석
    if (engagementRate < 0.05) {
      defaultAnalysis.weaknesses.push('참여율이 낮음')
    }
    if (ctr < 0.02) {
      defaultAnalysis.weaknesses.push('클릭률이 낮음 (썸네일/제목 개선 필요)')
    }
    if (stats.totalComments < stats.totalViews * 0.001) {
      defaultAnalysis.weaknesses.push('댓글이 적음 (상호작용 유도 필요)')
    }

    const finalAnalysis = aiAnalysis || defaultAnalysis

    // 예측 성능
    const predictedPerformance = predictions ? {
      next7Days: {
        views: predictions.reduce((sum, p) => sum + p.predictedViews, 0),
        likes: predictions.reduce((sum, p) => sum + p.predictedLikes, 0)
      },
      next30Days: {
        views: Math.round(stats.totalViews * 1.2), // 간단한 예측
        likes: Math.round(stats.totalLikes * 1.2)
      }
    } : undefined

    const insight: ContentInsight = {
      contentId,
      title: content.title,
      performance: {
        views: stats.totalViews,
        likes: stats.totalLikes,
        comments: stats.totalComments,
        shares: stats.totalShares,
        engagementRate,
        ctr
      },
      strengths: finalAnalysis.strengths,
      weaknesses: finalAnalysis.weaknesses,
      recommendations: finalAnalysis.recommendations,
      predictedPerformance
    }

    logger.info('인사이트 생성 완료:', contentId)
    return insight

  } catch (error) {
    logger.error('인사이트 생성 실패:', error)
    return null
  }
}

/**
 * AI를 사용한 콘텐츠 분석
 */
async function analyzeWithAI(
  content: any,
  stats: any
): Promise<{
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}> {
  if (!openai) {
    throw new Error('OpenAI API를 사용할 수 없습니다')
  }

  const prompt = `다음 YouTube 콘텐츠의 성과를 분석하고 개선 방안을 제시해주세요.

콘텐츠 제목: ${content.title}
콘텐츠 설명: ${content.description}
조회수: ${stats.totalViews}
좋아요: ${stats.totalLikes}
댓글: ${stats.totalComments}
공유: ${stats.totalShares}
참여율: ${(stats.totalLikes + stats.totalComments + stats.totalShares) / stats.totalViews}

다음 JSON 형식으로 응답해주세요:
{
  "strengths": ["강점 1", "강점 2"],
  "weaknesses": ["약점 1", "약점 2"],
  "recommendations": ["개선 제안 1", "개선 제안 2", "개선 제안 3"]
}

강점과 약점은 구체적이고 실행 가능한 내용으로 작성해주세요.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: '당신은 YouTube 콘텐츠 분석 전문가입니다. 데이터를 기반으로 정확하고 실행 가능한 인사이트를 제공합니다.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  })

  const responseText = response.choices[0].message.content || '{}'
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

  return {
    strengths: analysis.strengths || [],
    weaknesses: analysis.weaknesses || [],
    recommendations: analysis.recommendations || []
  }
}

/**
 * 사용자 전체 인사이트
 */
export async function generateUserInsights(
  userId: string,
  days: number = 30
): Promise<{
  totalContents: number
  totalViews: number
  totalRevenue: number
  avgEngagement: number
  topPerformingContent: ContentInsight[]
  recommendations: string[]
}> {
  logger.info('사용자 인사이트 생성:', userId)

  const prisma = getPrismaClient()
  const userStats = await analytics.getUserStats(userId, days)

  // 상위 성과 콘텐츠
  const contents = await prisma.content.findMany({
    where: { userId },
    select: { id: true }
  })

  const contentInsights = await Promise.all(
    contents.slice(0, 10).map(c => generateContentInsights(c.id))
  )

  const topPerforming = contentInsights
    .filter((c): c is ContentInsight => c !== null)
    .sort((a, b) => b.performance.views - a.performance.views)
    .slice(0, 5)

  // 전체 추천사항
  const recommendations: string[] = []
  
  if (userStats.avgEngagement < 0.05) {
    recommendations.push('전체 참여율이 낮습니다. 콘텐츠 품질을 개선하고 시청자와의 상호작용을 늘려보세요.')
  }
  
  if (topPerforming.length > 0) {
    const topContent = topPerforming[0]
    recommendations.push(`가장 성과가 좋은 콘텐츠: "${topContent.title}" - 유사한 콘텐츠를 더 제작해보세요.`)
  }

  return {
    totalContents: contents.length,
    totalViews: userStats.totalViews,
    totalRevenue: userStats.totalRevenue,
    avgEngagement: userStats.avgEngagement,
    topPerformingContent: topPerforming,
    recommendations
  }
}

