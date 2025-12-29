/**
 * 환경 변수 보안
 * 안전한 환경 변수 접근 및 검증
 */

/**
 * 클라이언트 사이드에서 환경 변수 접근 방지
 */
export function assertServerSide(): void {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called on the server side');
  }
}

/**
 * 안전한 환경 변수 조회
 */
export function getSecureEnv(key: string, defaultValue?: string): string {
  assertServerSide();

  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Required environment variable '${key}' is not set`);
  }

  return value;
}

/**
 * 민감한 환경 변수 마스킹
 */
export function maskSensitiveValue(value: string): string {
  if (value.length <= 8) {
    return '*'.repeat(value.length);
  }
  return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
}

/**
 * 환경 변수 검증
 */
export function validateEnv(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  assertServerSide();

  const errors: string[] = [];
  const warnings: string[] = [];

  // 필수 환경 변수 검증
  const required = [
    'NODE_ENV',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Required environment variable '${key}' is not set`);
    }
  }

  // 권장 환경 변수 검증
  const recommended = [
    'OPENAI_API_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  for (const key of recommended) {
    if (!process.env[key]) {
      warnings.push(`Recommended environment variable '${key}' is not set`);
    }
  }

  // API 키 형식 검증
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    warnings.push('OPENAI_API_KEY format may be incorrect (should start with "sk-")');
  }

  // 보안 경고
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXTAUTH_SECRET) {
      errors.push('NEXTAUTH_SECRET is required in production');
    }
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
      errors.push('NEXTAUTH_SECRET must be at least 32 characters long');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 환경 변수 존재 확인
 */
export function hasEnv(key: string): boolean {
  assertServerSide();
  return !!process.env[key];
}

