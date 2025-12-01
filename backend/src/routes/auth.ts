import { Router, Request, Response } from 'express'
import { getPrismaClient } from '../utils/database'
import { hashPassword, verifyPassword } from '../utils/encryption'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'
import { validateApiKey } from '../middleware/auth'

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: jwt_token_here
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

    // 비밀번호 해시
    const hashedPassword = hashPassword(password)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword
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
        username: user.username
      },
      token
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: jwt_token_here
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호는 필수입니다'
      })
    }

    const prisma = getPrismaClient()

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다'
      })
    }

    // 비밀번호 확인
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다'
      })
    }

    // JWT 토큰 생성
    const token = generateToken(user.id, user.email)

    logger.info('로그인 성공:', { userId: user.id, email: user.email })

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    })
  } catch (error: any) {
    logger.error('로그인 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
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
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
function generateToken(userId: string, email: string): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다')
  }

  return jwt.sign(
    { id: userId, email },
    jwtSecret,
    { expiresIn: '7d' } // 7일 유효
  )
}

export default router

