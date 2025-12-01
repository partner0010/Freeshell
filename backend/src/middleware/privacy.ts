import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/**
 * 개인정보보호법/GDPR 준수를 위한 미들웨어
 */

/**
 * 개인정보 수집 동의 확인
 */
export function requirePrivacyConsent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const privacyConsent = req.headers['x-privacy-consent']

  if (privacyConsent !== 'true') {
    return res.status(403).json({
      success: false,
      error: '개인정보 수집 및 이용에 동의해야 합니다'
    })
  }

  next()
}

/**
 * 개인정보 로깅 제한
 */
export function sanitizeLogs(req: Request, res: Response, next: NextFunction) {
  // 민감 정보는 로그에서 제외
  const originalJson = res.json.bind(res)
  
  res.json = function(data: any) {
    // 응답에서 민감 정보 제거 (로깅용)
    if (data && typeof data === 'object') {
      const sanitized = { ...data }
      if (sanitized.credentials) {
        sanitized.credentials = '[REDACTED]'
      }
      if (sanitized.password) {
        sanitized.password = '[REDACTED]'
      }
      if (sanitized.apiKey) {
        sanitized.apiKey = '[REDACTED]'
      }
      logger.info('API Response:', sanitized)
    }
    return originalJson(data)
  }

  next()
}

/**
 * 개인정보 보관 기간 확인 (GDPR 준수)
 */
export function checkDataRetention(req: Request, res: Response, next: NextFunction) {
  // 데이터 보관 기간: 1년 (GDPR 권장)
  // 실제 구현은 데이터베이스에서 오래된 데이터 삭제
  next()
}

