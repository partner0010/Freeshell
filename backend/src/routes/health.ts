import { Router, Request, Response } from 'express'
import { autoSetup } from '../utils/autoSetup'
import { performHealthCheck } from '../utils/healthCheck'
import { diagnoseSystem } from '../services/selfDiagnosis'
import { logger } from '../utils/logger'
import { getCSRFToken } from '../middleware/csrf'
import { register } from '../services/monitoring/metrics'
import { errorTracker } from '../services/monitoring/errorTracker'

const router = Router()

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 서버 상태 확인
 *     tags: [건강]
 *     responses:
 *       200:
 *         description: 서버 상태 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 server:
 *                   type: object
 *                 health:
 *                   type: object
 *                 diagnosis:
 *                   type: object
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const serverInfo = await autoSetup()
    const healthStatus = await performHealthCheck()
    
    // 자가 진단도 함께 실행
    let diagnosis = null
    try {
      diagnosis = await diagnoseSystem()
    } catch (diagError) {
      logger.warn('자가 진단 실패:', diagError)
    }
    
    res.json({
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
      server: serverInfo,
      health: healthStatus.checks,
      diagnosis: diagnosis ? {
        status: diagnosis.status,
        issueCount: diagnosis.issues.length,
        criticalIssues: diagnosis.issues.filter(i => i.severity === 'critical').length,
        issues: diagnosis.issues
      } : null
    })
  } catch (error: any) {
    logger.error('헬스 체크 실패:', error)
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    })
  }
})

/**
 * GET /api/health/csrf
 * CSRF 토큰 발급
 */
router.get('/csrf', getCSRFToken)

/**
 * GET /api/health/metrics
 * 메트릭 정보 조회
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await register.getMetricsAsJSON()
    res.json({
      success: true,
      metrics
    })
  } catch (error: any) {
    logger.error('메트릭 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/health/errors
 * 에러 통계 조회
 */
router.get('/errors', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7
    const stats = await errorTracker.getErrorStats(days)
    
    res.json({
      success: true,
      stats
    })
  } catch (error: any) {
    logger.error('에러 통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

