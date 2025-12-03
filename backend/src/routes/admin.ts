/**
 * 관리자 전용 라우트
 */

import express from 'express'
import { getPrismaClient } from '../utils/database'
import { requireAuth, requireAdmin } from '../middleware/authRequired'
import { logger } from '../utils/logger'

const router = express.Router()

// 모든 라우트에 관리자 권한 필요
router.use(requireAuth)
router.use(requireAdmin)

/**
 * GET /api/admin/users/pending
 * 승인 대기 중인 사용자 목록
 */
router.get('/users/pending', async (req, res) => {
  try {
    const prisma = getPrismaClient()
    
    const pendingUsers = await prisma.user.findMany({
      where: {
        isApproved: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json({
      success: true,
      data: pendingUsers,
    })
  } catch (error: any) {
    logger.error('승인 대기 사용자 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/admin/users/:userId/approve
 * 사용자 승인
 */
router.post('/users/:userId/approve', async (req, res) => {
  try {
    const { userId } = req.params
    const adminId = (req as any).user.id
    const prisma = getPrismaClient()

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    })

    logger.info(`사용자 승인: ${user.email}`)

    res.json({
      success: true,
      message: '사용자가 승인되었습니다',
      data: user,
    })
  } catch (error: any) {
    logger.error('사용자 승인 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/admin/users/:userId/reject
 * 사용자 거부
 */
router.post('/users/:userId/reject', async (req, res) => {
  try {
    const { userId } = req.params
    const prisma = getPrismaClient()

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    })

    res.json({
      success: true,
      message: '사용자가 거부되었습니다',
    })
  } catch (error: any) {
    logger.error('사용자 거부 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * GET /api/admin/users
 * 모든 사용자 조회
 */
router.get('/users', async (req, res) => {
  try {
    const prisma = getPrismaClient()
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json({
      success: true,
      data: users,
    })
  } catch (error: any) {
    logger.error('사용자 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * GET /api/admin/stats
 * 관리자 통계
 */
router.get('/stats', async (req, res) => {
  try {
    const prisma = getPrismaClient()
    
    const [totalUsers, activeUsers, pendingUsers, totalContents] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true, isApproved: true } }),
      prisma.user.count({ where: { isApproved: false, isActive: true } }),
      prisma.content.count(),
    ])

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        pendingUsers,
        totalContents,
        totalRevenue: 0, // TODO: 실제 수익 계산
      },
    })
  } catch (error: any) {
    logger.error('통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

