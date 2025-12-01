import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email?: string
  }
}

/**
 * JWT 토큰 검증 미들웨어
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: '인증 토큰이 필요합니다'
    })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    logger.error('JWT_SECRET이 설정되지 않았습니다')
    return res.status(500).json({
      success: false,
      error: '서버 설정 오류'
    })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    req.user = {
      id: decoded.id,
      email: decoded.email
    }
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: '유효하지 않은 토큰입니다'
    })
  }
}

/**
 * API 키 검증 미들웨어 (간단한 인증용)
 */
export function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API 키가 필요합니다'
    })
  }

  const validApiKey = process.env.API_KEY
  if (!validApiKey) {
    logger.warn('API_KEY가 설정되지 않았습니다. 환경 변수를 설정하세요.')
    // 개발 환경에서는 경고만
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        error: '서버 설정 오류'
      })
    }
    return next() // 개발 환경에서는 통과
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      error: '유효하지 않은 API 키입니다'
    })
  }

  next()
}

