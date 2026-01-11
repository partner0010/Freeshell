/**
 * 비밀번호 정책 검증
 */

export interface PasswordStrengthResult {
  valid: boolean;
  error?: string;
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

/**
 * 비밀번호 강도 검증
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const errors: string[] = [];

  // 최소 길이 확인
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
    return { valid: false, error: errors.join(' '), strength: 'weak', score: 0 };
  }

  // 길이 점수
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // 대문자 포함
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    errors.push('대문자를 포함해야 합니다.');
  }

  // 소문자 포함
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    errors.push('소문자를 포함해야 합니다.');
  }

  // 숫자 포함
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    errors.push('숫자를 포함해야 합니다.');
  }

  // 특수문자 포함
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
  } else {
    errors.push('특수문자를 포함해야 합니다.');
  }

  // 연속된 문자 패턴 감지 (예: "aaa", "123")
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
  }

  // 일반적인 비밀번호 패턴 감지
  const commonPatterns = [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i,
    /letmein/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 20;
    errors.push('너무 일반적인 비밀번호는 사용할 수 없습니다.');
  }

  // 점수에 따른 강도 결정
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 50) {
    strength = 'weak';
  } else if (score < 80) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  // 최소 요구사항 확인 (대문자, 소문자, 숫자, 특수문자)
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return {
      valid: false,
      error: errors.join(' '),
      strength,
      score: Math.max(0, score),
    };
  }

  return {
    valid: true,
    strength,
    score: Math.min(100, Math.max(0, score)),
  };
}

