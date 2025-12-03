/**
 * 자동 점검 API
 */

import express from 'express'
import { requireAuth as authRequired, requireAdmin as adminRequired } from '../middleware/authRequired'
import { autoInspector } from '../services/ai/autoInspector'
import { autoFixer } from '../services/ai/autoFixer'
import { autoInspectionScheduler } from '../services/scheduler/autoInspectionScheduler'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * POST /api/auto-inspection/run
 * 즉시 점검 실행
 */
router.post('/run', authRequired, adminRequired, async (req, res) => {
  try {
    logger.info('🔍 관리자 요청: 즉시 점검 실행')

    const report = await autoInspector.runFullInspection()

    res.json({
      success: true,
      data: report,
    })
  } catch (error: any) {
    logger.error('점검 실행 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '점검 실행 실패',
    })
  }
})

/**
 * POST /api/auto-inspection/fix
 * 자동 조치 실행
 */
router.post('/fix', authRequired, adminRequired, async (req, res) => {
  try {
    const { issues } = req.body

    if (!issues || !Array.isArray(issues)) {
      return res.status(400).json({
        success: false,
        error: 'issues 배열이 필요합니다',
      })
    }

    logger.info('🔧 관리자 요청: 자동 조치 실행')

    const results = await autoFixer.autoFix(issues)

    res.json({
      success: true,
      data: results,
    })
  } catch (error: any) {
    logger.error('자동 조치 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '자동 조치 실패',
    })
  }
})

/**
 * POST /api/auto-inspection/optimize
 * 플랫폼 최적화 실행
 */
router.post('/optimize', authRequired, adminRequired, async (req, res) => {
  try {
    logger.info('⚡ 관리자 요청: 플랫폼 최적화 실행')

    const results = await autoFixer.optimizePlatform()

    res.json({
      success: true,
      data: results,
    })
  } catch (error: any) {
    logger.error('최적화 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '최적화 실패',
    })
  }
})

/**
 * POST /api/auto-inspection/schedule
 * 스케줄 생성
 */
router.post('/schedule', authRequired, adminRequired, async (req, res) => {
  try {
    const { time, autoFix, optimize } = req.body
    const userId = (req as any).userId

    if (!time || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return res.status(400).json({
        success: false,
        error: '올바른 시간 형식이 필요합니다 (HH:mm)',
      })
    }

    const schedule = await autoInspectionScheduler.createSchedule(
      userId,
      time,
      autoFix !== false,
      optimize !== false
    )

    res.json({
      success: true,
      data: schedule,
    })
  } catch (error: any) {
    logger.error('스케줄 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '스케줄 생성 실패',
    })
  }
})

/**
 * GET /api/auto-inspection/schedule
 * 스케줄 조회
 */
router.get('/schedule', authRequired, adminRequired, async (req, res) => {
  try {
    const schedules = await autoInspectionScheduler.getSchedules()

    res.json({
      success: true,
      data: schedules,
    })
  } catch (error: any) {
    logger.error('스케줄 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '스케줄 조회 실패',
    })
  }
})

/**
 * PUT /api/auto-inspection/schedule/:id
 * 스케줄 업데이트
 */
router.put('/schedule/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const { id } = req.params
    const { time, enabled, autoFix, optimize } = req.body

    const schedule = await autoInspectionScheduler.updateSchedule(
      id,
      time,
      enabled,
      autoFix,
      optimize
    )

    res.json({
      success: true,
      data: schedule,
    })
  } catch (error: any) {
    logger.error('스케줄 업데이트 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '스케줄 업데이트 실패',
    })
  }
})

/**
 * DELETE /api/auto-inspection/schedule/:id
 * 스케줄 삭제
 */
router.delete('/schedule/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const { id } = req.params

    await autoInspectionScheduler.deleteSchedule(id)

    res.json({
      success: true,
      message: '스케줄 삭제 완료',
    })
  } catch (error: any) {
    logger.error('스케줄 삭제 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '스케줄 삭제 실패',
    })
  }
})

/**
 * GET /api/auto-inspection/reports
 * 점검 보고서 조회
 */
router.get('/reports', authRequired, adminRequired, async (req, res) => {
  try {
    const { getPrismaClient } = await import('../utils/database')
    const prisma = getPrismaClient()

    const reports = await prisma.inspectionReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    res.json({
      success: true,
      data: reports,
    })
  } catch (error: any) {
    logger.error('보고서 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '보고서 조회 실패',
    })
  }
})

export default router

