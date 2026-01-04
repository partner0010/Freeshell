/**
 * 환경 변수 보안
 * 안전한 환경 변수 접근 및 검증 (무료 API만)
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
 * 환경 변수 검증 (무료 API만)
 */
export function validateEnv(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  assertServerSide();

  const errors: string[] = [];
  const warnings: string[] = [];

  // 필수 환경 변수는 없음 (모두 선택적)
  // Google Gemini는 필수지만, 없어도 시뮬레이션 모드로 작동

  // 권장 환경 변수 검증
  const recommended = [
    'GOOGLE_API_KEY', // AI 기능을 위해 권장
  ];

  for (const key of recommended) {
    if (!process.env[key]) {
      warnings.push(`Recommended environment variable '${key}' is not set`);
    }
  }

  // API 키 형식 검증 (Google API 키는 특정 형식이 없음)

  // 보안 경고
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.length < 20) {
    warnings.push('GOOGLE_API_KEY seems too short, may be incorrect');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
