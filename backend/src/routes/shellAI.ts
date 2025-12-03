/**
 * Shell AI API 라우트
 * 전지전능한 AI와의 실시간 대화
 */

import express from 'express'
import { shellAI } from '../services/ai/shellAI'
import { logger } from '../utils/logger'
import { requireAuth } from '../middleware/authRequired'
import { shellAILimiter } from '../middleware/rateLimiter'

const router = express.Router()

// 모든 Shell AI 라우트에 인증 및 Rate Limiting 적용
router.use(requireAuth)
router.use(shellAILimiter)

/**
 * POST /api/shell/chat
 * Shell AI와 대화
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, includeSearch, multimodal } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        error: '메시지를 입력해주세요',
      })
    }

    logger.info(`⚡ Shell AI 요청: ${message.substring(0, 50)}...`)

    const response = await shellAI.process({
      task: message,
      context,
      includeSearch,
      multimodal,
    })

    res.json({
      success: true,
      data: response,
    })
  } catch (error: any) {
    logger.error('Shell AI 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Shell AI 처리 중 오류가 발생했습니다',
    })
  }
})

/**
 * POST /api/shell/chat/stream
 * 스트리밍 응답
 */
router.post('/chat/stream', async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        error: '메시지를 입력해주세요',
      })
    }

    // SSE 설정
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // 시작 신호
    res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`)

    // Shell AI 처리
    const response = await shellAI.process({
      task: message,
      includeSearch: true,
    })

    // 응답을 청크로 나누어 전송
    const chunks = response.content.match(/.{1,50}/g) || [response.content]
    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`)
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // 완료 신호
    res.write(`data: ${JSON.stringify({ 
      type: 'done', 
      confidence: response.confidence,
      sources: response.sources,
    })}\n\n`)
    
    res.end()
  } catch (error: any) {
    logger.error('Shell AI 스트리밍 오류:', error)
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
    res.end()
  }
})

/**
 * POST /api/shell/image
 * 이미지 생성
 */
router.post('/image', async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요',
      })
    }

    const imageUrl = await shellAI.generateImage(prompt)

    res.json({
      success: true,
      data: { imageUrl },
    })
  } catch (error: any) {
    logger.error('Shell AI 이미지 생성 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/shell/voice
 * 음성 생성
 */
router.post('/voice', async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({
        success: false,
        error: '텍스트를 입력해주세요',
      })
    }

    const audioUrl = await shellAI.generateVoice(text)

    res.json({
      success: true,
      data: { audioUrl },
    })
  } catch (error: any) {
    logger.error('Shell AI 음성 생성 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/shell/video
 * 영상 생성
 */
router.post('/video', async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요',
      })
    }

    const videoUrl = await shellAI.generateVideo(prompt)

    res.json({
      success: true,
      data: { videoUrl },
    })
  } catch (error: any) {
    logger.error('Shell AI 영상 생성 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * GET /api/shell/capabilities
 * Shell AI 능력 목록
 */
router.get('/capabilities', (req, res) => {
  const capabilities = shellAI.getCapabilities()
  res.json({
    success: true,
    data: { capabilities },
  })
})

/**
 * GET /api/shell/health
 * 상태 확인
 */
router.get('/health', async (req, res) => {
  try {
    const healthy = await shellAI.healthCheck()
    res.json({
      success: true,
      data: { healthy, status: healthy ? 'operational' : 'degraded' },
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/shell/learn
 * 자동 학습
 */
router.post('/learn', async (req, res) => {
  try {
    const { topic } = req.body
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: '학습할 주제를 입력해주세요',
      })
    }
    
    await shellAI.learnFromWeb(topic)
    
    res.json({
      success: true,
      message: `${topic}에 대한 학습을 완료했습니다`,
    })
  } catch (error: any) {
    logger.error('자동 학습 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/shell/feedback
 * 사용자 피드백 학습
 */
router.post('/feedback', async (req, res) => {
  try {
    const { query, response, rating } = req.body
    
    await shellAI.learnFromFeedback(query, response, rating)
    
    res.json({
      success: true,
      message: '피드백이 반영되었습니다',
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/shell/webtoon
 * 웹툰 생성
 */
router.post('/webtoon', async (req, res) => {
  try {
    const { story } = req.body
    
    if (!story) {
      return res.status(400).json({
        success: false,
        error: '웹툰 스토리를 입력해주세요',
      })
    }
    
    const images = await shellAI.generateWebtoon(story)
    
    res.json({
      success: true,
      data: { images },
    })
  } catch (error: any) {
    logger.error('웹툰 생성 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/shell/drama
 * 드라마 시나리오 생성
 */
router.post('/drama', async (req, res) => {
  try {
    const { concept } = req.body
    
    if (!concept) {
      return res.status(400).json({
        success: false,
        error: '드라마 콘셉트를 입력해주세요',
      })
    }
    
    const script = await shellAI.generateDramaScript(concept)
    
    res.json({
      success: true,
      data: { script },
    })
  } catch (error: any) {
    logger.error('드라마 생성 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/shell/movie
 * 영화 스토리보드 생성
 */
router.post('/movie', async (req, res) => {
  try {
    const { plot } = req.body
    
    if (!plot) {
      return res.status(400).json({
        success: false,
        error: '영화 플롯을 입력해주세요',
      })
    }
    
    const storyboard = await shellAI.generateMovieStoryboard(plot)
    
    res.json({
      success: true,
      data: storyboard,
    })
  } catch (error: any) {
    logger.error('영화 생성 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

