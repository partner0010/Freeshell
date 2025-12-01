import { Router, Request, Response } from 'express'
import { logger } from '../utils/logger'
import { validateApiKey } from '../middleware/auth'
import { generateMultilingualContent, generateGlobalContent } from '../services/multilingual/contentGenerator'
import { SUPPORTED_LANGUAGES } from '../services/translation/translator'

const router = Router()

/**
 * POST /api/multilingual/generate
 * 다국어 콘텐츠 생성
 */
router.post('/generate', validateApiKey, async (req: Request, res: Response) => {
  try {
    const {
      topic,
      contentType,
      duration,
      sourceLanguage,
      targetLanguages,
      regions,
      generateVideos
    } = req.body

    if (!topic || !contentType || !duration) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다: topic, contentType, duration'
      })
    }

    logger.info('다국어 콘텐츠 생성 요청:', {
      topic,
      contentType,
      duration,
      languages: targetLanguages
    })

    const results = await generateMultilingualContent(
      topic,
      contentType,
      duration,
      {
        sourceLanguage: sourceLanguage || 'ko',
        targetLanguages: targetLanguages || ['en', 'ja', 'zh'],
        regions: regions || [],
        generateVideos: generateVideos !== false
      }
    )

    res.json({
      success: true,
      data: results,
      languages: Object.keys(results),
      totalContents: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    })

  } catch (error: any) {
    logger.error('다국어 콘텐츠 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '다국어 콘텐츠 생성 중 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/multilingual/global
 * 전세계 수익화를 위한 콘텐츠 생성
 */
router.post('/global', validateApiKey, async (req: Request, res: Response) => {
  try {
    const {
      topic,
      contentType,
      duration,
      regions,
      languages,
      generateVideos
    } = req.body

    if (!topic || !contentType || !duration) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다: topic, contentType, duration'
      })
    }

    logger.info('전세계 콘텐츠 생성 요청:', {
      topic,
      contentType,
      duration,
      regions,
      languages
    })

    const results = await generateGlobalContent(
      topic,
      contentType,
      duration,
      {
        regions,
        languages,
        generateVideos: generateVideos !== false
      }
    )

    res.json({
      success: true,
      data: results,
      languages: Object.keys(results),
      totalContents: Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
      estimatedRevenue: calculateEstimatedRevenue(results)
    })

  } catch (error: any) {
    logger.error('전세계 콘텐츠 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '전세계 콘텐츠 생성 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/multilingual/languages
 * 지원 언어 목록 조회
 */
router.get('/languages', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: SUPPORTED_LANGUAGES,
    total: SUPPORTED_LANGUAGES.length
  })
})

/**
 * 수익 추정 계산
 */
function calculateEstimatedRevenue(results: Record<string, any[]>): {
  total: number
  byLanguage: Record<string, number>
} {
  const byLanguage: Record<string, number> = {}
  let total = 0

  // 언어별 예상 수익 (영상당 $10 기준)
  Object.entries(results).forEach(([language, contents]) => {
    const revenue = contents.length * 10
    byLanguage[language] = revenue
    total += revenue
  })

  return { total, byLanguage }
}

export default router

