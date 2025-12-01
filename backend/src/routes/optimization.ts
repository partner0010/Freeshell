import { Router, Request, Response } from 'express'
import { autoOptimizer } from '../services/automation/autoOptimizer'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * POST /api/optimization/ab-test
 * A/B 테스트 생성
 */
router.post('/ab-test', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId, variantA, variantB } = req.body

    const testId = await autoOptimizer.createABTest(contentId, variantA, variantB)

    res.json({
      success: true,
      testId,
      message: 'A/B 테스트가 생성되었습니다'
    })
  } catch (error: any) {
    logger.error('A/B 테스트 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/optimization/ab-test/:id
 * A/B 테스트 결과 분석
 */
router.get('/ab-test/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const result = await autoOptimizer.analyzeABTest(id)

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('A/B 테스트 분석 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/optimization/optimize
 * 콘텐츠 자동 최적화
 */
router.post('/optimize', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.body

    const result = await autoOptimizer.optimizeContent(contentId)

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('자동 최적화 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/optimization/batch-optimize
 * 배치 최적화
 */
router.post('/batch-optimize', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentIds } = req.body

    const result = await autoOptimizer.batchOptimize(contentIds)

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('배치 최적화 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

