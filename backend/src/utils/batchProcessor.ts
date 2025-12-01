/**
 * 배치 처리 최적화 유틸리티
 * 대량 데이터 처리 시 성능 향상
 */

import { logger } from './logger'

/**
 * 배치 처리 (청크 단위로 나누어 처리)
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = []
  const batches: T[][] = []

  // 청크로 나누기
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  // 배치 병렬 처리
  const executing: Promise<void>[] = []

  for (const batch of batches) {
    const promise = (async () => {
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      )
      results.push(...batchResults)
    })()

    executing.push(promise)

    // 동시 실행 수 제한
    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(0, 1)
    }
  }

  await Promise.all(executing)
  return results
}

/**
 * 스트리밍 배치 처리 (메모리 효율적)
 */
export async function* processBatchStream<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): AsyncGenerator<R[], void, unknown> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const results = await Promise.all(batch.map(item => processor(item)))
    yield results
  }
}

/**
 * 재시도 로직이 있는 배치 처리
 */
export async function processBatchWithRetry<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number
    maxRetries?: number
    retryDelay?: number
  } = {}
): Promise<{ success: R[]; failed: Array<{ item: T; error: Error }> }> {
  const { batchSize = 10, maxRetries = 3, retryDelay = 1000 } = options
  const success: R[] = []
  const failed: Array<{ item: T; error: Error }> = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    for (const item of batch) {
      let lastError: Error | null = null

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await processor(item)
          success.push(result)
          break
        } catch (error: any) {
          lastError = error
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
          }
        }
      }

      if (lastError) {
        failed.push({ item, error: lastError })
      }
    }
  }

  return { success, failed }
}

