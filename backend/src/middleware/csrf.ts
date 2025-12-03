/**
 * CSRF 보호 미들웨어
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import crypto from 'crypto'

// CSRF 토큰 저장소 (실제로는 Redis 사용 권장)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>()

// 토큰 만료 시간 (30분)
const TOKEN_EXPIRY = 30 * 60 * 1000

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(req: Request): string {
  const token = crypto.randomBytes(32).toString('hex')
  const sessionId = (req as any).sessionID || req.ip || 'anonymous'
  
  csrfTokens.set(sessionId, {
    token,
    expiresAt: Date.now() + TOKEN_EXPIRY
  })
  
  // 만료된 토큰 정리
  cleanupExpiredTokens()
  
  return token
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(req: Request, token: string): boolean {
  const sessionId = (req as any).sessionID || req.ip || 'anonymous'
  const stored = csrfTokens.get(sessionId)
  
  if (!stored) {
    return false
  }
  
  // 만료 확인
  if (Date.now() > stored.expiresAt) {
    csrfTokens.delete(sessionId)
    return false
  }
  
  // 토큰 일치 확인
  return stored.token === token
}

/**
 * 만료된 토큰 정리
 */
function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(sessionId)
    }
  }
}

/**
 * CSRF 보호 미들웨어
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // GET, HEAD, OPTIONS는 CSRF 검증 제외
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // 헤더에서 CSRF 토큰 확인
  const token = req.headers['x-csrf-token'] as string

  if (!token) {
    logger.warn('CSRF 토큰 없음:', { ip: req.ip, path: req.path })
    return res.status(403).json({
      success: false,
      error: 'CSRF 토큰이 필요합니다'
    })
  }

  // 토큰 검증
  if (!verifyCSRFToken(req, token)) {
    logger.warn('CSRF 토큰 검증 실패:', { ip: req.ip, path: req.path })
    return res.status(403).json({
      success: false,
      error: '유효하지 않은 CSRF 토큰입니다'
    })
  }

  next()
}

/**
 * CSRF 토큰 제공 엔드포인트
 */
export function getCSRFToken(req: Request, res: Response) {
  const token = generateCSRFToken(req)
  res.json({
    success: true,
    csrfToken: token
  })
}

