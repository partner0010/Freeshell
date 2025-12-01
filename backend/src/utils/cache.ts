/**
 * Redis 캐싱 유틸리티
 * AI 응답, 트렌드 데이터 등을 캐싱하여 성능 향상
 */

import Redis from 'ioredis'
import { logger } from './logger'

let redisClient: Redis | null = null

/**
 * Redis 클라이언트 초기화
 */
export function initRedis(): Redis | null {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true
    })

    redisClient.on('connect', () => {
      logger.info('Redis 연결 성공')
    })

    redisClient.on('error', (error) => {
      logger.warn('Redis 연결 실패 (캐싱 없이 계속 진행):', error.message)
      redisClient = null
    })

    return redisClient
  } catch (error) {
    logger.warn('Redis 초기화 실패 (캐싱 없이 계속 진행):', error)
    return null
  }
}

/**
 * Redis 클라이언트 가져오기
 */
export function getRedisClient(): Redis | null {
  if (!redisClient) {
    return initRedis()
  }
  return redisClient
}

// 메모리 캐시 (Redis가 없을 때 사용)
const memoryCache = new Map<string, { value: any; expiresAt: number }>()

/**
 * 캐시에서 값 가져오기 (메모리 + Redis)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // 메모리 캐시 확인
  const memoryCached = memoryCache.get(key)
  if (memoryCached && memoryCached.expiresAt > Date.now()) {
    return memoryCached.value as T
  }

  // Redis 캐시 확인
  try {
    const client = getRedisClient()
    if (!client) return null

    const value = await client.get(key)
    if (!value) return null

    const parsed = JSON.parse(value) as T
    
    // 메모리 캐시에도 저장 (5분)
    memoryCache.set(key, {
      value: parsed,
      expiresAt: Date.now() + 5 * 60 * 1000
    })

    return parsed
  } catch (error) {
    logger.warn('캐시 조회 실패:', error)
    return null
  }
}

/**
 * 캐시에 값 저장하기 (메모리 + Redis)
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = 3600 // 기본 1시간 (초)
): Promise<boolean> {
  // 메모리 캐시 저장 (최대 5분)
  const memoryTtl = Math.min(ttl, 300) // 5분
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + memoryTtl * 1000
  })

  // Redis 캐시 저장
  try {
    const client = getRedisClient()
    if (!client) return true // 메모리 캐시만 저장해도 성공

    const serialized = JSON.stringify(value)
    await client.setex(key, ttl, serialized)
    return true
  } catch (error) {
    logger.warn('Redis 캐시 저장 실패 (메모리 캐시는 저장됨):', error)
    return true // 메모리 캐시는 저장되었으므로 성공
  }
}

/**
 * 캐시 삭제 (메모리 + Redis)
 */
export async function deleteCache(key: string): Promise<boolean> {
  // 메모리 캐시 삭제
  memoryCache.delete(key)

  // Redis 캐시 삭제
  try {
    const client = getRedisClient()
    if (!client) return true // 메모리 캐시는 삭제되었으므로 성공

    await client.del(key)
    return true
  } catch (error) {
    logger.warn('Redis 캐시 삭제 실패 (메모리 캐시는 삭제됨):', error)
    return true // 메모리 캐시는 삭제되었으므로 성공
  }
}

/**
 * 패턴으로 캐시 삭제
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient()
    if (!client) return 0

    const keys = await client.keys(pattern)
    if (keys.length === 0) return 0

    return await client.del(...keys)
  } catch (error) {
    logger.warn('패턴 캐시 삭제 실패:', error)
    return 0
  }
}

/**
 * 캐시 키 생성 헬퍼
 */
export function createCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`
}

/**
 * AI 응답 캐시 키
 */
export function getAIResponseCacheKey(topic: string, contentType: string): string {
  return createCacheKey('ai:response', topic, contentType)
}

/**
 * 트렌드 데이터 캐시 키
 */
export function getTrendCacheKey(keyword: string): string {
  return createCacheKey('trend', keyword)
}

/**
 * 콘텐츠 생성 캐시 키
 */
export function getContentCacheKey(contentId: string): string {
  return createCacheKey('content', contentId)
}

