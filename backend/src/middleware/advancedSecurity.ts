/**
 * 🔐 고급 보안 미들웨어 - 제로 트러스트 아키텍처
 * XSS, CSRF, SQL Injection, DDoS 방어
 */

import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { logger } from '../utils/logger'

// IP 차단 목록
const blockedIPs = new Set<string>()

// Rate limiting 저장소
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// 보안 이벤트 로그
interface SecurityEvent {
  timestamp: Date
  ip: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: string
}

const securityEvents: SecurityEvent[] = []

/**
 * 🛡️ XSS 방어
 */
export function xssProtection(req: Request, res: Response, next: NextFunction) {
  try {
    // 모든 입력 데이터를 검사
    const checkXSS = (obj: any): boolean => {
      if (typeof obj === 'string') {
        // XSS 패턴 감지
        const xssPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe/gi,
          /<object/gi,
          /<embed/gi
        ]

        for (const pattern of xssPatterns) {
          if (pattern.test(obj)) {
            logSecurityEvent(req, 'XSS_ATTEMPT', 'high', `Detected pattern: ${pattern}`)
            return true
          }
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (checkXSS(obj[key])) {
            return true
          }
        }
      }
      return false
    }

    if (checkXSS(req.body) || checkXSS(req.query) || checkXSS(req.params)) {
      return res.status(400).json({
        success: false,
        error: '잠재적 XSS 공격이 감지되었습니다'
      })
    }

    next()
  } catch (error: any) {
    logger.error('XSS 보호 오류:', error)
    next()
  }
}

/**
 * 💉 SQL Injection 방어
 */
export function sqlInjectionProtection(req: Request, res: Response, next: NextFunction) {
  try {
    const checkSQLInjection = (obj: any): boolean => {
      if (typeof obj === 'string') {
        const sqlPatterns = [
          /(\s|^)(select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)/gi,
          /union\s+select/gi,
          /;\s*(drop|delete|update)/gi,
          /--/g,
          /\/\*/g,
          /\*\//g,
          /'.*or.*'.*=/gi
        ]

        for (const pattern of sqlPatterns) {
          if (pattern.test(obj)) {
            logSecurityEvent(req, 'SQL_INJECTION_ATTEMPT', 'critical', `Detected pattern: ${pattern}`)
            return true
          }
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (checkSQLInjection(obj[key])) {
            return true
          }
        }
      }
      return false
    }

    if (checkSQLInjection(req.body) || checkSQLInjection(req.query)) {
      // IP 차단
      blockIP(getClientIP(req), 3600000) // 1시간

      return res.status(403).json({
        success: false,
        error: 'SQL Injection 시도가 감지되어 차단되었습니다'
      })
    }

    next()
  } catch (error: any) {
    logger.error('SQL Injection 보호 오류:', error)
    next()
  }
}

/**
 * 🚫 IP 차단 확인
 */
export function checkBlockedIP(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIP(req)

  if (blockedIPs.has(ip)) {
    logSecurityEvent(req, 'BLOCKED_IP_ACCESS', 'high', 'Blocked IP attempted access')

    return res.status(403).json({
      success: false,
      error: '접근이 차단되었습니다'
    })
  }

  next()
}

/**
 * ⚡ 고급 Rate Limiting
 */
export function advancedRateLimit(options: {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: Request) => string
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = options.keyGenerator ? options.keyGenerator(req) : getClientIP(req)
      const now = Date.now()

      let record = rateLimitStore.get(key)

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + options.windowMs
        }
        rateLimitStore.set(key, record)
      } else {
        record.count++

        if (record.count > options.maxRequests) {
          logSecurityEvent(req, 'RATE_LIMIT_EXCEEDED', 'medium', 
            `${record.count} requests in window`)

          // 임시 IP 차단 (과도한 요청)
          if (record.count > options.maxRequests * 3) {
            blockIP(key, 600000) // 10분
          }

          return res.status(429).json({
            success: false,
            error: '너무 많은 요청입니다. 잠시 후 다시 시도하세요.',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          })
        }
      }

      // 헤더에 rate limit 정보 추가
      res.setHeader('X-RateLimit-Limit', options.maxRequests)
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - record.count))
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())

      next()
    } catch (error: any) {
      logger.error('Rate limiting 오류:', error)
      next()
    }
  }
}

/**
 * 🔒 CSRF 토큰 검증
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // GET, HEAD, OPTIONS는 제외
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf

  if (!csrfToken) {
    logSecurityEvent(req, 'CSRF_TOKEN_MISSING', 'high', 'No CSRF token provided')

    return res.status(403).json({
      success: false,
      error: 'CSRF 토큰이 없습니다'
    })
  }

  // 토큰 검증 (세션 기반)
  const expectedToken = req.session?.csrfToken

  if (csrfToken !== expectedToken) {
    logSecurityEvent(req, 'CSRF_TOKEN_INVALID', 'high', 'Invalid CSRF token')

    return res.status(403).json({
      success: false,
      error: '유효하지 않은 CSRF 토큰입니다'
    })
  }

  next()
}

/**
 * 🌐 Origin 검증
 */
export function verifyOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin || req.headers.referer

  if (!origin) {
    return next() // Origin이 없으면 통과 (Postman 등)
  }

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173'
  ]

  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed))

  if (!isAllowed) {
    logSecurityEvent(req, 'INVALID_ORIGIN', 'medium', `Origin: ${origin}`)

    return res.status(403).json({
      success: false,
      error: '유효하지 않은 Origin입니다'
    })
  }

  next()
}

/**
 * 🔍 입력 검증
 */
export function validateInput(req: Request, res: Response, next: NextFunction) {
  try {
    // 파일 업로드 크기 제한
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length'])
      const maxSize = 100 * 1024 * 1024 // 100MB

      if (contentLength > maxSize) {
        return res.status(413).json({
          success: false,
          error: '파일 크기가 너무 큽니다'
        })
      }
    }

    // 특수 문자 제한
    const validateString = (str: string): boolean => {
      // 위험한 특수 문자 검사
      const dangerousChars = /[<>{}[\]`]/g
      return !dangerousChars.test(str)
    }

    const checkStrings = (obj: any): boolean => {
      if (typeof obj === 'string') {
        return validateString(obj)
      } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (!checkStrings(obj[key])) {
            return false
          }
        }
      }
      return true
    }

    if (!checkStrings(req.body) || !checkStrings(req.query)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 입력입니다'
      })
    }

    next()
  } catch (error: any) {
    logger.error('입력 검증 오류:', error)
    next()
  }
}

/**
 * 🛡️ 보안 헤더 설정
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // XSS 보호
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // 클릭재킹 방지
  res.setHeader('X-Frame-Options', 'DENY')

  // MIME 타입 스니핑 방지
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Referrer 정책
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // HSTS (HTTPS 강제)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )

  next()
}

/**
 * 📝 보안 이벤트 로깅
 */
function logSecurityEvent(
  req: Request,
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: string
) {
  const event: SecurityEvent = {
    timestamp: new Date(),
    ip: getClientIP(req),
    type,
    severity,
    details
  }

  securityEvents.push(event)

  // 최대 10000개만 저장
  if (securityEvents.length > 10000) {
    securityEvents.shift()
  }

  logger.warn(`🚨 보안 이벤트 [${severity}]: ${type} - ${details}`, {
    ip: event.ip,
    userAgent: req.headers['user-agent']
  })

  // Critical 이벤트는 즉시 알림
  if (severity === 'critical') {
    // TODO: 이메일/슬랙 알림
  }
}

/**
 * 🚫 IP 차단
 */
function blockIP(ip: string, duration: number) {
  blockedIPs.add(ip)

  setTimeout(() => {
    blockedIPs.delete(ip)
    logger.info(`✅ IP 차단 해제: ${ip}`)
  }, duration)

  logger.warn(`🚫 IP 차단: ${ip} (${duration}ms)`)
}

/**
 * 🌐 클라이언트 IP 가져오기
 */
function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

/**
 * 📊 보안 통계
 */
export function getSecurityStats() {
  const last24Hours = Date.now() - 24 * 60 * 60 * 1000
  const recentEvents = securityEvents.filter(e => e.timestamp.getTime() > last24Hours)

  return {
    totalEvents: securityEvents.length,
    last24Hours: recentEvents.length,
    blockedIPs: blockedIPs.size,
    byType: recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    bySeverity: recentEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    topAttackers: getTopAttackers(recentEvents, 10)
  }
}

/**
 * 🎯 주요 공격자 IP
 */
function getTopAttackers(events: SecurityEvent[], limit: number = 10) {
  const ipCounts = events.reduce((acc, event) => {
    acc[event.ip] = (acc[event.ip] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ip, count]) => ({ ip, count }))
}

/**
 * 🔒 데이터 암호화
 */
export function encryptSensitiveData(data: string): string {
  const algorithm = 'aes-256-gcm'
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * 🔓 데이터 복호화
 */
export function decryptSensitiveData(encryptedData: string): string {
  const algorithm = 'aes-256-gcm'
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32)

  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

export default {
  xssProtection,
  sqlInjectionProtection,
  checkBlockedIP,
  advancedRateLimit,
  csrfProtection,
  verifyOrigin,
  validateInput,
  securityHeaders,
  getSecurityStats,
  encryptSensitiveData,
  decryptSensitiveData
}

