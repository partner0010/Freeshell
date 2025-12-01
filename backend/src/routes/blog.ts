import { Router, Request, Response } from 'express'
import { generateBlogPost } from '../services/blog/generator'
import { translateBlogPost } from '../services/blog/translator'
import { publishToWordPress, publishToMedium, publishToBlogger } from '../services/blog/publisher'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = Router()

/**
 * POST /api/blog/generate
 * 블로그 포스트 생성
 */
router.post('/generate', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { topic, contentType, language, wordCount } = req.body

    if (!topic || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'topic과 contentType은 필수입니다'
      })
    }

    logger.info('블로그 포스트 생성 요청:', { topic, contentType, language, wordCount })

    const blogPost = await generateBlogPost(
      topic,
      contentType,
      language || 'ko',
      wordCount || 1000
    )

    res.json({
      success: true,
      data: blogPost
    })

  } catch (error: any) {
    logger.error('블로그 포스트 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '블로그 포스트 생성 중 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/blog/translate
 * 블로그 포스트 번역
 */
router.post('/translate', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { blogPost, targetLanguage } = req.body

    if (!blogPost || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'blogPost와 targetLanguage는 필수입니다'
      })
    }

    const translated = await translateBlogPost(blogPost, targetLanguage)

    res.json({
      success: true,
      data: translated
    })

  } catch (error: any) {
    logger.error('번역 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '번역 중 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/blog/publish
 * 블로그 포스트 게시
 */
router.post('/publish', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { blogPost, platform, credentials } = req.body

    if (!blogPost || !platform) {
      return res.status(400).json({
        success: false,
        error: 'blogPost와 platform은 필수입니다'
      })
    }

    logger.info('블로그 포스트 게시:', { platform })

    let result: any

    switch (platform) {
      case 'wordpress':
        if (!credentials.siteUrl || !credentials.username || !credentials.password) {
          return res.status(400).json({
            success: false,
            error: 'WordPress 인증 정보가 필요합니다'
          })
        }
        result = await publishToWordPress(
          blogPost,
          credentials.siteUrl,
          credentials.username,
          credentials.password
        )
        break

      case 'medium':
        if (!credentials.accessToken || !credentials.userId) {
          return res.status(400).json({
            success: false,
            error: 'Medium 인증 정보가 필요합니다'
          })
        }
        result = await publishToMedium(
          blogPost,
          credentials.accessToken,
          credentials.userId
        )
        break

      case 'blogger':
        if (!credentials.blogId || !credentials.accessToken) {
          return res.status(400).json({
            success: false,
            error: 'Blogger 인증 정보가 필요합니다'
          })
        }
        result = await publishToBlogger(
          blogPost,
          credentials.blogId,
          credentials.accessToken
        )
        break

      default:
        return res.status(400).json({
          success: false,
          error: `지원하지 않는 플랫폼: ${platform}`
        })
    }

    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    logger.error('블로그 포스트 게시 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '블로그 포스트 게시 중 오류가 발생했습니다'
    })
  }
})

export default router

