/**
 * 입력 검증 유틸리티
 * XSS, SQL Injection 방지
 */
interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  allowHtml?: boolean;
  pattern?: RegExp;
  type?: 'email' | 'url' | 'text';
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

export function validateInput(
  input: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    maxLength = 10000,
    minLength = 0,
    required = false,
    allowHtml = false,
    pattern,
    type,
  } = options;

  // 필수 검증
  if (required && (!input || input.trim().length === 0)) {
    return {
      valid: false,
      error: '입력값이 필요합니다.',
    };
  }

  // 길이 검증
  if (input.length > maxLength) {
    return {
      valid: false,
      error: `입력값이 너무 깁니다. (최대 ${maxLength}자)`,
    };
  }

  if (input.length < minLength) {
    return {
      valid: false,
      error: `입력값이 너무 짧습니다. (최소 ${minLength}자)`,
    };
  }

  // HTML 제거 (필요시)
  let sanitized = input;
  if (!allowHtml) {
    sanitized = sanitizeHtml(input);
  }

  // 타입별 검증
  if (type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(sanitized)) {
      return {
        valid: false,
        error: '올바른 이메일 형식이 아닙니다.',
      };
    }
  } else if (type === 'url') {
    try {
      new URL(sanitized);
    } catch {
      return {
        valid: false,
        error: '올바른 URL 형식이 아닙니다.',
      };
    }
  }

  // 패턴 검증
  if (pattern && !pattern.test(sanitized)) {
    return {
      valid: false,
      error: '입력 형식이 올바르지 않습니다.',
    };
  }

  // SQL Injection 패턴 검사
  if (containsSQLInjection(sanitized)) {
    return {
      valid: false,
      error: '잘못된 입력이 감지되었습니다.',
    };
  }

  return {
    valid: true,
    sanitized,
  };
}

function sanitizeHtml(input: string): string {
  // 기본적인 HTML 태그 제거
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function containsSQLInjection(input: string): boolean {
  // SQL Injection 패턴 검사
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

// 이메일 검증
export function validateEmail(email: string): ValidationResult {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateInput(email, {
    required: true,
    maxLength: 255,
    pattern: emailPattern,
  });
}

// URL 검증
export function validateUrl(url: string): ValidationResult {
  try {
    new URL(url);
    return { valid: true, sanitized: url };
  } catch {
    return {
      valid: false,
      error: '올바른 URL 형식이 아닙니다.',
    };
  }
}

// JSON 검증
export function validateJson(json: any): ValidationResult {
  try {
    if (typeof json === 'string') {
      JSON.parse(json);
      return { valid: true, sanitized: json };
    } else {
      JSON.stringify(json);
      return { valid: true };
    }
  } catch {
    return {
      valid: false,
      error: '올바른 JSON 형식이 아닙니다.',
    };
  }
}
