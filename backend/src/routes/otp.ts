/**
 * 🔐 Google OTP 라우트
 * 2단계 인증 설정 및 검증
 */

import { Router, Request, Response } from 'express'
import { getPrismaClient } from '../utils/database'
import { validateApiKey } from '../middleware/auth'
import { googleOTP } from '../services/auth/googleOTP'
import { logger } from '../utils/logger'
import jwt from 'jsonwebtoken'

const router = Router()

/**
 * POST /api/otp/setup
 * OTP 설정 (QR 코드 생성)
 */
router.post('/setup', validateApiKey, async (req: Request, res: Response) => {
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
    const prisma = getPrismaClient()

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다'
      })
    }

    // OTP Secret 생성
    const otpData = googleOTP.generateSecret(user.username)
    const qrCode = await googleOTP.generateQRCode(otpData.qrCodeUrl)

    // 백업 코드 생성
    const backupCodes = googleOTP.generateBackupCodes(10)

    // TODO: Secret과 백업 코드를 데이터베이스에 저장
    // (현재는 응답으로만 전달)

    logger.info(`🔐 OTP 설정: ${user.username}`)

    res.json({
      success: true,
      data: {
        qrCode, // QR 코드 이미지 (Data URL)
        secret: otpData.secret, // Manual entry용
        backupCodes // 백업 코드 (안전하게 보관 필요)
      },
      message: 'Google Authenticator 앱으로 QR 코드를 스캔하세요'
    })
  } catch (error: any) {
    logger.error('OTP 설정 실패:', error)
    res.status(500).json({
      success: false,
      error: 'OTP 설정 실패'
    })
  }
})

/**
 * POST /api/otp/verify
 * OTP 토큰 검증
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { username, password, otpToken } = req.body

    if (!username || !password || !otpToken) {
      return res.status(400).json({
        success: false,
        error: '아이디, 비밀번호, OTP 토큰은 필수입니다'
      })
    }

    const prisma = getPrismaClient()

    // 사용자 찾기 (아이디로!)
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다'
      })
    }

    // 비밀번호 확인
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다'
      })
    }

    // OTP 검증
    // TODO: 데이터베이스에서 secret 가져오기
    const otpSecret = 'user-stored-secret' // 실제로는 DB에서
    const isValidOTP = googleOTP.verifyToken(otpSecret, otpToken)

    if (!isValidOTP) {
      return res.status(401).json({
        success: false,
        error: 'OTP 토큰이 올바르지 않습니다'
      })
    }

    // JWT 토큰 생성
    const jwtToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    logger.info(`✅ OTP 로그인 성공: ${user.username}`)

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      token: jwtToken
    })
  } catch (error: any) {
    logger.error('OTP 검증 실패:', error)
    res.status(500).json({
      success: false,
      error: 'OTP 검증 실패'
    })
  }
})

/**
 * POST /api/otp/disable
 * OTP 비활성화
 */
router.post('/disable', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { otpToken } = req.body
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // OTP 검증 후 비활성화
    // TODO: 실제 구현

    logger.info(`🔓 OTP 비활성화: ${decoded.username}`)

    res.json({
      success: true,
      message: 'OTP가 비활성화되었습니다'
    })
  } catch (error: any) {
    logger.error('OTP 비활성화 실패:', error)
    res.status(500).json({
      success: false,
      error: 'OTP 비활성화 실패'
    })
  }
})

export default router

