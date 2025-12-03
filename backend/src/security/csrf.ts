import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

interface CsrfTokenStore {
  [key: string]: {
    token: string
    expires: number
  }
}

const tokenStore: CsrfTokenStore = {}
const TOKEN_EXPIRY = 60 * 60 * 1000 // 1시간

/**
 * CSRF 토큰 생성
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * CSRF 토큰 저장
 */
export function storeCsrfToken(sessionId: string, token: string): void {
  tokenStore[sessionId] = {
    token,
    expires: Date.now() + TOKEN_EXPIRY
  }
}

/**
 * CSRF 토큰 검증
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = tokenStore[sessionId]
  
  if (!stored) {
    return false
  }
  
  if (stored.expires < Date.now()) {
    delete tokenStore[sessionId]
    return false
  }
  
  return stored.token === token
}

/**
 * CSRF 보호 미들웨어
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // GET, HEAD, OPTIONS 요청은 검증하지 않음
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }
  
  const csrfToken = req.headers['x-csrf-token'] as string
  const sessionId = req.headers['x-session-id'] as string || req.ip || 'anonymous'
  
  if (!csrfToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF 토큰이 필요합니다'
    })
  }
  
  if (!verifyCsrfToken(sessionId, csrfToken)) {
    return res.status(403).json({
      success: false,
      error: '유효하지 않은 CSRF 토큰입니다'
    })
  }
  
  next()
}

/**
 * CSRF 토큰 발급 엔드포인트용 핸들러
 */
export function getCsrfToken(req: Request, res: Response) {
  const sessionId = req.headers['x-session-id'] as string || req.ip || 'anonymous'
  const token = generateCsrfToken()
  
  storeCsrfToken(sessionId, token)
  
  res.json({
    success: true,
    csrfToken: token
  })
}

// 만료된 토큰 정리 (1시간마다)
setInterval(() => {
  const now = Date.now()
  Object.keys(tokenStore).forEach(sessionId => {
    if (tokenStore[sessionId].expires < now) {
      delete tokenStore[sessionId]
    }
  })
}, 60 * 60 * 1000)

