import { Router, Request, Response } from 'express'
import { TrendCollector } from '../services/trends/collector'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = Router()
const trendCollector = new TrendCollector()

/**
 * GET /api/trends
 * 실시간 트렌드 조회
 */
router.get('/', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { language, source } = req.query

    let trends

    if (source === 'news') {
      trends = await trendCollector.collectNewsTrends(language as string || 'ko')
    } else if (source === 'social') {
      trends = await trendCollector.collectSocialTrends()
    } else if (source === 'blog') {
      trends = await trendCollector.collectBlogTrends()
    } else {
      trends = await trendCollector.collectAllTrends(language as string || 'ko')
    }

    res.json({
      success: true,
      data: {
        trends,
        count: trends.length,
        timestamp: new Date()
      }
    })
  } catch (error: any) {
    logger.error('트렌드 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '트렌드 조회 중 오류가 발생했습니다'
    })
  }
})

export default router

