import { Router, Request, Response } from 'express'
import { getRevenueByPlatform, getTotalRevenue, syncRevenueFromPlatform } from '../services/revenue/tracker'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = Router()

/**
 * GET /api/revenue
 * 수익 조회
 */
router.get('/', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { platform, startDate, endDate } = req.query

    let revenueData

    if (platform) {
      revenueData = await getRevenueByPlatform(
        platform as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      )
    } else {
      const total = await getTotalRevenue(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      )
      revenueData = total
    }

    res.json({
      success: true,
      data: revenueData
    })

  } catch (error: any) {
    logger.error('수익 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '수익 조회 중 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/revenue/sync
 * 외부 플랫폼에서 수익 동기화
 */
router.post('/sync', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { platform, accessToken } = req.body

    if (!platform || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'platform과 accessToken은 필수입니다'
      })
    }

    await syncRevenueFromPlatform(platform, accessToken)

    res.json({
      success: true,
      message: '수익 동기화 완료'
    })

  } catch (error: any) {
    logger.error('수익 동기화 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '수익 동기화 중 오류가 발생했습니다'
    })
  }
})

export default router

