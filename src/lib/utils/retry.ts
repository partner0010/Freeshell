/**
 * 재시도 유틸리티
 * 네트워크 요청 재시도 로직
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * 재시도 로직이 포함된 함수 실행
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = () => true,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // 재시도 조건 확인
      if (attempt < maxRetries && retryCondition(error)) {
        onRetry?.(attempt + 1, error);
        
        // 지수 백오프 (exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * 지수 백오프 계산
 */
export function calculateBackoff(attempt: number, baseDelay: number = 1000): number {
  return baseDelay * Math.pow(2, attempt);
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: any): boolean {
  // 네트워크 에러
  if (error.name === 'TypeError' || error.name === 'NetworkError') {
    return true;
  }

  // 타임아웃 에러
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return true;
  }

  // HTTP 5xx 에러
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // HTTP 429 (Too Many Requests)
  if (error.status === 429) {
    return true;
  }

  return false;
}

