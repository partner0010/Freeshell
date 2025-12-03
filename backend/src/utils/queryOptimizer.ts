/**
 * 데이터베이스 쿼리 최적화 유틸리티
 * N+1 문제 해결 및 배치 쿼리 최적화
 */

import { getPrismaClient } from './database'
import { logger } from './logger'
import { databaseQueryDuration } from '../services/monitoring/metrics'

/**
 * 배치 조회 최적화 (N+1 문제 해결)
 */
export async function batchFindMany<T>(
  ids: string[],
  model: any,
  include?: any,
  select?: any
): Promise<T[]> {
  const startTime = Date.now()
  const prisma = getPrismaClient()

  try {
    const results = await model.findMany({
      where: {
        id: { in: ids }
      },
      include,
      select
    })

    const duration = (Date.now() - startTime) / 1000
    databaseQueryDuration.observe(
      { operation: 'batch_find', table: model.name || 'unknown' },
      duration
    )

    return results as T[]
  } catch (error) {
    logger.error('배치 조회 실패:', error)
    throw error
  }
}

/**
 * 페이지네이션 최적화
 */
export async function paginatedQuery<T>(
  model: any,
  options: {
    page: number
    pageSize: number
    where?: any
    orderBy?: any
    include?: any
    select?: any
  }
): Promise<{
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const startTime = Date.now()
  const prisma = getPrismaClient()

  try {
    const { page, pageSize, where, orderBy, include, select } = options
    const skip = (page - 1) * pageSize

    // 병렬로 데이터와 총 개수 조회
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        include,
        select,
        skip,
        take: pageSize
      }),
      model.count({ where })
    ])

    const duration = (Date.now() - startTime) / 1000
    databaseQueryDuration.observe(
      { operation: 'paginated_query', table: model.name || 'unknown' },
      duration
    )

    return {
      data: data as T[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  } catch (error) {
    logger.error('페이지네이션 쿼리 실패:', error)
    throw error
  }
}

/**
 * 관계 데이터 포함 최적화 (include 최적화)
 */
export function optimizeInclude(include: any): any {
  // 불필요한 중첩 include 제거
  // 실제로는 더 정교한 최적화 필요
  return include
}

/**
 * 쿼리 결과 캐싱
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const { getCache, setCache } = await import('./cache')
  
  // 캐시 확인
  const cached = await getCache<T>(cacheKey)
  if (cached) {
    return cached
  }

  // 쿼리 실행
  const result = await queryFn()

  // 캐시 저장
  await setCache(cacheKey, result, ttl)

  return result
}

/**
 * 트랜잭션 최적화
 */
export async function optimizedTransaction<T>(
  operations: Array<(tx: any) => Promise<any>>
): Promise<T[]> {
  const prisma = getPrismaClient()
  const startTime = Date.now()

  try {
    const results = await prisma.$transaction(operations as any, {
      maxWait: 5000, // 최대 대기 시간
      timeout: 10000 // 타임아웃
    })

    const duration = (Date.now() - startTime) / 1000
    databaseQueryDuration.observe(
      { operation: 'transaction', table: 'multiple' },
      duration
    )

    return results as T[]
  } catch (error) {
    logger.error('트랜잭션 실패:', error)
    throw error
  }
}

