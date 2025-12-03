/**
 * 보안 헤더 설정
 * OWASP 권장사항 적용
 */

import { Request, Response, NextFunction } from 'express'

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // 1. Content Security Policy (XSS 방어)
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Vite 개발 모드 허용
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.freeshell.co.kr",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // 2. X-Frame-Options (Clickjacking 방어)
  res.setHeader('X-Frame-Options', 'DENY')

  // 3. X-Content-Type-Options (MIME 스니핑 방지)
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // 4. X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // 5. Strict-Transport-Security (HTTPS 강제)
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  // 6. Referrer-Policy (정보 노출 방지)
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 7. Permissions-Policy (기능 제한)
  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
    ].join(', ')
  )

  // 8. X-Permitted-Cross-Domain-Policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')

  // 9. X-Download-Options (IE 다운로드 보안)
  res.setHeader('X-Download-Options', 'noopen')

  // 10. X-DNS-Prefetch-Control
  res.setHeader('X-DNS-Prefetch-Control', 'off')

  // 11. 서버 정보 숨기기
  res.removeHeader('X-Powered-By')

  // 12. Cache Control (민감 데이터 캐싱 방지)
  if (req.path.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }

  next()
}

