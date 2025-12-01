import { Router, Request, Response } from 'express'
import { recommender } from '../services/recommendation/recommender'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = Router()

/**
 * GET /api/recommendation
 * 사용자 맞춤 콘텐츠 추천
 */
router.get('/', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { userId, limit } = req.query

    const recommendations = await recommender.getRecommendations(
      userId as string | undefined,
      limit ? parseInt(limit as string) : 10
    )

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        timestamp: new Date()
      }
    })
  } catch (error: any) {
    logger.error('추천 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '추천 생성 중 오류가 발생했습니다'
    })
  }
})

export default router

