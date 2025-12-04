/**
 * 📈 트렌드 분석 API
 */

import { Router, Request, Response } from 'express'
import { trendAnalyzer } from '../services/trends/trendAnalyzer'
import { logger } from '../utils/logger'
import { validateApiKey } from '../middleware/auth'

const router = Router()

/**
 * GET /api/trends/daily-recommendations
 * 오늘의 추천 주제
 */
router.get('/daily-recommendations', validateApiKey, async (req: Request, res: Response) => {
  try {
    const recommendations = await trendAnalyzer.getDailyRecommendations()

    logger.info('📈 오늘의 추천 전송')

    res.json({
      success: true,
      ...recommendations
    })
  } catch (error: any) {
    logger.error('추천 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: '추천을 생성할 수 없습니다'
    })
  }
})

/**
 * GET /api/trends/random
 * 랜덤 추천
 */
router.get('/random', validateApiKey, async (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string) || 5
    const recommendations = await trendAnalyzer.getRandomRecommendations(count)

    res.json({
      success: true,
      recommendations
    })
  } catch (error: any) {
    logger.error('랜덤 추천 실패:', error)
    res.status(500).json({
      success: false,
      error: '추천 생성 실패'
    })
  }
})

export default router
