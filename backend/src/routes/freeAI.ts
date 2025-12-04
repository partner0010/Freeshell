/**
 * 🆓 무료 AI Hub API
 * Pollinations, Groq, HuggingFace, Replicate
 */

import { Router, Request, Response } from 'express'
import { freeAIHub } from '../services/ai/freeAIHub'
import { longToShortConverter } from '../services/video/longToShort'
import { logger } from '../utils/logger'
import { validateApiKey } from '../middleware/auth'

const router = Router()

/**
 * POST /api/free-ai/image
 * Pollinations 이미지 (API 키 불필요!)
 */
router.post('/image', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body

    const imageUrl = await freeAIHub.pollinationsImage(prompt)

    res.json({
      success: true,
      url: imageUrl,
      source: 'Pollinations.ai',
      cost: 0
    })
  } catch (error: any) {
    logger.error('Pollinations 이미지 실패:', error)
    res.status(500).json({
      success: false,
      error: '이미지 생성 실패'
    })
  }
})

/**
 * POST /api/free-ai/audio
 * Pollinations 오디오 (API 키 불필요!)
 */
router.post('/audio', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body

    const audioUrl = await freeAIHub.pollinationsAudio(prompt)

    res.json({
      success: true,
      url: audioUrl,
      source: 'Pollinations.ai',
      cost: 0
    })
  } catch (error: any) {
    logger.error('Pollinations 오디오 실패:', error)
    res.status(500).json({
      success: false,
      error: '오디오 생성 실패'
    })
  }
})

/**
 * POST /api/free-ai/chat
 * Groq 초고속 채팅
 */
router.post('/chat', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt, model } = req.body

    const result = await freeAIHub.groqChat(prompt, model)

    res.json(result)
  } catch (error: any) {
    logger.error('Groq 채팅 실패:', error)
    res.status(500).json({
      success: false,
      error: '채팅 실패'
    })
  }
})

/**
 * POST /api/free-ai/long-to-short
 * 긴 영상 → 숏폼 자동 변환
 */
router.post('/long-to-short', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { videoPath, transcript, options } = req.body

    const result = await longToShortConverter.convertLongToShorts(
      videoPath,
      transcript,
      options
    )

    res.json(result)
  } catch (error: any) {
    logger.error('긴 영상 변환 실패:', error)
    res.status(500).json({
      success: false,
      error: '변환 실패'
    })
  }
})

/**
 * POST /api/free-ai/voice-clone
 * 음성 클론
 */
router.post('/voice-clone', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { audioSample, text } = req.body

    const result = await freeAIHub.cloneVoice(audioSample, text)

    res.json(result)
  } catch (error: any) {
    logger.error('음성 클론 실패:', error)
    res.status(500).json({
      success: false,
      error: '음성 클론 실패'
    })
  }
})

/**
 * GET /api/free-ai/models
 * 사용 가능한 무료 AI 모델 목록
 */
router.get('/models', validateApiKey, async (req: Request, res: Response) => {
  try {
    const models = freeAIHub.getAvailableModels()

    res.json({
      success: true,
      models,
      totalFreeModels: 50
    })
  } catch (error: any) {
    logger.error('모델 목록 실패:', error)
    res.status(500).json({
      success: false,
      error: '모델 목록 조회 실패'
    })
  }
})

export default router

