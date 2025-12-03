/**
 * 통합 AI 대화 API
 */

import { Router, Request, Response } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { unifiedAIChat, AIService } from '../services/ai/unifiedAIChat'
import { usageLimiter } from '../services/ai/usageLimiter'
import { logger } from '../utils/logger'
import { validateNoSQLInjection, sanitizeInput } from '../middleware/inputValidation'
import { permissionChecker, requireAdmin } from '../utils/permissions'

const router = Router()

/**
 * POST /api/ai-chat
 * AI와 대화
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { message, aiService, conversationId, systemPrompt, options } = req.body

    // 입력 검증
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: '메시지가 필요합니다'
      })
    }

    // SQL Injection 방지
    if (!validateNoSQLInjection(message)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 입력입니다'
      })
    }

    // 입력 Sanitization
    const sanitizedMessage = sanitizeInput(message)
    const sanitizedSystemPrompt = systemPrompt ? sanitizeInput(systemPrompt) : undefined

    // AI 서비스 검증 (단일 또는 배열)
    const validServices: AIService[] = ['openai', 'claude', 'gemini', 'nanobana', 'kling', 'supertone', 'all']
    
    let selectedServices: AIService | AIService[]
    if (Array.isArray(aiService)) {
      // 배열인 경우 각 서비스 검증
      const invalidServices = aiService.filter(s => !validServices.includes(s as AIService))
      if (invalidServices.length > 0) {
        return res.status(400).json({
          success: false,
          error: `지원하지 않는 AI 서비스: ${invalidServices.join(', ')}`
        })
      }
      selectedServices = aiService as AIService[]
    } else {
      selectedServices = (aiService || 'all') as AIService
      if (!validServices.includes(selectedServices)) {
        return res.status(400).json({
          success: false,
          error: `지원하지 않는 AI 서비스: ${selectedServices}`
        })
      }
    }

    // 사용 가능한 AI 서비스 확인
    const availableServices = unifiedAIChat.getAvailableAIServices()
    const servicesToCheck = Array.isArray(selectedServices) ? selectedServices : [selectedServices]
    
    for (const service of servicesToCheck) {
      if (service !== 'all' && !availableServices.includes(service)) {
        return res.status(400).json({
          success: false,
          error: `${service} AI 서비스가 사용할 수 없습니다. API 키를 설정하세요.`
        })
      }
    }

    logger.info('AI 대화 요청:', {
      userId: req.user?.id,
      aiService: selectedServices,
      messageLength: sanitizedMessage.length
    })

    // AI 대화 실행
    const response = await unifiedAIChat.chat({
      message: sanitizedMessage,
      aiService: selectedServices,
      conversationId,
      systemPrompt: sanitizedSystemPrompt,
      options
    })

    res.json({
      success: true,
      data: response
    })

  } catch (error: any) {
    logger.error('AI 대화 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'AI 대화 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/ai-chat/conversation/:conversationId
 * 대화 기록 조회
 */
router.get('/conversation/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params
    const messages = await unifiedAIChat.getConversation(conversationId, req.user?.id)

    res.json({
      success: true,
      data: {
        conversationId,
        messages
      }
    })
  } catch (error: any) {
    logger.error('대화 기록 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '대화 기록 조회 중 오류가 발생했습니다'
    })
  }
})

/**
 * DELETE /api/ai-chat/conversation/:conversationId
 * 대화 기록 삭제
 */
router.delete('/conversation/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params
    await unifiedAIChat.deleteConversation(conversationId, req.user?.id)

    res.json({
      success: true,
      message: '대화 기록이 삭제되었습니다'
    })
  } catch (error: any) {
    logger.error('대화 기록 삭제 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '대화 기록 삭제 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/ai-chat/conversations
 * 사용자의 모든 대화 목록 조회
 */
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100) // 최대 100개
    const offset = parseInt(req.query.offset as string) || 0
    
    const result = await unifiedAIChat.getUserConversations(req.user?.id || '', limit, offset)

    res.json({
      success: true,
      data: {
        conversations: result.conversations,
        total: result.total,
        hasMore: result.hasMore,
        limit,
        offset
      }
    })
  } catch (error: any) {
    logger.error('대화 목록 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '대화 목록 조회 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/ai-chat/usage
 * 사용자의 AI 사용량 조회
 */
router.get('/usage', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    const usageLimit = await usageLimiter.checkLimit(req.user.id)

    res.json({
      success: true,
      data: {
        daily: {
          used: usageLimit.dailyUsed,
          limit: usageLimit.dailyLimit,
          remaining: usageLimit.remainingDaily
        },
        monthly: {
          used: usageLimit.monthlyUsed,
          limit: usageLimit.monthlyLimit,
          remaining: usageLimit.remainingMonthly
        },
        canUse: usageLimit.canUse
      }
    })
  } catch (error: any) {
    logger.error('사용량 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '사용량 조회 중 오류가 발생했습니다'
    })
  }
})

/**
 * PUT /api/ai-chat/usage/limit
 * 사용자 제한 설정 업데이트 (관리자용)
 */
router.put('/usage/limit', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    // 관리자 권한 확인
    const { dailyLimit, monthlyLimit, targetUserId } = req.body
    const targetId = targetUserId || req.user?.id
    
    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다'
      })
    }
    
    // 자신의 제한만 수정 가능 (관리자는 모든 사용자 수정 가능)
    if (targetId !== req.user?.id) {
      const isAdmin = await permissionChecker.isAdmin(req.user?.id || '')
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          error: '관리자 권한이 필요합니다',
          code: 'ADMIN_REQUIRED'
        })
      }
    }

    if (dailyLimit !== undefined && (typeof dailyLimit !== 'number' || dailyLimit < 0)) {
      return res.status(400).json({
        success: false,
        error: '일일 제한은 0 이상의 숫자여야 합니다'
      })
    }

    if (monthlyLimit !== undefined && (typeof monthlyLimit !== 'number' || monthlyLimit < 0)) {
      return res.status(400).json({
        success: false,
        error: '월간 제한은 0 이상의 숫자여야 합니다'
      })
    }

    const updated = await usageLimiter.updateLimit(
      targetId,
      dailyLimit,
      monthlyLimit
    )

    res.json({
      success: true,
      data: updated
    })
  } catch (error: any) {
    logger.error('제한 설정 업데이트 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '제한 설정 업데이트 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/ai-chat/services
 * 사용 가능한 AI 서비스 목록 조회
 */
router.get('/services', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const availableServices = unifiedAIChat.getAvailableAIServices()

    const serviceInfo = {
      openai: {
        name: 'OpenAI GPT-4',
        available: availableServices.includes('openai'),
        description: '고급 텍스트 생성 및 대화'
      },
      claude: {
        name: 'Claude (Anthropic)',
        available: availableServices.includes('claude'),
        description: '안전하고 정확한 대화 AI'
      },
      gemini: {
        name: 'Google Gemini 3',
        available: availableServices.includes('gemini'),
        description: 'Google의 최신 멀티모달 AI'
      },
      nanobana: {
        name: 'NanoBana AI',
        available: availableServices.includes('nanobana'),
        description: '이미지 및 캐릭터 생성'
      },
      kling: {
        name: 'Kling AI',
        available: availableServices.includes('kling'),
        description: '고화질 동영상 생성'
      },
      supertone: {
        name: 'SuperTone AI',
        available: availableServices.includes('supertone'),
        description: '고품질 음성/나레이션 생성'
      },
      all: {
        name: '모든 AI 통합',
        available: availableServices.includes('all'),
        description: '모든 AI의 응답을 통합하여 최선의 답변 제공'
      }
    }

    res.json({
      success: true,
      data: {
        available: availableServices,
        services: serviceInfo
      }
    })
  } catch (error: any) {
    logger.error('AI 서비스 목록 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'AI 서비스 목록 조회 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/ai-chat/search
 * 대화 기록 검색
 */
router.get('/search', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    const query = req.query.q as string
    const limit = parseInt(req.query.limit as string) || 20

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '검색어를 입력하세요'
      })
    }

    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        error: '검색어는 최소 2자 이상이어야 합니다'
      })
    }

    const results = await unifiedAIChat.searchConversations(req.user.id, query.trim(), limit)

    res.json({
      success: true,
      data: {
        query: query.trim(),
        results,
        total: results.length
      }
    })
  } catch (error: any) {
    logger.error('대화 검색 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '대화 검색 중 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/ai-chat/message/:messageId/rate
 * 메시지 평가 (좋아요/싫어요)
 */
router.post('/message/:messageId/rate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    const { messageId } = req.params
    const { rating } = req.body

    if (rating !== 1 && rating !== -1) {
      return res.status(400).json({
        success: false,
        error: '평가는 1 (좋아요) 또는 -1 (싫어요)만 가능합니다'
      })
    }

    await unifiedAIChat.rateMessage(messageId, rating, req.user.id)

    res.json({
      success: true,
      message: rating === 1 ? '좋아요가 반영되었습니다' : '싫어요가 반영되었습니다'
    })
  } catch (error: any) {
    logger.error('메시지 평가 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '메시지 평가 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/ai-chat/rating/stats
 * 평가 통계 조회
 */
router.get('/rating/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    const stats = await unifiedAIChat.getRatingStats(req.user.id)

    res.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    logger.error('평가 통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '평가 통계 조회 중 오류가 발생했습니다'
    })
  }
})

export default router

