import { Router, Request, Response } from 'express'
import { legalCompliance } from '../services/legal/legalCompliance'
import { copyrightChecker } from '../services/legal/copyrightChecker'
import { contentFilter } from '../services/legal/contentFilter'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * POST /api/legal/check
 * 종합 법적 검사
 */
router.post('/check', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      text,
      tags,
      images,
      videos,
      platforms
    } = req.body

    const result = await legalCompliance.performComprehensiveCheck({
      title,
      description,
      text,
      tags,
      images,
      videos,
      platforms
    })

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('법적 검사 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/legal/copyright
 * 저작권 검사
 */
router.post('/copyright', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { text, imagePath, videoPath } = req.body

    let result: any = {}

    if (text) {
      result.text = await copyrightChecker.checkTextCopyright(text)
    }

    if (imagePath) {
      result.image = await copyrightChecker.checkImageCopyright(imagePath)
    }

    if (videoPath) {
      result.video = await copyrightChecker.checkVideoCopyright(videoPath)
    }

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('저작권 검사 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/legal/filter
 * 콘텐츠 필터링
 */
router.post('/filter', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, text, tags } = req.body

    const result = await contentFilter.filterContent({
      title,
      description,
      text,
      tags
    })

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('콘텐츠 필터링 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/legal/platform-policy
 * 플랫폼 정책 검사
 */
router.post('/platform-policy', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content, platform } = req.body

    const result = await contentFilter.checkPlatformPolicy(content, platform)

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('플랫폼 정책 검사 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/legal/media-copyright
 * 미디어 저작권 검사
 */
router.post('/media-copyright', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { images, videos } = req.body

    const result = await legalCompliance.checkMediaCopyright({
      images,
      videos
    })

    res.json({
      success: true,
      result
    })
  } catch (error: any) {
    logger.error('미디어 저작권 검사 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

