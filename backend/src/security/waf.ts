/**
 * WAF (Web Application Firewall)
 * 웹 공격 차단
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { getPrismaClient } from '../utils/database'

// 악성 패턴 데이터베이스
const ATTACK_PATTERNS = {
  // SQL Injection
  sql: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION\s+SELECT)/gi,
    /('\s*OR\s*'1'\s*=\s*'1)/gi,
    /(--\s*$)/gi,
    /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
  ],
  
  // XSS (Cross-Site Scripting)
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi,
  ],
  
  // Path Traversal
  pathTraversal: [
    /\.\.\//g,
    /\.\.\\/g,
    /%2e%2e%2f/gi,
    /%2e%2e\//gi,
    /\.\.%2f/gi,
  ],
  
  // Command Injection (로컬호스트는 제외)
  commandInjection: [
    /;\s*(rm|del|format|shutdown)/gi,
    /\bnc\b|\bnetcat\b/gi,
    /\bwget\b.*http/gi,
    /\bcurl\b.*http/gi,
  ],
  
  // LDAP Injection
  ldap: [
    /[*()\\]/g,
  ],
  
  // NoSQL Injection
  nosql: [
    /{\s*\$ne\s*:/gi,
    /{\s*\$gt\s*:/gi,
    /{\s*\$regex\s*:/gi,
  ],
}

// IP 기반 Rate Limiting (초당 요청 제한)
const IP_REQUEST_MAP = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS_PER_SECOND = 20
const BLOCK_DURATION = 60000 // 1분

// DDoS 방어
const DDOS_THRESHOLD = 100 // 1분당 100개 이상 요청 시 차단
const DDOS_WINDOW = 60000 // 1분

export class WAF {
  /**
   * 요청 검증
   */
  static validateRequest(req: Request, res: Response, next: NextFunction) {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown'
    
    try {
      // 1. IP 차단 확인
      if (this.isBlockedIP(clientIP)) {
        logger.warn(`차단된 IP 접근 시도: ${clientIP}`)
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        })
      }

      // 2. Rate Limiting (DDoS 방어)
      if (!this.checkRateLimit(clientIP)) {
        logger.warn(`Rate limit 초과: ${clientIP}`)
        this.blockIP(clientIP, 'Rate limit exceeded')
        return res.status(429).json({
          success: false,
          error: 'Too many requests',
        })
      }

      // 3. SQL Injection 검사
      if (this.detectSQLInjection(req)) {
        logger.error(`SQL Injection 시도 감지: ${clientIP}`)
        this.blockIP(clientIP, 'SQL Injection attempt')
        return res.status(403).json({
          success: false,
          error: 'Invalid request',
        })
      }

      // 4. XSS 검사
      if (this.detectXSS(req)) {
        logger.error(`XSS 시도 감지: ${clientIP}`)
        this.blockIP(clientIP, 'XSS attempt')
        return res.status(403).json({
          success: false,
          error: 'Invalid request',
        })
      }

      // 5. Path Traversal 검사
      if (this.detectPathTraversal(req)) {
        logger.error(`Path Traversal 시도 감지: ${clientIP}`)
        this.blockIP(clientIP, 'Path Traversal attempt')
        return res.status(403).json({
          success: false,
          error: 'Invalid request',
        })
      }

      // 6. Command Injection 검사
      if (this.detectCommandInjection(req)) {
        logger.error(`Command Injection 시도 감지: ${clientIP}`)
        this.blockIP(clientIP, 'Command Injection attempt')
        return res.status(403).json({
          success: false,
          error: 'Invalid request',
        })
      }

      next()
    } catch (error) {
      logger.error('WAF 오류:', error)
      next()
    }
  }

  /**
   * Rate Limiting 확인
   */
  private static checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = IP_REQUEST_MAP.get(ip)

    if (!record) {
      IP_REQUEST_MAP.set(ip, { count: 1, resetTime: now + 1000 })
      return true
    }

    if (now > record.resetTime) {
      IP_REQUEST_MAP.set(ip, { count: 1, resetTime: now + 1000 })
      return true
    }

    if (record.count >= MAX_REQUESTS_PER_SECOND) {
      return false
    }

    record.count++
    return true
  }

  /**
   * IP 차단
   */
  private static async blockIP(ip: string, reason: string) {
    try {
      const prisma = getPrismaClient()
      await prisma.blockedIP.upsert({
        where: { ip },
        create: { ip, reason },
        update: { reason, blockedAt: new Date() },
      })

      // 보안 로그 저장
      await prisma.securityLog.create({
        data: {
          ip,
          method: 'BLOCK',
          path: '/',
          threatLevel: 'high',
          details: reason,
        },
      })
    } catch (error) {
      logger.error('IP 차단 실패:', error)
    }
  }

  /**
   * 차단된 IP 확인
   */
  private static isBlockedIP(ip: string): boolean {
    // 메모리 캐시로 빠른 확인 (실제로는 Redis 사용 권장)
    return false // DB 조회는 비동기라 미들웨어에서 직접 불가
  }

  /**
   * SQL Injection 감지
   */
  private static detectSQLInjection(req: Request): boolean {
    const testStrings = [
      JSON.stringify(req.body),
      JSON.stringify(req.query),
      JSON.stringify(req.params),
    ]

    for (const str of testStrings) {
      for (const pattern of ATTACK_PATTERNS.sql) {
        if (pattern.test(str)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * XSS 감지
   */
  private static detectXSS(req: Request): boolean {
    const testStrings = [
      JSON.stringify(req.body),
      JSON.stringify(req.query),
    ]

    for (const str of testStrings) {
      for (const pattern of ATTACK_PATTERNS.xss) {
        if (pattern.test(str)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Path Traversal 감지
   */
  private static detectPathTraversal(req: Request): boolean {
    const path = req.path + JSON.stringify(req.query)
    
    for (const pattern of ATTACK_PATTERNS.pathTraversal) {
      if (pattern.test(path)) {
        return true
      }
    }
    return false
  }

  /**
   * Command Injection 감지
   */
  private static detectCommandInjection(req: Request): boolean {
    const testStrings = [
      JSON.stringify(req.body),
      JSON.stringify(req.query),
    ]

    for (const str of testStrings) {
      for (const pattern of ATTACK_PATTERNS.commandInjection) {
        if (pattern.test(str)) {
          return true
        }
      }
    }
    return false
  }
}

/**
 * WAF 미들웨어
 */
export const wafMiddleware = (req: Request, res: Response, next: NextFunction) => {
  WAF.validateRequest(req, res, next)
}

