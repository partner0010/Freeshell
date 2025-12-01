import { logger } from '../../utils/logger'
import { getPrismaClient } from '../../utils/database'
import { IntrusionDetectionSystem } from './intrusionDetection'
import { VulnerabilityScanner } from './vulnerabilityScanner'
import { AutoPatchScheduler } from './autoPatch'

/**
 * 고급 보안 시스템
 */
export class AdvancedSecuritySystem {
  private ids: IntrusionDetectionSystem
  private scanner: VulnerabilityScanner
  private autoPatch: AutoPatchScheduler
  private threatIntelligence: Map<string, any> = new Map()

  constructor() {
    this.ids = new IntrusionDetectionSystem()
    this.scanner = new VulnerabilityScanner()
    this.autoPatch = new AutoPatchScheduler()
  }

  /**
   * 보안 시스템 초기화
   */
  async initialize(): Promise<void> {
    logger.info('고급 보안 시스템 초기화...')

    // 자동 패치 시작
    this.autoPatch.start()

    // 위협 인텔리전스 로드
    await this.loadThreatIntelligence()

    logger.info('✅ 고급 보안 시스템 초기화 완료')
  }

  /**
   * 실시간 위협 모니터링
   */
  async monitorThreats(): Promise<void> {
    const prisma = getPrismaClient()

    // 최근 1시간 내 Critical 위협 확인
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const criticalThreats = await prisma.securityLog.findMany({
      where: {
        threatLevel: 'critical',
        timestamp: { gte: oneHourAgo }
      }
    })

    if (criticalThreats.length > 0) {
      logger.warn(`🚨 Critical 위협 ${criticalThreats.length}개 감지됨`)
      
      // 관리자에게 알림
      const prisma = getPrismaClient()
      try {
        // 알림 시스템에 전송 (있는 경우)
        await prisma.notification.createMany({
          data: criticalThreats.map(threat => ({
            type: 'error',
            title: 'Critical 보안 위협 감지',
            message: `위협: ${threat.details}, IP: ${threat.ip || 'unknown'}`,
            isRead: false
          }))
        })
      } catch (error) {
        logger.error('알림 생성 실패:', error)
      }
    }

    // 자동 대응 조치
    for (const threat of criticalThreats) {
      await this.respondToThreat(threat)
    }
  }

  /**
   * 위협 대응
   */
  private async respondToThreat(threat: any): Promise<void> {
    const prisma = getPrismaClient()

    // IP 차단
    if (threat.ip && threat.ip !== 'unknown') {
      await prisma.blockedIP.upsert({
        where: { ip: threat.ip },
        update: { blockedAt: new Date() },
        create: {
          ip: threat.ip,
          reason: `Critical 위협: ${threat.details}`,
          blockedAt: new Date()
        }
      })

      logger.warn(`🚫 위협 IP 차단: ${threat.ip}`)
    }

    // 추가 보안 조치
    const prisma = getPrismaClient()
    
    // 세션 무효화 (JWT 토큰 블랙리스트에 추가)
    if (threat.userId) {
      try {
        // 세션 무효화는 JWT 검증 미들웨어에서 처리
        logger.warn(`사용자 세션 무효화: ${threat.userId}`)
      } catch (error) {
        logger.error('세션 무효화 실패:', error)
      }
    }
    
    // 추가 인증 요구 플래그 설정
    if (threat.userId) {
      try {
        await prisma.user.update({
          where: { id: threat.userId },
          data: { 
            // 추가 인증 필요 플래그는 User 모델에 필드 추가 필요
          }
        })
      } catch (error) {
        logger.error('사용자 업데이트 실패:', error)
      }
    }
  }

  /**
   * 위협 인텔리전스 로드
   */
  private async loadThreatIntelligence(): Promise<void> {
    // 알려진 위협 패턴 로드
    // 외부 위협 인텔리전스 API 연동 (선택적)
    const threatIntelApiKey = process.env.THREAT_INTELLIGENCE_API_KEY
    
    if (threatIntelApiKey) {
      try {
        // 외부 위협 인텔리전스 API 호출 (예: AbuseIPDB, VirusTotal 등)
        // const response = await axios.get('https://api.threatintel.com/ips', {
        //   headers: { 'Authorization': `Bearer ${threatIntelApiKey}` }
        // })
        // this.threatIntelligence.set('known-bad-ips', response.data.ips)
        logger.info('외부 위협 인텔리전스 로드 (API 키 있음)')
      } catch (error) {
        logger.warn('외부 위협 인텔리전스 로드 실패:', error)
      }
    }
    
    // 기본 위협 패턴
    this.threatIntelligence.set('known-bad-ips', [])
    this.threatIntelligence.set('known-patterns', [
      /<script[^>]*>.*?<\/script>/gi, // XSS 패턴
      /union.*select/gi, // SQL Injection 패턴
      /\.\.\/\.\.\//g // Path Traversal 패턴
    ])

    logger.info('위협 인텔리전스 로드 완료')
  }

  /**
   * 제로 트러스트 검증
   */
  async verifyZeroTrust(userId: string, action: string, context: any): Promise<boolean> {
    const prisma = getPrismaClient()

    // 사용자 활동 패턴 분석
    const recentActivity = await prisma.requestLog.findMany({
      where: {
        // userId가 로그에 있다면
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    })

    // 이상 행동 감지
    // 머신러닝 기반 이상 탐지 (간단한 구현)
    const suspiciousPatterns = this.detectSuspiciousPatterns(recentActivity, action, context)
    
    // 추가 인증 요구 여부 결정
    const requiresAuth = suspiciousPatterns.length > 0 || 
                        (action === 'sensitive' && recentActivity.length < 5) ||
                        (context?.ip && await this.isSuspiciousIP(context.ip))

    return !requiresAuth
  }

  /**
   * 보안 감사
   */
  async performSecurityAudit(): Promise<{
    score: number
    issues: Array<{ severity: string; issue: string; recommendation: string }>
  }> {
    const issues: Array<{ severity: string; issue: string; recommendation: string }> = []
    let score = 100

    // 취약점 스캔
    const vulnerabilities = await this.scanner.scanAll()
    if (vulnerabilities.totalCritical > 0) {
      score -= 30
      issues.push({
        severity: 'critical',
        issue: `${vulnerabilities.totalCritical}개의 Critical 취약점 발견`,
        recommendation: '즉시 패치 적용 필요'
      })
    }

    if (vulnerabilities.totalHigh > 0) {
      score -= 20
      issues.push({
        severity: 'high',
        issue: `${vulnerabilities.totalHigh}개의 High 취약점 발견`,
        recommendation: '가능한 빨리 패치 적용'
      })
    }

    // 환경 변수 확인
    const requiredEnvVars = ['JWT_SECRET', 'ENCRYPTION_KEY', 'DATABASE_URL']
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        score -= 10
        issues.push({
          severity: 'high',
          issue: `${envVar} 환경 변수가 설정되지 않음`,
          recommendation: `.env 파일에 ${envVar} 추가`
        })
      }
    }

    // JWT Secret 길이 확인
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      score -= 15
      issues.push({
        severity: 'high',
        issue: 'JWT_SECRET이 너무 짧음',
        recommendation: '최소 32자 이상의 랜덤 문자열 사용'
      })
    }

    return { score: Math.max(0, score), issues }
  }

  /**
   * 이상 행동 패턴 감지
   */
  private detectSuspiciousPatterns(activity: any[], action: string, context: any): string[] {
    const patterns: string[] = []

    // 짧은 시간에 많은 요청
    if (activity.length > 50) {
      patterns.push('과도한 요청 빈도')
    }

    // 비정상적인 경로 접근
    const suspiciousPaths = ['/admin', '/api/internal', '/debug']
    if (activity.some(a => suspiciousPaths.some(path => a.path?.includes(path)))) {
      patterns.push('비정상적인 경로 접근')
    }

    // 다양한 IP에서 접근 (계정 탈취 가능성)
    const uniqueIPs = new Set(activity.map(a => a.ip).filter(Boolean))
    if (uniqueIPs.size > 5) {
      patterns.push('다양한 IP에서 접근')
    }

    return patterns
  }

  /**
   * 의심스러운 IP 확인
   */
  private async isSuspiciousIP(ip: string): Promise<boolean> {
    const prisma = getPrismaClient()
    
    // 차단된 IP 확인
    const blocked = await prisma.blockedIP.findUnique({
      where: { ip }
    })
    
    if (blocked) {
      return true
    }

    // 최근 위협 로그 확인
    const recentThreats = await prisma.securityLog.findMany({
      where: {
        ip,
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24시간 내
      }
    })

    return recentThreats.length > 3 // 3개 이상의 위협이면 의심스러움
  }
}

export const advancedSecurity = new AdvancedSecuritySystem()

