import { Router, Request, Response } from 'express'
import { uploadToPlatforms } from '../services/uploadService'
import { logger } from '../utils/logger'

const router = Router()

/**
 * POST /api/upload
 * 콘텐츠 업로드
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { contentId, platforms } = req.body

    if (!contentId || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({
        success: false,
        error: 'contentId와 platforms 배열이 필요합니다'
      })
    }

    logger.info('콘텐츠 업로드 시작:', { contentId, platforms })

    const results = await uploadToPlatforms(contentId, platforms)

    res.json({
      success: true,
      data: results
    })

  } catch (error: any) {
    logger.error('업로드 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '업로드 중 오류가 발생했습니다'
    })
  }
})

export default router

