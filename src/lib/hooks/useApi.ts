/**
 * API 호출 커스텀 훅
 * React Query 스타일의 데이터 페칭
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, ApiResponse } from '@/lib/api/api-client';

export interface UseApiOptions {
  immediate?: boolean; // 즉시 실행 여부
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseApiResult<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * API 호출 훅
 */
export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall(...args);

        if (!mountedRef.current) {
          return null;
        }

        if (response.ok && response.data) {
          setData(response.data);
          options.onSuccess?.(response.data);
          return response.data;
        } else {
          const error = new Error(
            (response.data as any)?.error || (response.data as any)?.message || 'API 요청 실패'
          );
          setError(error);
          options.onError?.(error);
          return null;
        }
      } catch (err: any) {
        if (!mountedRef.current) {
          return null;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiCall, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // 즉시 실행
  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [options.immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

