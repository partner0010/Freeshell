/**
 * 입력 검증 및 Sanitization
 * XSS, SQL Injection, Command Injection 방지
 */

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
}

/**
 * HTML 태그 제거 및 이스케이프
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 위험한 HTML 태그 제거
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // JavaScript 이벤트 핸들러 제거
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // JavaScript 프로토콜 제거
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // HTML 특수 문자 이스케이프
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * SQL Injection 패턴 검사
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|OR|AND)\b)/gi,
    /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(\%27)|(\%22))/gi,
    /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Command Injection 패턴 검사
 */
export function detectCommandInjection(input: string): boolean {
  const commandPatterns = [
    /[;&|`$(){}[\]]/,
    /\b(cat|ls|pwd|whoami|id|uname|ps|kill|rm|mv|cp|chmod|chown)\b/gi,
    /\.\.\//,
    /\.\.\\/,
  ];

  return commandPatterns.some(pattern => pattern.test(input));
}

/**
 * XSS 패턴 검사
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<img[^>]*onerror/gi,
    /<svg[^>]*onload/gi,
    /data:text\/html/gi,
    /expression\s*\(/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * URL 검증
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // 허용된 프로토콜만
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return false;
    }
    // 내부 IP 차단 (SSRF 방지)
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.startsWith('169.254.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 사용자 입력 검증 및 Sanitization
 */
export function validateInput(
  input: unknown,
  options: {
    maxLength?: number;
    minLength?: number;
    allowHtml?: boolean;
    required?: boolean;
    type?: 'string' | 'number' | 'email' | 'url';
  } = {}
): ValidationResult {
  const {
    maxLength = 10000,
    minLength = 0,
    allowHtml = false,
    required = false,
    type = 'string',
  } = options;

  // 타입 검증
  if (typeof input !== 'string') {
    if (required) {
      return {
        valid: false,
        sanitized: '',
        error: '입력값이 필요합니다.',
      };
    }
    return { valid: true, sanitized: '' };
  }

  let sanitized = input.trim();

  // 필수 검증
  if (required && !sanitized) {
    return {
      valid: false,
      sanitized: '',
      error: '입력값이 필요합니다.',
    };
  }

  // 길이 검증
  if (sanitized.length > maxLength) {
    return {
      valid: false,
      sanitized: '',
      error: `입력값이 너무 깁니다. (최대 ${maxLength}자)`,
    };
  }

  if (sanitized.length < minLength) {
    return {
      valid: false,
      sanitized: '',
      error: `입력값이 너무 짧습니다. (최소 ${minLength}자)`,
    };
  }

  // SQL Injection 검사
  if (detectSQLInjection(sanitized)) {
    return {
      valid: false,
      sanitized: '',
      error: '위험한 입력이 감지되었습니다.',
    };
  }

  // Command Injection 검사
  if (detectCommandInjection(sanitized)) {
    return {
      valid: false,
      sanitized: '',
      error: '위험한 입력이 감지되었습니다.',
    };
  }

  // XSS 검사 (HTML 허용하지 않는 경우)
  if (!allowHtml && detectXSS(sanitized)) {
    return {
      valid: false,
      sanitized: '',
      error: '위험한 입력이 감지되었습니다.',
    };
  }

  // 타입별 검증
  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      return {
        valid: false,
        sanitized: '',
        error: '올바른 이메일 형식이 아닙니다.',
      };
    }
  }

  if (type === 'url') {
    if (!validateUrl(sanitized)) {
      return {
        valid: false,
        sanitized: '',
        error: '올바른 URL 형식이 아닙니다.',
      };
    }
  }

  // Sanitization
  if (!allowHtml) {
    sanitized = sanitizeHtml(sanitized);
  }

  // 널 바이트 제거
  sanitized = sanitized.replace(/\0/g, '');

  // 제어 문자 제거
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  return {
    valid: true,
    sanitized,
  };
}

/**
 * JSON 데이터 검증
 */
export function validateJson(input: unknown): ValidationResult {
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return validateJson(parsed);
    } catch {
      return {
        valid: false,
        sanitized: '',
        error: '올바른 JSON 형식이 아닙니다.',
      };
    }
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const keyValidation = validateInput(key, { maxLength: 100 });
      if (!keyValidation.valid) {
        return {
          valid: false,
          sanitized: '',
          error: '올바르지 않은 키가 포함되어 있습니다.',
        };
      }

      if (typeof value === 'string') {
        const valueValidation = validateInput(value, { maxLength: 10000 });
        if (!valueValidation.valid) {
          return {
            valid: false,
            sanitized: '',
            error: valueValidation.error || '올바르지 않은 값이 포함되어 있습니다.',
          };
        }
        sanitized[keyValidation.sanitized] = valueValidation.sanitized;
      } else if (typeof value === 'object' && value !== null) {
        const nestedValidation = validateJson(value);
        if (!nestedValidation.valid) {
          return nestedValidation;
        }
        sanitized[keyValidation.sanitized] = JSON.parse(nestedValidation.sanitized);
      } else {
        sanitized[keyValidation.sanitized] = value;
      }
    }

    return {
      valid: true,
      sanitized: JSON.stringify(sanitized),
    };
  }

  return {
    valid: true,
    sanitized: JSON.stringify(input),
  };
}

