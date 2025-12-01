import { Router, Request, Response } from 'express'
import { channelAnalyzer } from '../services/channel/channelAnalyzer'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = Router()

/**
 * POST /api/channel/analyze
 * 채널 분석
 */
router.post('/analyze', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { channelUrl, platform } = req.body

    if (!channelUrl || !platform) {
      return res.status(400).json({
        success: false,
        error: '채널 URL과 플랫폼은 필수입니다'
      })
    }

    if (!['youtube', 'instagram', 'tiktok'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: '지원하는 플랫폼: youtube, instagram, tiktok'
      })
    }

    const analysis = await channelAnalyzer.analyzeChannel(
      channelUrl,
      platform as 'youtube' | 'instagram' | 'tiktok'
    )

    res.json({
      success: true,
      data: analysis
    })
  } catch (error: any) {
    logger.error('채널 분석 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '채널 분석 중 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/channel/apply
 * 분석된 채널 설정을 사용자 채널에 적용
 */
router.post('/apply', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    const { channelUrl, platform } = req.body

    if (!channelUrl || !platform) {
      return res.status(400).json({
        success: false,
        error: '채널 URL과 플랫폼은 필수입니다'
      })
    }

    // 채널 분석
    const analysis = await channelAnalyzer.analyzeChannel(
      channelUrl,
      platform as 'youtube' | 'instagram' | 'tiktok'
    )

    // 설정 적용
    await channelAnalyzer.applyChannelSettings(
      userId,
      analysis,
      platform as 'youtube' | 'instagram' | 'tiktok'
    )

    res.json({
      success: true,
      message: '채널 설정이 성공적으로 적용되었습니다',
      data: {
        channelName: analysis.channelName,
        settings: analysis.settings,
        recommendations: analysis.recommendations
      }
    })
  } catch (error: any) {
    logger.error('채널 설정 적용 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '채널 설정 적용 중 오류가 발생했습니다'
    })
  }
})

export default router

