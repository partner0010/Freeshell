import { Router, Request, Response } from 'express'
import { getPrismaClient } from '../utils/database'
import { hashPassword, verifyPassword } from '../utils/encryption'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'
import { validateApiKey } from '../middleware/auth'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const router = Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: username
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: password123
 *     responses:
 *       200:
 *         description: 회원가입 성공
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일, 사용자명, 비밀번호는 필수입니다'
      })
    }

    // 비밀번호 길이 확인
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: '비밀번호는 최소 8자 이상이어야 합니다'
      })
    }

    const prisma = getPrismaClient()

    // 중복 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 이메일 또는 사용자명입니다'
      })
    }

    // 비밀번호 보안 검증
    const checks = {
      length: password.length >= 11,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    }

    const allChecksPassed = Object.values(checks).every(Boolean)

    if (!allChecksPassed) {
      return res.status(400).json({
        success: false,
        error: '비밀번호는 11자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다',
      })
    }

    // 비밀번호 해시
    const hashedPassword = hashPassword(password)

    // 사용자 생성 - 일반 사용자는 승인 대기 상태
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        isApproved: false, // 관리자 승인 필요
        isEmailVerified: false,
      }
    })

    // AI 사용량 제한 설정
    await prisma.aIUsageLimit.create({
      data: {
        userId: user.id,
        dailyLimit: 100,
        monthlyLimit: 3000,
      }
    })

    // JWT 토큰 생성
    const token = generateToken(user.id, user.email)

    logger.info('회원가입 성공:', { userId: user.id, email: user.email })

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
      },
      token,
      message: '회원가입이 완료되었습니다. 관리자 승인 후 모든 기능을 사용할 수 있습니다.'
    })
  } catch (error: any) {
    logger.error('회원가입 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // username 또는 email로 로그인 가능
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '아이디와 비밀번호는 필수입니다'
      })
    }

    const prisma = getPrismaClient()

    // 사용자 찾기 (username 또는 email)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username } // 이메일로도 로그인 가능
        ]
      }
    })

    if (!user) {
      logger.warn('존재하지 않는 사용자 로그인 시도:', { username })
      return res.status(401).json({
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다'
      })
    }

    // 비밀번호 확인
    if (!verifyPassword(password, user.password)) {
      logger.warn('비밀번호 불일치:', { username })
      return res.status(401).json({
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다'
      })
    }

    // 관리자가 아닌 경우 승인 상태 확인
    if (user.role !== 'admin') {
      // isVerified 필드로 승인 여부 확인
      if (!user.isVerified) {
        logger.warn('미승인 사용자 로그인 시도:', { username: user.username })
        return res.status(403).json({
          success: false,
          error: '관리자 승인 대기 중입니다. 관리자 승인 후 로그인할 수 있습니다.'
        })
      }
    }

    // 계정 활성화 확인
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.'
      })
    }

    // 관리자는 승인 체크 제외, 일반 사용자만 승인 체크
    if (user.role !== 'admin' && !user.isApproved) {
      return res.status(401).json({
        success: false,
        error: '관리자 승인 대기 중입니다. 승인 후 로그인이 가능합니다.'
      })
    }

    // JWT 토큰 생성
    const token = generateToken(user.id, user.email, user.role)

    logger.info('로그인 성공:', { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      isAdmin: user.role === 'admin'
    })

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
        isActive: user.isActive,
      },
      token,
      message: `환영합니다, ${user.username}님!`
    })
  } catch (error: any) {
    logger.error('로그인 실패:', error)
    res.status(500).json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.'
    })
  }
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 사용자 정보 조회
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', validateApiKey, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다'
      })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        error: '서버 설정 오류'
      })
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any
      const prisma = getPrismaClient()

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          isApproved: true,
          createdAt: true
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
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      })
    }
  } catch (error: any) {
    logger.error('사용자 정보 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * JWT 토큰 생성
 */
function generateToken(userId: string, email: string, role?: string): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다')
  }

  return jwt.sign(
    { 
      id: userId, 
      email,
      role: role || 'user'
    },
    jwtSecret,
    { expiresIn: '30d' } // 30일 유효
  )
}

/**
 * POST /api/auth/forgot-password
 * 비밀번호 찾기 (이메일 발송)
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    const prisma = getPrismaClient()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // 보안상 사용자가 없어도 성공 응답
      return res.json({
        success: true,
        message: '비밀번호 재설정 이메일이 발송되었습니다',
      })
    }

    // 재설정 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1시간

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: resetToken,
        verificationExpiry: resetExpiry,
      },
    })

    // 재설정 URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

    console.log('\n========================================')
    console.log('🔐 비밀번호 재설정 링크:')
    console.log(resetUrl)
    console.log('========================================\n')

    res.json({
      success: true,
      message: '비밀번호 재설정 링크가 생성되었습니다 (콘솔 확인)',
      resetUrl, // 개발 환경에서만
    })
  } catch (error: any) {
    logger.error('비밀번호 찾기 실패:', error)
    res.status(500).json({
      success: false,
      error: '비밀번호 찾기 실패',
    })
  }
})

/**
 * POST /api/auth/reset-password
 * 비밀번호 재설정
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

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
        error: '비밀번호는 11자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다',
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
        error: '유효하지 않거나 만료된 재설정 링크입니다',
      })
    }

    // 새 비밀번호 해시
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerificationToken: null,
        verificationExpiry: null,
      },
    })

    logger.info(`비밀번호 재설정 완료: ${user.email}`)

    res.json({
      success: true,
      message: '비밀번호가 재설정되었습니다',
    })
  } catch (error: any) {
    logger.error('비밀번호 재설정 실패:', error)
    res.status(500).json({
      success: false,
      error: '비밀번호 재설정 실패',
    })
  }
})

export default router
