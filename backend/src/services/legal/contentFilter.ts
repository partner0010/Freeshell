import { logger } from '../../utils/logger'

/**
 * 콘텐츠 필터링 서비스
 * 법적으로 문제가 될 수 있는 콘텐츠 검사
 */
export class ContentFilter {
  private prohibitedWords = [
    // 욕설 및 비속어
    '욕설', '비속어',
    
    // 혐오 표현
    '혐오', '차별',
    
    // 불법 관련
    '불법', '사기', '도박',
    
    // 성인 콘텐츠 관련
    '성인', '음란',
    
    // 폭력 관련
    '폭력', '살인', '테러',
    
    // 기타
    '마약', '약물'
  ]

  private sensitiveTopics = [
    '정치적 논란',
    '종교적 논란',
    '인종 차별',
    '성 차별'
  ]

  /**
   * 콘텐츠 필터링
   */
  async filterContent(content: {
    title?: string
    description?: string
    text?: string
    tags?: string[]
  }): Promise<{
    isSafe: boolean
    violations: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      reason: string
      suggestion?: string
    }>
    riskLevel: 'low' | 'medium' | 'high'
  }> {
    const violations: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      reason: string
      suggestion?: string
    }> = []

    const fullText = [
      content.title,
      content.description,
      content.text,
      ...(content.tags || [])
    ].filter(Boolean).join(' ').toLowerCase()

    // 금지 단어 검사
    for (const word of this.prohibitedWords) {
      if (fullText.includes(word.toLowerCase())) {
        violations.push({
          type: 'prohibited_word',
          severity: 'high',
          reason: `금지된 단어 발견: ${word}`,
          suggestion: '해당 단어를 제거하거나 다른 표현으로 변경하세요'
        })
      }
    }

    // 민감한 주제 검사
    for (const topic of this.sensitiveTopics) {
      if (fullText.includes(topic.toLowerCase())) {
        violations.push({
          type: 'sensitive_topic',
          severity: 'medium',
          reason: `민감한 주제 발견: ${topic}`,
          suggestion: '신중하게 다루거나 전문가의 조언을 구하세요'
        })
      }
    }

    // 길이 검사
    if (content.text && content.text.length < 50) {
      violations.push({
        type: 'too_short',
        severity: 'low',
        reason: '콘텐츠가 너무 짧습니다',
        suggestion: '더 자세한 내용을 추가하세요'
      })
    }

    // 위험도 계산
    const riskLevel = this.calculateRiskLevel(violations)

    return {
      isSafe: riskLevel === 'low' && violations.filter(v => v.severity === 'high').length === 0,
      violations,
      riskLevel
    }
  }

  /**
   * 위험도 계산
   */
  private calculateRiskLevel(violations: Array<{ severity: 'low' | 'medium' | 'high' }>): 'low' | 'medium' | 'high' {
    const highCount = violations.filter(v => v.severity === 'high').length
    const mediumCount = violations.filter(v => v.severity === 'medium').length

    if (highCount > 0) return 'high'
    if (mediumCount > 2) return 'high'
    if (mediumCount > 0) return 'medium'
    return 'low'
  }

  /**
   * 플랫폼별 정책 검사
   */
  async checkPlatformPolicy(
    content: any,
    platform: 'youtube' | 'tiktok' | 'instagram'
  ): Promise<{
    compliant: boolean
    violations: string[]
    suggestions: string[]
  }> {
    const violations: string[] = []
    const suggestions: string[] = []

    switch (platform) {
      case 'youtube':
        // YouTube 정책 검사
        if (content.title && content.title.length > 100) {
          violations.push('YouTube 제목은 100자 이하여야 합니다')
          suggestions.push('제목을 100자 이하로 줄이세요')
        }
        if (content.description && content.description.length > 5000) {
          violations.push('YouTube 설명은 5000자 이하여야 합니다')
          suggestions.push('설명을 5000자 이하로 줄이세요')
        }
        break

      case 'tiktok':
        // TikTok 정책 검사
        if (content.description && content.description.length > 2200) {
          violations.push('TikTok 설명은 2200자 이하여야 합니다')
          suggestions.push('설명을 2200자 이하로 줄이세요')
        }
        break

      case 'instagram':
        // Instagram 정책 검사
        if (content.description && content.description.length > 2200) {
          violations.push('Instagram 설명은 2200자 이하여야 합니다')
          suggestions.push('설명을 2200자 이하로 줄이세요')
        }
        break
    }

    return {
      compliant: violations.length === 0,
      violations,
      suggestions
    }
  }
}

export const contentFilter = new ContentFilter()

