import { Router, Request, Response } from 'express'
import { automateEverything, AutomationConfig } from '../services/automation/orchestrator'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = Router()

/**
 * POST /api/automation/run
 * 원클릭 자동화 실행
 * 주제만 입력하면 모든 플랫폼에 자동으로 콘텐츠 생성 및 배포
 */
router.post('/run', validateApiKey, async (req: Request, res: Response) => {
  try {
    const {
      topic,
      contentType,
      text,
      // YouTube 설정
      enableYouTube,
      youtubePlatforms,
      // E-book 설정
      enableEbook,
      ebookPrice,
      ebookLanguage,
      ebookChapterCount,
      ebookPlatforms,
      // 블로그 설정
      enableBlog,
      blogLanguages,
      blogPlatforms,
      blogWordCount,
      // 인증 정보
      credentials
    } = req.body

    if (!topic || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'topic과 contentType은 필수입니다'
      })
    }

    logger.info('원클릭 자동화 요청:', { topic, contentType })

    const config: AutomationConfig = {
      topic,
      contentType,
      text,
      enableYouTube: enableYouTube !== false, // 기본값 true
      youtubePlatforms: youtubePlatforms || ['youtube'],
      enableEbook: enableEbook !== false, // 기본값 true
      ebookPrice: ebookPrice || 9.99,
      ebookLanguage: ebookLanguage || 'ko',
      ebookChapterCount: ebookChapterCount || 10,
      ebookPlatforms: ebookPlatforms || ['gumroad'],
      enableBlog: enableBlog !== false, // 기본값 true
      blogLanguages: blogLanguages || ['ko'],
      blogPlatforms: blogPlatforms || ['wordpress'],
      blogWordCount: blogWordCount || 1000,
      credentials
    }

    // 자동화 실행
    const result = await automateEverything(config)

    res.json({
      success: result.success,
      data: result
    })

  } catch (error: any) {
    logger.error('원클릭 자동화 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '자동화 실행 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/automation/status/:jobId
 * 자동화 작업 상태 조회 (실시간 진행 상황)
 */
router.get('/status/:jobId', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params
    
    // 실제 작업 상태 조회 (Redis 또는 데이터베이스)
    const { getCache } = await import('../utils/cache')
    const cached = await getCache<any>(`automation:${jobId}`)
    
    if (cached) {
      return res.json({
        success: true,
        data: cached
      })
    }
    
    // 데이터베이스에서 조회
    const { getPrismaClient } = await import('../utils/database')
    const prisma = getPrismaClient()
    const batchJob = await prisma.batchJob.findUnique({
      where: { id: jobId }
    })
    
    if (batchJob) {
      return res.json({
        success: true,
        data: {
          jobId,
          status: batchJob.status,
          progress: Math.round((batchJob.completedItems / batchJob.totalItems) * 100),
          steps: []
        }
      })
    }
    
    res.json({
      success: true,
      data: {
        jobId,
        status: 'not_found',
        progress: 0,
        steps: []
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

