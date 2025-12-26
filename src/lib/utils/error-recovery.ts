/**
 * 에러 복구 시스템
 * 자동 재시도 및 에러 복구 로직
 */

import { apiClient } from '@/lib/api/api-client';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

/**
 * 에러 복구가 가능한 에러인지 확인
 */
export function isRecoverableError(error: any): boolean {
  // 네트워크 에러
  if (error.name === 'TypeError' || error.name === 'NetworkError') {
    return true;
  }

  // 타임아웃 에러
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return true;
  }

  // HTTP 5xx 에러 (서버 에러)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // HTTP 429 (Too Many Requests)
  if (error.status === 429) {
    return true;
  }

  return false;
}

/**
 * 에러 복구 시도
 */
export async function recoverFromError<T>(
  operation: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onSuccess,
    onFailure,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (attempt > 0) {
        onSuccess?.();
      }
      
      return result;
    } catch (error: any) {
      lastError = error;

      // 복구 불가능한 에러
      if (!isRecoverableError(error)) {
        onFailure?.(error);
        throw error;
      }

      // 최대 재시도 횟수 초과
      if (attempt >= maxRetries) {
        onFailure?.(error);
        throw error;
      }

      // 재시도
      onRetry?.(attempt + 1);
      
      // 지수 백오프
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  onFailure?.(lastError);
  throw lastError;
}

/**
 * 네트워크 연결 확인
 */
export async function checkNetworkConnection(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return true;
  }

  if (!navigator.onLine) {
    return false;
  }

  try {
    const response = await fetch('/api/healthcheck', {
      method: 'GET',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 오프라인 큐에 작업 추가
 */
export async function queueForOfflineSync(
  endpoint: string,
  method: string,
  payload: any
): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const { offlineQueue } = await import('@/lib/storage/offline-queue');
    if (offlineQueue) {
      await offlineQueue.enqueue({
        type: 'api',
        endpoint,
        method,
        payload,
      });
    }
  } catch (error) {
    console.error('오프라인 큐 추가 실패:', error);
  }
}

