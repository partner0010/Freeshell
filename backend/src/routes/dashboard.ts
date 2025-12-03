/**
 * 대시보드 API
 */

import express from 'express'
import { getPrismaClient } from '../utils/database'
import { requireAuth as authRequired } from '../middleware/authRequired'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * GET /api/dashboard/stats
 * 사용자 통계
 */
router.get('/stats', authRequired, async (req, res) => {
  try {
    const userId = (req as any).userId
    const prisma = getPrismaClient()

    // 콘텐츠 개수
    const totalContents = await prisma.content.count({
      where: { userId },
    })

    // AI 대화 개수
    const totalConversations = await prisma.aIConversation.count({
      where: { userId },
    })

    // 메시지 개수
    const totalMessages = await prisma.aIMessage.count({
      where: {
        conversation: {
          userId,
        },
      },
    })

    // AI 사용량
    const usageLimit = await prisma.aIUsageLimit.findUnique({
      where: { userId },
    })

    // 최근 활동 (콘텐츠)
    const recentContents = await prisma.content.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        topic: true,
        contentType: true,
        createdAt: true,
      },
    })

    const recentActivity = recentContents.map((content) => ({
      id: content.id,
      type: content.contentType,
      title: content.topic,
      createdAt: content.createdAt,
    }))

    res.json({
      success: true,
      data: {
        totalContents,
        totalConversations,
        totalMessages,
        aiUsageToday: usageLimit?.dailyUsed || 0,
        aiUsageMonth: usageLimit?.monthlyUsed || 0,
        recentActivity,
      },
    })
  } catch (error: any) {
    logger.error('대시보드 통계 로드 실패:', error)
    res.status(500).json({
      success: false,
      error: '통계를 불러올 수 없습니다',
    })
  }
})

export default router

