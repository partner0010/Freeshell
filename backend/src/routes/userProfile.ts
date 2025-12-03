/**
 * 사용자 프로필 관리 라우트
 */

import express from 'express'
import bcrypt from 'bcryptjs'
import { getPrismaClient } from '../utils/database'
import { requireAuth as authRequired } from '../middleware/authRequired'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * PUT /api/user/profile
 * 프로필 업데이트
 */
router.put('/profile', authRequired, async (req, res) => {
  try {
    const userId = (req as any).userId
    const { username, phone } = req.body

    const prisma = getPrismaClient()

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        phone,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isApproved: true,
        createdAt: true,
      },
    })

    res.json({
      success: true,
      data: updatedUser,
    })
  } catch (error: any) {
    logger.error('프로필 업데이트 실패:', error)
    res.status(500).json({
      success: false,
      error: '프로필 업데이트 실패',
    })
  }
})

/**
 * PUT /api/user/password
 * 비밀번호 변경
 */
router.put('/password', authRequired, async (req, res) => {
  try {
    const userId = (req as any).userId
    const { currentPassword, newPassword } = req.body

    // 비밀번호 보안 검증
    const checks = {
      length: newPassword.length >= 11,
      lowercase: /[a-z]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    }

    const allChecksPassed = Object.values(checks).every(Boolean)

    if (!allChecksPassed) {
      return res.status(400).json({
        success: false,
        error: '비밀번호가 보안 요구사항을 충족하지 않습니다',
      })
    }

    const prisma = getPrismaClient()

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다',
      })
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호가 일치하지 않습니다',
      })
    }

    // 새 비밀번호 해시
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    logger.info(`비밀번호 변경 완료: ${user.email}`)

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다',
    })
  } catch (error: any) {
    logger.error('비밀번호 변경 실패:', error)
    res.status(500).json({
      success: false,
      error: '비밀번호 변경 실패',
    })
  }
})

export default router

