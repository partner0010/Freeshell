import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { generateContent } from '../services/contentGenerator'
import { logger } from '../utils/logger'
import { validateContentRequest } from '../middleware/validateRequest'
import { validateContentInput, validateFileUpload } from '../middleware/inputValidation'
import { validateApiKey } from '../middleware/auth'
import { getPrismaClient } from '../utils/database'

const router = Router()

// Multer 설정 - 파일 업로드
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, './uploads/images')
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, './uploads/videos')
    } else {
      cb(null, './uploads')
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
})

/**
 * POST /api/content/generate
 * AI 콘텐츠 생성
 */
router.post('/generate', 
  validateApiKey, // API 키 검증
  validateContentInput, // 입력 검증
  validateFileUpload, // 파일 검증
  upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req: Request, res: Response) => {
  try {
    const {
      topic,
      contentType,
      contentTime,
      contentFormat,
      text
    } = req.body

    if (!topic || !contentType || !text) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다: topic, contentType, text'
      })
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    const images = files?.images || []
    const videos = files?.videos || []

    logger.info('콘텐츠 생성 요청:', {
      topic,
      contentType,
      contentTime,
      imagesCount: images.length,
      videosCount: videos.length
    })

    // JSON 파싱 안전하게 처리 (보안 강화)
    let parsedContentFormat: string[] = []
    try {
      const formatStr = contentFormat || '[]'
      if (typeof formatStr === 'string') {
        parsedContentFormat = JSON.parse(formatStr)
        if (!Array.isArray(parsedContentFormat)) {
          throw new Error('contentFormat must be an array')
        }
      } else if (Array.isArray(formatStr)) {
        parsedContentFormat = formatStr
      }
    } catch (error) {
      logger.warn('Invalid contentFormat:', contentFormat)
      parsedContentFormat = []
    }

    // contentTime 검증 (15초-1시간 제한, 용량 고려)
    // 10분(600초) 이상 권장 (광고 수익 최적화)
    const maxTime = 3600 // 1시간 (용량 고려)
    const time = Math.min(Math.max(parseInt(contentTime) || 600, 15), maxTime)
    
    // 용량 경고 (10분 이상 시)
    if (time > 600) {
      logger.warn(`긴 영상 생성 요청: ${time}초 (용량 주의)`)
    }

    const formData = {
      topic,
      contentType,
      contentTime: time,
      contentFormat: parsedContentFormat,
      text,
      images: images.map(img => img.path),
      videos: videos.map(vid => vid.path)
    }

    // AI 콘텐츠 생성
    const generatedContents = await generateContent(formData)

    res.json({
      success: true,
      data: generatedContents
    })

  } catch (error: any) {
    logger.error('콘텐츠 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '콘텐츠 생성 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/content/:id
 * 생성된 콘텐츠 조회
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const prisma = getPrismaClient()
    
    // 데이터베이스에서 콘텐츠 조회
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        },
        uploads: {
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    if (!content) {
      return res.status(404).json({
        success: false,
        error: '콘텐츠를 찾을 수 없습니다'
      })
    }

    res.json({
      success: true,
      data: content
    })
  } catch (error: any) {
    logger.error('콘텐츠 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '콘텐츠 조회 중 오류가 발생했습니다'
    })
  }
})

export default router

