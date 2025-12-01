import { Router, Request, Response } from 'express'
import { scheduler } from '../services/scheduling/scheduler'
import { smartScheduler } from '../services/automation/smartScheduler'
import { getPrismaClient } from '../utils/database'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * GET /api/schedules
 * 스케줄 목록 조회
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = getPrismaClient()
    const userId = req.user?.id

    const schedules = await prisma.schedule.findMany({
      where: userId ? { userId } : {},
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      schedules: schedules.map(s => ({
        ...s,
        platforms: JSON.parse(s.platforms),
        settings: s.settings ? JSON.parse(s.settings) : null
      }))
    })
  } catch (error: any) {
    logger.error('스케줄 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/schedules
 * 스케줄 생성
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const {
      name,
      description,
      contentType,
      topic,
      topicSource,
      frequency,
      cronExpression,
      platforms,
      settings,
      autoUpload
    } = req.body

    const scheduleId = await scheduler.addSchedule({
      userId,
      name,
      contentType,
      frequency,
      cronExpression,
      platforms: platforms || ['youtube'],
      settings
    })

    res.json({
      success: true,
      scheduleId
    })
  } catch (error: any) {
    logger.error('스케줄 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/schedules/smart
 * 스마트 스케줄 생성 (AI 기반)
 */
router.post('/smart', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    const { contentType, frequency, platforms } = req.body

    const scheduleId = await smartScheduler.createSmartSchedule(userId, {
      contentType,
      frequency,
      platforms
    })

    res.json({
      success: true,
      scheduleId,
      message: 'AI 기반 최적 스케줄이 생성되었습니다'
    })
  } catch (error: any) {
    logger.error('스마트 스케줄 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/schedules/:id
 * 스케줄 수정
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const prisma = getPrismaClient()

    const updateData: any = {}
    if (req.body.name) updateData.name = req.body.name
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive
    if (req.body.platforms) updateData.platforms = JSON.stringify(req.body.platforms)
    if (req.body.settings) updateData.settings = JSON.stringify(req.body.settings)

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData
    })

    // 스케줄 재등록
    await scheduler.scheduleTask(schedule)

    res.json({
      success: true,
      schedule
    })
  } catch (error: any) {
    logger.error('스케줄 수정 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/schedules/:id
 * 스케줄 삭제
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const prisma = getPrismaClient()

    await prisma.schedule.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '스케줄이 삭제되었습니다'
    })
  } catch (error: any) {
    logger.error('스케줄 삭제 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

