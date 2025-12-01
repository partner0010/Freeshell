import { Router, Request, Response } from 'express'
import { notificationService } from '../services/notifications/notificationService'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * GET /api/notifications
 * 알림 목록 조회
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    const { unreadOnly } = req.query

    const notifications = await notificationService.getUserNotifications(
      userId,
      unreadOnly === 'true'
    )

    res.json({
      success: true,
      notifications
    })
  } catch (error: any) {
    logger.error('알림 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/notifications/:id/read
 * 알림 읽음 처리
 */
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    await notificationService.markAsRead(id, userId)

    res.json({
      success: true,
      message: '알림이 읽음 처리되었습니다'
    })
  } catch (error: any) {
    logger.error('알림 읽음 처리 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/notifications/read-all
 * 모든 알림 읽음 처리
 */
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!

    await notificationService.markAllAsRead(userId)

    res.json({
      success: true,
      message: '모든 알림이 읽음 처리되었습니다'
    })
  } catch (error: any) {
    logger.error('전체 알림 읽음 처리 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/notifications/:id
 * 알림 삭제
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    await notificationService.deleteNotification(id, userId)

    res.json({
      success: true,
      message: '알림이 삭제되었습니다'
    })
  } catch (error: any) {
    logger.error('알림 삭제 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

