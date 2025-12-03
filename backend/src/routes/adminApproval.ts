/**
 * 👑 관리자 승인 시스템
 * 사용자 승인/거부 관리
 */

import { Router, Request, Response } from 'express'
import { getPrismaClient } from '../utils/database'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'
import jwt from 'jsonwebtoken'

const router = Router()

/**
 * GET /api/admin/pending-users
 * 승인 대기 중인 사용자 목록
 */
router.get('/pending-users', validateApiKey, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // 관리자 확인
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다'
      })
    }

    const prisma = getPrismaClient()

    // 승인 대기 중인 사용자 목록
    const pendingUsers = await prisma.user.findMany({
      where: {
        isVerified: false,
        role: { not: 'admin' } // 관리자는 제외
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    logger.info(`📋 승인 대기 사용자 조회: ${pendingUsers.length}명`)

    res.json({
      success: true,
      users: pendingUsers,
      count: pendingUsers.length
    })
  } catch (error: any) {
    logger.error('승인 대기 사용자 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: '사용자 목록 조회 실패'
    })
  }
})

/**
 * POST /api/admin/approve-user
 * 사용자 승인
 */
router.post('/approve-user', validateApiKey, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // 관리자 확인
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다'
      })
    }

    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다'
      })
    }

    const prisma = getPrismaClient()

    // 사용자 승인
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true }
    })

    logger.info(`✅ 사용자 승인: ${user.username} (${user.email})`)

    res.json({
      success: true,
      message: '사용자가 승인되었습니다',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error: any) {
    logger.error('사용자 승인 실패:', error)
    res.status(500).json({
      success: false,
      error: '사용자 승인 실패'
    })
  }
})

/**
 * POST /api/admin/reject-user
 * 사용자 거부 (삭제)
 */
router.post('/reject-user', validateApiKey, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // 관리자 확인
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다'
      })
    }

    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다'
      })
    }

    const prisma = getPrismaClient()

    // 사용자 삭제
    const user = await prisma.user.delete({
      where: { id: userId }
    })

    logger.info(`❌ 사용자 거부 및 삭제: ${user.username} (${user.email})`)

    res.json({
      success: true,
      message: '사용자가 거부되었습니다'
    })
  } catch (error: any) {
    logger.error('사용자 거부 실패:', error)
    res.status(500).json({
      success: false,
      error: '사용자 거부 실패'
    })
  }
})

/**
 * GET /api/admin/all-users
 * 모든 사용자 목록
 */
router.get('/all-users', validateApiKey, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // 관리자 확인
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다'
      })
    }

    const prisma = getPrismaClient()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      users,
      count: users.length
    })
  } catch (error: any) {
    logger.error('사용자 목록 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: '사용자 목록 조회 실패'
    })
  }
})

export default router

