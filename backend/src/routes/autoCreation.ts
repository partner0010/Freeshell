/**
 * 🎬 자동 창작 API
 */

import { Router, Request, Response } from 'express'
import { ultraQualityAI } from '../services/ai/ultraQualityAI'
import { autoScheduler, ScheduleConfig } from '../services/automation/autoScheduler'
import { socialMediaUploader } from '../services/social/socialMediaUploader'
import { logger } from '../utils/logger'
import { validateApiKey } from '../middleware/auth'

const router = Router()

/**
 * POST /api/ai/generate-versions
 * 여러 버전 생성
 */
router.post('/generate-versions', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { topic, count, settings } = req.body

    const result = await ultraQualityAI.generateMultipleVersions(
      topic,
      settings,
      count
    )

    res.json(result)
  } catch (error: any) {
    logger.error('버전 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: '생성 실패'
    })
  }
})

/**
 * POST /api/schedule/create
 * 자동 스케줄 등록
 */
router.post('/schedule/create', validateApiKey, async (req: Request, res: Response) => {
  try {
    const config: ScheduleConfig = req.body

    const result = autoScheduler.registerSchedule(config)

    res.json(result)
  } catch (error: any) {
    logger.error('스케줄 등록 실패:', error)
    res.status(500).json({
      success: false,
      error: '스케줄 등록 실패'
    })
  }
})

/**
 * POST /api/social/upload-batch
 * 다중 업로드
 */
router.post('/upload-batch', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { videos, platforms, credentials } = req.body

    const results = await Promise.all(
      videos.map((videoUrl: string) =>
        socialMediaUploader.uploadToAll(
          videoUrl,
          credentials,
          {
            title: '자동 생성 콘텐츠',
            description: 'AI가 자동으로 생성한 콘텐츠입니다',
            tags: ['AI', 'auto']
          },
          platforms
        )
      )
    )

    const successful = results.flat().filter(r => r.success).length

    res.json({
      success: true,
      successful,
      total: results.length * platforms.length
    })
  } catch (error: any) {
    logger.error('배치 업로드 실패:', error)
    res.status(500).json({
      success: false,
      error: '업로드 실패'
    })
  }
})

export default router

