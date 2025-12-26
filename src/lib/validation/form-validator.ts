/**
 * 폼 검증 유틸리티
 * 사용자 입력 검증 및 에러 메시지 관리
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 폼 필드 검증
 */
export function validateField(
  value: any,
  rules: ValidationRule,
  fieldName: string = '필드'
): ValidationResult {
  const errors: string[] = [];

  // 필수 검증
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push(`${fieldName}은(는) 필수 항목입니다.`);
    return { valid: false, errors };
  }

  // 값이 없으면 추가 검증 스킵
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: true, errors: [] };
  }

  const stringValue = String(value);

  // 최소 길이
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`${fieldName}은(는) 최소 ${rules.minLength}자 이상이어야 합니다.`);
  }

  // 최대 길이
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`${fieldName}은(는) 최대 ${rules.maxLength}자까지 입력 가능합니다.`);
  }

  // 패턴 검증
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(`${fieldName} 형식이 올바르지 않습니다.`);
  }

  // 이메일 검증
  if (rules.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(stringValue)) {
      errors.push('올바른 이메일 주소를 입력하세요.');
    }
  }

  // URL 검증
  if (rules.url) {
    try {
      new URL(stringValue);
    } catch {
      errors.push('올바른 URL을 입력하세요.');
    }
  }

  // 커스텀 검증
  if (rules.custom) {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      errors.push(typeof customResult === 'string' ? customResult : `${fieldName} 검증에 실패했습니다.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 전체 폼 검증
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): { valid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  Object.keys(rules).forEach((fieldName) => {
    const fieldRules = rules[fieldName];
    const fieldValue = data[fieldName];
    const result = validateField(fieldValue, fieldRules, fieldName);

    if (!result.valid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }
  });

  return { valid: isValid, errors };
}

/**
 * 실시간 검증 (디바운싱)
 */
export function createDebouncedValidator(
  validator: (value: any) => ValidationResult,
  delay: number = 300
): (value: any, callback: (result: ValidationResult) => void) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (value: any, callback: (result: ValidationResult) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
}

/**
 * XSS 방지 입력 정리
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * SQL Injection 방지
 */
export function sanitizeForSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

