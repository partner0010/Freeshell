import { Router, Request, Response } from 'express'
import { batchProcessor } from '../services/batch/batchProcessor'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * POST /api/batch
 * 배치 작업 생성
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    const { type, items, settings } = req.body

    const jobId = await batchProcessor.createBatchJob(userId, {
      type,
      items,
      settings
    })

    res.json({
      success: true,
      jobId,
      message: '배치 작업이 생성되었습니다'
    })
  } catch (error: any) {
    logger.error('배치 작업 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/batch/:id
 * 배치 작업 상태 조회
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const job = await batchProcessor.getBatchJobStatus(id)

    if (!job) {
      return res.status(404).json({
        success: false,
        error: '배치 작업을 찾을 수 없습니다'
      })
    }

    res.json({
      success: true,
      job: {
        ...job,
        settings: job.settings ? JSON.parse(job.settings) : null
      }
    })
  } catch (error: any) {
    logger.error('배치 작업 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/batch
 * 사용자의 배치 작업 목록
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!

    const jobs = await batchProcessor.getUserBatchJobs(userId)

    res.json({
      success: true,
      jobs: jobs.map(job => ({
        ...job,
        settings: job.settings ? JSON.parse(job.settings) : null
      }))
    })
  } catch (error: any) {
    logger.error('배치 작업 목록 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

