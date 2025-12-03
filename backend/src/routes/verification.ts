/**
 * 본인 인증 라우트
 */

import express from 'express'
import { getPrismaClient } from '../utils/database'
import { emailService } from '../services/verification/emailService'
import { smsService } from '../services/verification/smsService'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * POST /api/verification/send-email
 * 이메일 인증 코드 발송
 */
router.post('/send-email', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '이메일을 입력해주세요',
      })
    }

    const prisma = getPrismaClient()

    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing && existing.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: '이미 인증된 이메일입니다',
      })
    }

    // 인증 토큰 생성
    const token = emailService.generateVerificationToken()
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간

    // 임시 사용자 생성 또는 업데이트
    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        username: email.split('@')[0],
        password: 'TEMP', // 이메일 인증 후 설정
        emailVerificationToken: token,
        verificationExpiry: expiry,
      },
      update: {
        emailVerificationToken: token,
        verificationExpiry: expiry,
      },
    })

    // 이메일 발송
    await emailService.sendVerificationEmail(email, token)

    res.json({
      success: true,
      message: '인증 이메일이 발송되었습니다',
    })
  } catch (error: any) {
    logger.error('이메일 인증 발송 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/verification/verify-email
 * 이메일 인증 확인
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        error: '인증 토큰이 필요합니다',
      })
    }

    const prisma = getPrismaClient()

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        verificationExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않거나 만료된 인증 링크입니다',
      })
    }

    // 이메일 인증 완료
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        verificationExpiry: null,
      },
    })

    logger.info(`✅ 이메일 인증 완료: ${user.email}`)

    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다',
    })
  } catch (error: any) {
    logger.error('이메일 인증 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/verification/send-sms
 * SMS 인증 코드 발송
 */
router.post('/send-sms', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: '핸드폰 번호를 입력해주세요',
      })
    }

    // 인증 코드 생성
    const code = smsService.generateVerificationCode()
    const expiry = new Date(Date.now() + 5 * 60 * 1000) // 5분

    const prisma = getPrismaClient()

    // 임시 저장
    await prisma.user.upsert({
      where: { phone },
      create: {
        email: `${phone}@temp.com`,
        username: phone,
        password: 'TEMP',
        phone,
        phoneVerificationCode: code,
        verificationExpiry: expiry,
      },
      update: {
        phoneVerificationCode: code,
        verificationExpiry: expiry,
      },
    })

    // SMS 발송
    await smsService.sendVerificationSMS(phone, code)

    res.json({
      success: true,
      message: 'SMS 인증 코드가 발송되었습니다',
    })
  } catch (error: any) {
    logger.error('SMS 발송 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/verification/verify-sms
 * SMS 인증 코드 확인
 */
router.post('/verify-sms', async (req, res) => {
  try {
    const { phone, code } = req.body

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        error: '핸드폰 번호와 인증 코드를 입력해주세요',
      })
    }

    const prisma = getPrismaClient()

    const user = await prisma.user.findFirst({
      where: {
        phone,
        phoneVerificationCode: code,
        verificationExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않거나 만료된 인증 코드입니다',
      })
    }

    // SMS 인증 완료
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        phoneVerificationCode: null,
      },
    })

    logger.info(`✅ SMS 인증 완료: ${phone}`)

    res.json({
      success: true,
      message: 'SMS 인증이 완료되었습니다',
    })
  } catch (error: any) {
    logger.error('SMS 인증 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

