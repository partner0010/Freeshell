import { Request } from 'express'
import { logger } from '../../utils/logger'

/**
 * 침입 탐지 시스템 (IDS)
 * 실시간으로 의심스러운 활동 감지 및 차단
 */
export class IntrusionDetectionSystem {
  private suspiciousPatterns = [
    // SQL Injection 패턴
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/i,
    /(--|\/\*|\*\/|;|\||&|'|"|`)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    
    // XSS 패턴
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    
    // Command Injection 패턴
    /[;&|`$(){}[\]]/,
    /(cat|ls|pwd|whoami|id|uname|ps|netstat)/i,
    
    // Path Traversal 패턴
    /\.\.\//,
    /\.\.\\/,
    
    // LDAP Injection 패턴
    /[()&|!]/,
    
    // XML Injection 패턴
    /<!\[CDATA\[/,
    /<\!ENTITY/,
    
    // NoSQL Injection 패턴
    /\$where/,
    /\$ne/,
    /\$gt/,
    /\$lt/,
    
    // SSRF 패턴
    /(localhost|127\.0\.0\.1|0\.0\.0\.0)/,
    /(file|gopher|ldap|dict):\/\//i
  ]

  /**
   * 요청 분석 및 의심스러운 활동 감지
   */
  async analyzeRequest(req: Request): Promise<{ isSuspicious: boolean; threatLevel: 'low' | 'medium' | 'high' | 'critical'; details: string[] }> {
    const details: string[] = []
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let isSuspicious = false

    // URL 분석
    if (req.url) {
      const urlThreats = this.detectThreats(req.url)
      if (urlThreats.length > 0) {
        isSuspicious = true
        details.push(`URL 위협: ${urlThreats.join(', ')}`)
        threatLevel = this.calculateThreatLevel(urlThreats.length)
      }
    }

    // Body 분석
    if (req.body) {
      const bodyStr = JSON.stringify(req.body)
      const bodyThreats = this.detectThreats(bodyStr)
      if (bodyThreats.length > 0) {
        isSuspicious = true
        details.push(`Body 위협: ${bodyThreats.join(', ')}`)
        threatLevel = this.calculateThreatLevel(bodyThreats.length, threatLevel)
      }
    }

    // Query 파라미터 분석
    if (req.query) {
      const queryStr = JSON.stringify(req.query)
      const queryThreats = this.detectThreats(queryStr)
      if (queryThreats.length > 0) {
        isSuspicious = true
        details.push(`Query 위협: ${queryThreats.join(', ')}`)
        threatLevel = this.calculateThreatLevel(queryThreats.length, threatLevel)
      }
    }

    // IP 주소 분석
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const ipThreat = await this.analyzeIP(ip)
    if (ipThreat.isSuspicious) {
      isSuspicious = true
      details.push(`IP 위협: ${ipThreat.reason}`)
      threatLevel = this.calculateThreatLevel(1, threatLevel)
    }

    // 요청 빈도 분석
    const frequencyThreat = await this.analyzeFrequency(ip)
    if (frequencyThreat.isSuspicious) {
      isSuspicious = true
      details.push(`빈도 위협: ${frequencyThreat.reason}`)
      threatLevel = this.calculateThreatLevel(1, threatLevel)
    }

    // 로그 기록
    if (isSuspicious) {
      await this.logThreat(req, threatLevel, details)
    }

    return { isSuspicious, threatLevel, details }
  }

  /**
   * 위협 패턴 감지
   */
  private detectThreats(input: string): string[] {
    const threats: string[] = []

    this.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push(`패턴 ${index + 1}`)
      }
    })

    return threats
  }

  /**
   * 위협 수준 계산
   */
  private calculateThreatLevel(count: number, current: 'low' | 'medium' | 'high' | 'critical' = 'low'): 'low' | 'medium' | 'high' | 'critical' {
    if (count >= 5) return 'critical'
    if (count >= 3) return 'high'
    if (count >= 2) return 'medium'
    if (current === 'critical' || current === 'high') return current
    return 'low'
  }

  /**
   * IP 주소 분석
   */
  private async analyzeIP(ip: string): Promise<{ isSuspicious: boolean; reason: string }> {
    try {
      const { prisma } = await import('../../utils/database')
      
      // 차단된 IP 목록 확인
      const blockedIP = await prisma.blockedIP.findUnique({
        where: { ip }
      })

      if (blockedIP) {
        return {
          isSuspicious: true,
          reason: '차단된 IP 주소'
        }
      }

      // 의심스러운 IP 패턴 (예: Tor, VPN)
      // 실제 구현은 IP 정보 조회 API 사용

      return { isSuspicious: false, reason: '' }
    } catch (error) {
      logger.error('IP 분석 실패:', error)
      return { isSuspicious: false, reason: '' }
    }
  }

  /**
   * 요청 빈도 분석
   */
  private async analyzeFrequency(ip: string): Promise<{ isSuspicious: boolean; reason: string }> {
    try {
      const { prisma } = await import('../../utils/database')
      
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

      // 최근 1분간 요청 수 확인
      const recentRequests = await prisma.requestLog.count({
        where: {
          ip,
          timestamp: {
            gte: oneMinuteAgo
          }
        }
      })

      // 1분에 100회 이상이면 의심
      if (recentRequests > 100) {
        return {
          isSuspicious: true,
          reason: `과도한 요청 빈도: ${recentRequests}회/분`
        }
      }

      return { isSuspicious: false, reason: '' }
    } catch (error) {
      logger.error('빈도 분석 실패:', error)
      return { isSuspicious: false, reason: '' }
    }
  }

  /**
   * 위협 로그 기록
   */
  private async logThreat(
    req: Request,
    threatLevel: 'low' | 'medium' | 'high' | 'critical',
    details: string[]
  ): Promise<void> {
    try {
      const { prisma } = await import('../../utils/database')
      
      await prisma.securityLog.create({
        data: {
          ip: req.ip || req.socket.remoteAddress || 'unknown',
          method: req.method,
          path: req.path,
          threatLevel,
          details: details.join('; '),
          userAgent: req.get('user-agent') || '',
          timestamp: new Date()
        }
      })

      logger.warn(`🚨 보안 위협 감지 [${threatLevel}]:`, {
        ip: req.ip,
        path: req.path,
        details
      })

      // Critical 위협은 즉시 차단
      if (threatLevel === 'critical') {
        await this.blockIP(req.ip || req.socket.remoteAddress || 'unknown')
      }
    } catch (error) {
      logger.error('위협 로그 기록 실패:', error)
    }
  }

  /**
   * IP 차단
   */
  private async blockIP(ip: string): Promise<void> {
    try {
      const { prisma } = await import('../../utils/database')
      
      await prisma.blockedIP.upsert({
        where: { ip },
        update: { blockedAt: new Date() },
        create: {
          ip,
          blockedAt: new Date(),
          reason: 'Critical 위협 감지'
        }
      })

      logger.warn(`🚫 IP 차단: ${ip}`)
    } catch (error) {
      logger.error('IP 차단 실패:', error)
    }
  }
}

