/**
 * 🔐 Google OTP 라우트
 * 회원가입 시 등록, 로그인 시 인증
 */

import { Router, Request, Response } from 'express'
import { getPrismaClient } from '../utils/database'
import { googleOTP } from '../services/auth/googleOTP'
import { logger } from '../utils/logger'

const router = Router()

/**
 * POST /api/otp/generate
 * 회원가입 시 OTP Secret 생성
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({
        success: false,
        error: '사용자명이 필요합니다'
      })
    }

    // OTP Secret 생성
    const otpData = googleOTP.generateSecret(username)
    
    // QR 코드 생성
    const qrCode = await googleOTP.generateQRCode(otpData.qrCodeUrl)

    // 백업 코드 생성
    const backupCodes = googleOTP.generateBackupCodes(10)

    logger.info(`🔐 OTP 생성: ${username}`)

    res.json({
      success: true,
      secret: otpData.secret,
      qrCode,
      backupCodes,
      message: 'Google Authenticator 앱으로 QR 코드를 스캔하세요'
    })
  } catch (error: any) {
    logger.error('OTP 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: 'OTP 생성 실패'
    })
  }
})

/**
 * POST /api/otp/verify
 * OTP 토큰 검증
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { secret, token } = req.body

    if (!secret || !token) {
      return res.status(400).json({
        success: false,
        error: 'Secret과 토큰이 필요합니다'
      })
    }

    const isValid = googleOTP.verifyToken(secret, token)

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'OTP 토큰이 올바르지 않습니다'
      })
    }

    logger.info('✅ OTP 검증 성공')

    res.json({
      success: true,
      message: 'OTP 인증 성공'
    })
  } catch (error: any) {
    logger.error('OTP 검증 실패:', error)
    res.status(500).json({
      success: false,
      error: 'OTP 검증 실패'
    })
  }
})

export default router

