/**
 * 코드 보안 강화
 * XSS, SQL Injection, CSRF 등 방지
 */
'use server';

import { validateInput } from './input-validation';

/**
 * HTML 콘텐츠 정화 (XSS 방지)
 * 기본적인 HTML 태그 이스케이프 (더 강력한 정화가 필요하면 isomorphic-dompurify 설치 권장)
 */
export function sanitizeHTML(html: string): string {
  // 기본적인 HTML 태그 이스케이프
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * SQL Injection 방지 (파라미터화된 쿼리 사용 권장)
 */
export function escapeSQL(str: string): string {
  return str
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * 파일명 정화 (경로 탐색 공격 방지)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .substring(0, 255);
}

/**
 * URL 정화
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    // 허용된 프로토콜만
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '#';
  }
}

/**
 * JavaScript 코드 정화 (위험한 코드 제거)
 */
export function sanitizeJavaScript(code: string): string {
  // 위험한 패턴 제거
  const dangerousPatterns = [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
    /document\.cookie/gi,
    /document\.write/gi,
    /innerHTML\s*=/gi,
    /outerHTML\s*=/gi,
    /location\.href\s*=/gi,
    /window\.location/gi,
  ];

  let sanitized = code;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '/* blocked */');
  });

  return sanitized;
}

/**
 * 사용자 입력 검증 및 정화
 */
export function sanitizeUserInput(input: string, type: 'html' | 'text' | 'url' | 'filename' | 'js' = 'text'): string {
  const validation = validateInput(input, { maxLength: 10000 });
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid input');
  }

  switch (type) {
    case 'html':
      return sanitizeHTML(validation.sanitized || input);
    case 'url':
      return sanitizeURL(validation.sanitized || input);
    case 'filename':
      return sanitizeFilename(validation.sanitized || input);
    case 'js':
      return sanitizeJavaScript(validation.sanitized || input);
    default:
      return validation.sanitized || input;
  }
}

/**
 * 민감한 정보 마스킹
 */
export function maskSensitiveData(data: string, type: 'email' | 'phone' | 'credit' | 'ssn' = 'email'): string {
  switch (type) {
    case 'email':
      return data.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    case 'phone':
      return data.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
    case 'credit':
      return data.replace(/\d(?=\d{4})/g, '*');
    case 'ssn':
      return data.replace(/(\d{6})(\d{7})/, '$1-*******');
    default:
      return '***';
  }
}
