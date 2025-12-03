/**
 * 🚀 고급 AI API 라우트 - 새로운 AI 기능들을 실제로 사용
 */

import { Router, Request, Response } from 'express'
import { advancedAI } from '../services/ai/advancedAIOrchestrator'
import { advancedVideoGenerator } from '../services/video/advancedVideoGenerator'
import { advancedImageGenerator } from '../services/image/advancedImageGenerator'
import { advancedAudioGenerator } from '../services/audio/advancedAudioGenerator'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'
import { 
  xssProtection, 
  sqlInjectionProtection, 
  validateInput,
  advancedRateLimit 
} from '../middleware/advancedSecurity'
import { cacheOptimizer } from '../services/performance/cacheOptimizer'

const router = Router()

// 🔒 보안 미들웨어 적용
router.use(xssProtection)
router.use(sqlInjectionProtection)
router.use(validateInput)

// ⚡ Rate Limiting (AI는 더 제한적)
router.use(advancedRateLimit({
  windowMs: 60 * 1000, // 1분
  maxRequests: 30 // 1분에 30회
}))

/**
 * 🤖 POST /api/advanced-ai/chat
 * 고급 AI 채팅 (14개 모델 중 선택)
 */
router.post('/chat', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { messages, model, options } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: '메시지는 필수이며 배열이어야 합니다'
      })
    }

    logger.info(`🤖 AI 채팅 요청: ${model || 'auto'}`)

    // 💾 캐시 확인 및 사용
    const cacheKey = cacheOptimizer.generateKey('ai-chat', messages, model)
    const response = await cacheOptimizer.getOrSet(
      cacheKey,
      () => advancedAI.chat(messages, model, options),
      { ttl: 300, tags: ['ai-chat'] } // 5분 캐시
    )

    res.json({
      success: true,
      data: response
    })
  } catch (error: any) {
    logger.error('AI 채팅 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 🎬 POST /api/advanced-ai/video/generate
 * 비디오 생성 (Runway, Pika, Stable Video)
 */
router.post('/video/generate', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt, engine, options } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트는 필수입니다'
      })
    }

    logger.info(`🎬 비디오 생성 요청: ${engine || 'runway'}`)

    let result

    if (engine === 'pika') {
      result = await advancedVideoGenerator.generateWithPika({ prompt, ...options })
    } else if (engine === 'stable') {
      result = await advancedVideoGenerator.generateWithStableVideo(options.imageUrl, { prompt, ...options })
    } else {
      result = await advancedVideoGenerator.generateWithRunway({ prompt, ...options })
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('비디오 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 🎨 POST /api/advanced-ai/image/generate
 * 이미지 생성 (DALL-E 3, SDXL, Midjourney 스타일)
 */
router.post('/image/generate', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt, engine, options } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트는 필수입니다'
      })
    }

    logger.info(`🎨 이미지 생성 요청: ${engine || 'dalle3'}`)

    let result

    if (engine === 'sdxl') {
      result = await advancedImageGenerator.generateWithSDXL({ prompt, ...options })
    } else if (engine === 'midjourney') {
      result = await advancedImageGenerator.generateWithMidjourney({ prompt, ...options })
    } else {
      result = await advancedImageGenerator.generateWithDALLE3({ prompt, ...options })
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('이미지 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 🔍 POST /api/advanced-ai/image/upscale
 * 이미지 업스케일링 (4x)
 */
router.post('/image/upscale', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { imageUrl, scale } = req.body

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: '이미지 URL은 필수입니다'
      })
    }

    logger.info(`🔍 이미지 업스케일링: ${scale}x`)

    const result = await advancedImageGenerator.upscale(imageUrl, scale || 4)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('업스케일링 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 🎭 POST /api/advanced-ai/image/remove-background
 * 배경 제거
 */
router.post('/image/remove-background', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: '이미지 URL은 필수입니다'
      })
    }

    logger.info('🎭 배경 제거 시작')

    const result = await advancedImageGenerator.removeBackground(imageUrl)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('배경 제거 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 🗣️ POST /api/advanced-ai/audio/generate-voice
 * 음성 합성 (ElevenLabs)
 */
router.post('/audio/generate-voice', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { text, voice, options } = req.body

    if (!text) {
      return res.status(400).json({
        success: false,
        error: '텍스트는 필수입니다'
      })
    }

    logger.info('🗣️ 음성 생성 시작')

    const result = await advancedAudioGenerator.generateVoice({ text, voice, ...options })

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('음성 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 🎼 POST /api/advanced-ai/audio/generate-music
 * 음악 생성 (AIVA)
 */
router.post('/audio/generate-music', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { genre, duration, mood } = req.body

    if (!genre) {
      return res.status(400).json({
        success: false,
        error: '장르는 필수입니다'
      })
    }

    logger.info(`🎼 음악 생성: ${genre}`)

    const result = await advancedAudioGenerator.generateMusic(genre, duration, mood)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('음악 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 📊 GET /api/advanced-ai/stats
 * AI 사용 통계
 */
router.get('/stats', validateApiKey, async (req: Request, res: Response) => {
  try {
    const stats = {
      ai: advancedAI.getStats(),
      video: advancedVideoGenerator.getStats(),
      image: advancedImageGenerator.getStats(),
      audio: advancedAudioGenerator.getStats()
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    logger.error('통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 🎯 POST /api/advanced-ai/auto-select
 * 자동 모델 선택 (작업에 최적화)
 */
router.post('/auto-select', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { task, content } = req.body

    const selectedModel = await advancedAI.autoSelectModel(task, content)

    res.json({
      success: true,
      data: {
        model: selectedModel,
        reason: `${task} 작업에 최적화된 모델`
      }
    })
  } catch (error: any) {
    logger.error('모델 선택 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

