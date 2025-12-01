/**
 * 프론트엔드 보안 유틸리티
 * XSS, CSRF 방지 및 입력 검증
 */

/**
 * XSS 방지: HTML 이스케이프
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 입력 검증 및 Sanitization
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  // HTML 태그 제거
  const div = document.createElement('div')
  div.textContent = input
  const sanitized = div.innerHTML
  
  // 특수 문자 이스케이프
  return sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * 이메일 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 강도 검증
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다')
  }
  
  if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
    errors.push('비밀번호에 영문자가 포함되어야 합니다')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호에 숫자가 포함되어야 합니다')
  }
  
  // 특수 문자는 선택적
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    // 경고만 (필수 아님)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * URL 검증
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 안전한 토큰 저장 (암호화는 아니지만 추가 보안)
 */
export function setSecureToken(key: string, value: string): void {
  if (typeof window === 'undefined') return
  
  try {
    // Base64 인코딩 (암호화는 아니지만 평문 노출 방지)
    const encoded = btoa(value)
    localStorage.setItem(key, encoded)
  } catch (error) {
    console.error('토큰 저장 실패:', error)
  }
}

/**
 * 안전한 토큰 조회
 */
export function getSecureToken(key: string): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const encoded = localStorage.getItem(key)
    if (!encoded) return null
    
    // Base64 디코딩
    return atob(encoded)
  } catch (error) {
    console.error('토큰 조회 실패:', error)
    return null
  }
}

/**
 * 안전한 토큰 삭제
 */
export function removeSecureToken(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * CSRF 토큰 저장
 */
export function setCSRFToken(): string {
  const token = generateCSRFToken()
  sessionStorage.setItem('csrf-token', token)
  return token
}

/**
 * CSRF 토큰 조회
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem('csrf-token')
}

/**
 * 입력 길이 제한
 */
export function limitInputLength(input: string, maxLength: number): string {
  if (input.length > maxLength) {
    return input.substring(0, maxLength)
  }
  return input
}

/**
 * SQL Injection 패턴 검증
 */
export function containsSQLInjection(input: string): boolean {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\/\*|\*\/|;|\||&)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i
  ]
  
  return dangerousPatterns.some(pattern => pattern.test(input))
}

/**
 * XSS 패턴 검증
 */
export function containsXSS(input: string): boolean {
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ]
  
  return dangerousPatterns.some(pattern => pattern.test(input))
}

/**
 * 안전한 에러 메시지 표시
 */
export function sanitizeErrorMessage(error: any): string {
  // 민감한 정보 제거
  const message = error?.message || error?.error || '오류가 발생했습니다'
  
  // 개발 환경이 아니면 상세 정보 숨김
  if (import.meta.env.PROD) {
    // 프로덕션에서는 일반적인 메시지만 반환
    if (message.includes('API') || message.includes('key') || message.includes('secret')) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
  }
  
  return message
}

