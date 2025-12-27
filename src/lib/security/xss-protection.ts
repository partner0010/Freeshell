/**
 * XSS (Cross-Site Scripting) 방어 유틸리티
 * 사용자 입력값 검증 및 출력 인코딩
 */

/**
 * HTML 태그 제거 및 이스케이프
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // HTML 태그 제거
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // 이벤트 핸들러 제거
    .replace(/javascript:/gi, '') // javascript: 프로토콜 제거
    .replace(/data:text\/html/gi, '') // data URI 제거
    .trim();

  return sanitized;
}

/**
 * HTML 엔티티로 이스케이프
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
}

/**
 * URL 검증 및 정리
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url);
    
    // 허용된 프로토콜만 허용
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return '';
    }

    // javascript:, data: 등 위험한 프로토콜 차단
    if (url.toLowerCase().includes('javascript:') || 
        url.toLowerCase().includes('data:text/html') ||
        url.toLowerCase().includes('vbscript:')) {
      return '';
    }

    return parsed.toString();
  } catch {
    // 유효하지 않은 URL
    return '';
  }
}

/**
 * 입력값 검증 (일반 텍스트)
 */
export function validateInput(input: unknown, maxLength: number = 10000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 길이 제한
  if (input.length > maxLength) {
    return input.substring(0, maxLength);
  }

  // HTML 태그 제거
  return sanitizeHtml(input);
}

/**
 * JSON 데이터 검증 및 정리
 */
export function sanitizeJson(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeHtml(data);
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeJson(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // 키도 검증
      const safeKey = sanitizeHtml(String(key));
      sanitized[safeKey] = sanitizeJson(value);
    }
    return sanitized;
  }

  return String(data);
}

/**
 * 사용자 입력값 전체 검증 (API용)
 */
export function validateUserInput(input: unknown, options: {
  maxLength?: number;
  allowHtml?: boolean;
  required?: boolean;
} = {}): { valid: boolean; sanitized: string; error?: string } {
  const { maxLength = 10000, allowHtml = false, required = false } = options;

  if (typeof input !== 'string') {
    if (required) {
      return { valid: false, sanitized: '', error: '입력값이 필요합니다.' };
    }
    return { valid: true, sanitized: '' };
  }

  if (required && !input.trim()) {
    return { valid: false, sanitized: '', error: '입력값이 필요합니다.' };
  }

  if (input.length > maxLength) {
    return { 
      valid: false, 
      sanitized: '', 
      error: `입력값이 너무 깁니다. (최대 ${maxLength}자)` 
    };
  }

  // HTML 허용 여부에 따라 처리
  const sanitized = allowHtml ? input : sanitizeHtml(input);

  // 위험한 패턴 검사
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return { 
        valid: false, 
        sanitized: '', 
        error: '위험한 코드가 감지되었습니다.' 
      };
    }
  }

  return { valid: true, sanitized };
}

/**
 * React에서 안전하게 HTML 렌더링 (dangerouslySetInnerHTML 대신 사용)
 */
export function safeHtmlRender(html: string): { __html: string } {
  return {
    __html: escapeHtml(html),
  };
}

