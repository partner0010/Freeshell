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

/**
 * 캐시에서 값 가져오기
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()
    if (!client) return null

    const value = await client.get(key)
    if (!value) return null

    return JSON.parse(value) as T
  } catch (error) {
    logger.warn('캐시 조회 실패:', error)
    return null
  }
}

/**
 * 캐시에 값 저장하기
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = 3600 // 기본 1시간
): Promise<boolean> {
  try {
    const client = getRedisClient()
    if (!client) return false

    const serialized = JSON.stringify(value)
    await client.setex(key, ttl, serialized)
    return true
  } catch (error) {
    logger.warn('캐시 저장 실패:', error)
    return false
  }
}

/**
 * 캐시 삭제
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient()
    if (!client) return false

    await client.del(key)
    return true
  } catch (error) {
    logger.warn('캐시 삭제 실패:', error)
    return false
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

