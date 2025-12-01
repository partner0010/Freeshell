import { Router, Request, Response } from 'express'
import { getPrismaClient } from '../utils/database'
import { hashPassword, verifyPassword } from '../utils/encryption'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * GET /api/user/profile
 * 사용자 프로필 조회
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = getPrismaClient()
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            contents: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다'
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (error: any) {
    logger.error('프로필 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/user/profile
 * 사용자 프로필 업데이트
 */
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = getPrismaClient()
    const userId = req.user?.id
    const { username, email } = req.body

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    // 중복 확인
    if (username || email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : [])
              ]
            }
          ]
        }
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '이미 사용 중인 이메일 또는 사용자명입니다'
        })
      }
    }

    const updateData: any = {}
    if (username) updateData.username = username
    if (email) updateData.email = email

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true
      }
    })

    logger.info('프로필 업데이트 성공:', { userId })

    res.json({
      success: true,
      user
    })
  } catch (error: any) {
    logger.error('프로필 업데이트 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/user/password
 * 비밀번호 변경
 */
router.put('/password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = getPrismaClient()
    const userId = req.user?.id
    const { currentPassword, newPassword } = req.body

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호와 새 비밀번호는 필수입니다'
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: '새 비밀번호는 최소 8자 이상이어야 합니다'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다'
      })
    }

    // 현재 비밀번호 확인
    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({
        success: false,
        error: '현재 비밀번호가 올바르지 않습니다'
      })
    }

    // 새 비밀번호 해시
    const hashedPassword = hashPassword(newPassword)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    logger.info('비밀번호 변경 성공:', { userId })

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다'
    })
  } catch (error: any) {
    logger.error('비밀번호 변경 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/user/stats
 * 사용자 통계 조회
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = getPrismaClient()
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다'
      })
    }

    const [contentCount, uploadCount, publishedCount] = await Promise.all([
      prisma.content.count({
        where: { userId }
      }),
      prisma.upload.count({
        where: {
          content: { userId }
        }
      }),
      prisma.upload.count({
        where: {
          content: { userId },
          status: 'completed'
        }
      })
    ])

    res.json({
      success: true,
      stats: {
        totalContents: contentCount,
        totalUploads: uploadCount,
        publishedContents: publishedCount
      }
    })
  } catch (error: any) {
    logger.error('통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

