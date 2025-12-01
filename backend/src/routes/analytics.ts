import { Router, Request, Response } from 'express'
import { analytics } from '../services/analytics/realTimeAnalytics'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * GET /api/analytics/content/:contentId
 * 콘텐츠별 통계
 */
router.get('/content/:contentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params
    const { days } = req.query

    const stats = await analytics.getContentStats(
      contentId,
      days ? parseInt(days as string) : 30
    )

    res.json({
      success: true,
      stats
    })
  } catch (error: any) {
    logger.error('통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/platform/:platform
 * 플랫폼별 통계
 */
router.get('/platform/:platform', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { platform } = req.params
    const { days } = req.query

    const stats = await analytics.getPlatformStats(
      platform,
      days ? parseInt(days as string) : 30
    )

    res.json({
      success: true,
      stats
    })
  } catch (error: any) {
    logger.error('플랫폼 통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/user
 * 사용자 전체 통계
 */
router.get('/user', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    const { days } = req.query

    const stats = await analytics.getUserStats(
      userId,
      days ? parseInt(days as string) : 30
    )

    res.json({
      success: true,
      stats
    })
  } catch (error: any) {
    logger.error('사용자 통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/predict/:contentId
 * 예측 분석
 */
router.get('/predict/:contentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params
    const { days } = req.query

    const predictions = await analytics.predictFutureStats(
      contentId,
      days ? parseInt(days as string) : 7
    )

    res.json({
      success: true,
      predictions
    })
  } catch (error: any) {
    logger.error('예측 분석 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/optimize/:contentId
 * 최적화 제안
 */
router.get('/optimize/:contentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params

    const suggestions = await analytics.getOptimizationSuggestions(contentId)

    res.json({
      success: true,
      suggestions
    })
  } catch (error: any) {
    logger.error('최적화 제안 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

