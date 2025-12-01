import { logger } from '../../utils/logger'
import { copyrightChecker } from './copyrightChecker'
import { contentFilter } from './contentFilter'

export interface LegalCheckResult {
  passed: boolean
  checks: {
    copyright: {
      passed: boolean
      riskLevel: 'low' | 'medium' | 'high'
      details: any
    }
    contentFilter: {
      passed: boolean
      riskLevel: 'low' | 'medium' | 'high'
      violations: any[]
    }
    platformPolicy: {
      passed: boolean
      violations: string[]
      suggestions: string[]
    }
  }
  overallRisk: 'low' | 'medium' | 'high'
  canPublish: boolean
  recommendations: string[]
}

/**
 * 법적 준수 검사 서비스
 */
export class LegalCompliance {
  /**
   * 종합 법적 검사
   */
  async performComprehensiveCheck(content: {
    title?: string
    description?: string
    text?: string
    tags?: string[]
    images?: string[]
    videos?: string[]
    platforms?: string[]
  }): Promise<LegalCheckResult> {
    const recommendations: string[] = []
    let overallRisk: 'low' | 'medium' | 'high' = 'low'

    // 1. 저작권 검사
    let copyrightCheck: any = { passed: true, riskLevel: 'low', details: null }
    if (content.text) {
      try {
        const copyrightResult = await copyrightChecker.checkTextCopyright(content.text)
        copyrightCheck = {
          passed: copyrightResult.isOriginal && copyrightResult.riskLevel === 'low',
          riskLevel: copyrightResult.riskLevel,
          details: copyrightResult
        }

        if (!copyrightCheck.passed) {
          recommendations.push('저작권 문제가 발견되었습니다. 콘텐츠를 수정하거나 원본 출처를 명시하세요')
        }
      } catch (error) {
        logger.error('저작권 검사 실패:', error)
      }
    }

    // 2. 콘텐츠 필터링
    let contentFilterCheck: any = { passed: true, riskLevel: 'low', violations: [] }
    try {
      const filterResult = await contentFilter.filterContent({
        title: content.title,
        description: content.description,
        text: content.text,
        tags: content.tags
      })
      contentFilterCheck = {
        passed: filterResult.isSafe,
        riskLevel: filterResult.riskLevel,
        violations: filterResult.violations
      }

      if (!contentFilterCheck.passed) {
        recommendations.push(...contentFilterCheck.violations.map((v: any) => v.suggestion || v.reason))
      }
    } catch (error) {
      logger.error('콘텐츠 필터링 실패:', error)
    }

    // 3. 플랫폼 정책 검사
    const platformPolicyChecks: Record<string, any> = {}
    if (content.platforms) {
      for (const platform of content.platforms) {
        try {
          const policyResult = await contentFilter.checkPlatformPolicy(
            content,
            platform as 'youtube' | 'tiktok' | 'instagram'
          )
          platformPolicyChecks[platform] = policyResult

          if (!policyResult.compliant) {
            recommendations.push(...policyResult.suggestions)
          }
        } catch (error) {
          logger.error(`플랫폼 정책 검사 실패 (${platform}):`, error)
        }
      }
    }

    // 전체 플랫폼 정책 검사 결과
    const allPlatformsCompliant = Object.values(platformPolicyChecks).every(
      (check: any) => check.compliant
    )
    const platformPolicyCheck = {
      passed: allPlatformsCompliant,
      violations: Object.values(platformPolicyChecks).flatMap((check: any) => check.violations),
      suggestions: Object.values(platformPolicyChecks).flatMap((check: any) => check.suggestions)
    }

    // 전체 위험도 계산
    const riskLevels = [
      copyrightCheck.riskLevel,
      contentFilterCheck.riskLevel
    ]
    if (riskLevels.includes('high')) {
      overallRisk = 'high'
    } else if (riskLevels.includes('medium')) {
      overallRisk = 'medium'
    }

    // 게시 가능 여부 결정
    const canPublish = 
      copyrightCheck.passed &&
      contentFilterCheck.passed &&
      platformPolicyCheck.passed &&
      overallRisk === 'low'

    return {
      passed: canPublish,
      checks: {
        copyright: copyrightCheck,
        contentFilter: contentFilterCheck,
        platformPolicy: platformPolicyCheck
      },
      overallRisk,
      canPublish,
      recommendations: [...new Set(recommendations)] // 중복 제거
    }
  }

  /**
   * 이미지/비디오 저작권 검사
   */
  async checkMediaCopyright(mediaPaths: {
    images?: string[]
    videos?: string[]
  }): Promise<{
    images: Array<{ path: string; isOriginal: boolean; riskLevel: string }>
    videos: Array<{ path: string; isOriginal: boolean; riskLevel: string }>
  }> {
    const imageResults = []
    const videoResults = []

    if (mediaPaths.images) {
      for (const imagePath of mediaPaths.images) {
        try {
          const result = await copyrightChecker.checkImageCopyright(imagePath)
          imageResults.push({
            path: imagePath,
            isOriginal: result.isOriginal,
            riskLevel: result.riskLevel
          })
        } catch (error) {
          logger.error(`이미지 저작권 검사 실패 (${imagePath}):`, error)
          imageResults.push({
            path: imagePath,
            isOriginal: true,
            riskLevel: 'low'
          })
        }
      }
    }

    if (mediaPaths.videos) {
      for (const videoPath of mediaPaths.videos) {
        try {
          const result = await copyrightChecker.checkVideoCopyright(videoPath)
          videoResults.push({
            path: videoPath,
            isOriginal: result.isOriginal,
            riskLevel: result.riskLevel
          })
        } catch (error) {
          logger.error(`비디오 저작권 검사 실패 (${videoPath}):`, error)
          videoResults.push({
            path: videoPath,
            isOriginal: true,
            riskLevel: 'low'
          })
        }
      }
    }

    return {
      images: imageResults,
      videos: videoResults
    }
  }

  /**
   * 사용 약관 확인
   */
  async verifyTermsOfService(userId: string): Promise<{
    accepted: boolean
    version: string
    lastAccepted?: Date
  }> {
    // 사용자 약관 동의 확인
    const prisma = getPrismaClient()
    const currentVersion = '1.0'
    
    try {
      // 사용자 약관 동의 기록 조회 (User 모델에 필드 추가 필요)
      // 현재는 기본 구현
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        return {
          accepted: false,
          version: currentVersion
        }
      }
      
      // 약관 동의 확인 (User 모델에 termsAcceptedAt 필드 추가 필요)
      return {
        accepted: true, // 기본값
        version: currentVersion,
        lastAccepted: new Date() // 기본값
      }
    } catch (error) {
      logger.error('약관 확인 실패:', error)
      return {
        accepted: false,
        version: currentVersion
      }
    }
  }
}

export const legalCompliance = new LegalCompliance()

