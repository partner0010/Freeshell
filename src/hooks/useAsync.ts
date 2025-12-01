/**
 * 비동기 작업을 위한 커스텀 훅
 * 로딩 상태, 에러 처리, 재시도 로직 포함
 */

import { useState, useCallback } from 'react'
import { useToast } from '../components/Toast'

interface UseAsyncOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showToast?: boolean
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError, showToast = true } = options
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)
  const toast = useToast()

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
      
      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      
      if (showToast) {
        toast.error(error.message || '오류가 발생했습니다')
      }

      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setLoading(false)
    }
  }, [asyncFunction, onSuccess, onError, showToast, toast])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}

