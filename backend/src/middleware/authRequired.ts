/**
 * 인증 필수 미들웨어
 * 모든 보호된 라우트에 적용
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '로그인이 필요합니다',
      })
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as any

    // 데이터베이스에서 사용자 확인 (승인 상태 체크)
    const { getPrismaClient } = await import('../utils/database')
    const prisma = getPrismaClient()
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '사용자를 찾을 수 없습니다',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: '비활성화된 계정입니다',
      })
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        error: '관리자 승인 대기 중입니다. 곧 사용하실 수 있습니다.',
      })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    logger.warn('인증 실패:', error)
    return res.status(401).json({
      success: false,
      error: '유효하지 않은 토큰입니다',
    })
  }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '로그인이 필요합니다',
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '관리자 권한이 필요합니다',
    })
  }

  next()
}

