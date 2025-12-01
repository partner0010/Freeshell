import { Router, Request, Response } from 'express'
import { autoSetup } from '../utils/autoSetup'
import { performHealthCheck } from '../utils/healthCheck'
import { diagnoseSystem } from '../services/selfDiagnosis'
import { logger } from '../utils/logger'
import { getCSRFToken } from '../middleware/csrf'

const router = Router()

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

export default router

