import { Router, Request, Response } from 'express'
import { accountManager } from '../services/multiAccount/accountManager'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * GET /api/accounts
 * 계정 목록 조회
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    const { platform } = req.query

    const accounts = await accountManager.listAccounts(
      userId,
      platform as string | undefined
    )

    res.json({
      success: true,
      accounts
    })
  } catch (error: any) {
    logger.error('계정 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/accounts
 * 계정 추가
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    const { accountName, platform, channelId, accountId, credentials } = req.body

    const accountId_result = await accountManager.addAccount(userId, {
      accountName,
      platform,
      channelId,
      accountId,
      credentials
    })

    res.json({
      success: true,
      accountId: accountId_result
    })
  } catch (error: any) {
    logger.error('계정 추가 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/accounts/:id/toggle
 * 계정 활성화/비활성화
 */
router.put('/:id/toggle', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    await accountManager.toggleAccount(id, isActive)

    res.json({
      success: true,
      message: `계정이 ${isActive ? '활성화' : '비활성화'}되었습니다`
    })
  } catch (error: any) {
    logger.error('계정 상태 변경 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/accounts/batch-upload
 * 일괄 업로드
 */
router.post('/batch-upload', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId, accountIds } = req.body

    const result = await accountManager.batchUpload(contentId, accountIds)

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('일괄 업로드 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/accounts/:id
 * 계정 삭제
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    await accountManager.deleteAccount(id, userId)

    res.json({
      success: true,
      message: '계정이 삭제되었습니다'
    })
  } catch (error: any) {
    logger.error('계정 삭제 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

