import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'

/**
 * 캐시 관리자
 */
export class CacheManager {
  private memoryCache: Map<string, { value: any; expiresAt: number }> = new Map()

  /**
   * 캐시 설정
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000

    // 메모리 캐시
    this.memoryCache.set(key, { value, expiresAt })

    // 데이터베이스 캐시 (영구 저장)
    try {
      const prisma = getPrismaClient()
      await prisma.cache.upsert({
        where: { key },
        update: {
          value: JSON.stringify(value),
          expiresAt: new Date(expiresAt)
        },
        create: {
          key,
          value: JSON.stringify(value),
          expiresAt: new Date(expiresAt)
        }
      })
    } catch (error) {
      logger.warn('데이터베이스 캐시 저장 실패:', error)
    }
  }

  /**
   * 캐시 조회
   */
  async get<T = any>(key: string): Promise<T | null> {
    // 메모리 캐시 확인
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.value as T
    }

    // 만료된 메모리 캐시 제거
    if (memoryEntry) {
      this.memoryCache.delete(key)
    }

    // 데이터베이스 캐시 확인
    try {
      const prisma = getPrismaClient()
      const cache = await prisma.cache.findUnique({
        where: { key }
      })

      if (cache && cache.expiresAt > new Date()) {
        // 메모리 캐시에 다시 저장
        this.memoryCache.set(key, {
          value: JSON.parse(cache.value),
          expiresAt: cache.expiresAt.getTime()
        })

        return JSON.parse(cache.value) as T
      } else if (cache) {
        // 만료된 캐시 삭제
        await prisma.cache.delete({ where: { key } })
      }
    } catch (error) {
      logger.warn('데이터베이스 캐시 조회 실패:', error)
    }

    return null
  }

  /**
   * 캐시 삭제
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)

    try {
      const prisma = getPrismaClient()
      await prisma.cache.delete({ where: { key } })
    } catch (error) {
      logger.warn('데이터베이스 캐시 삭제 실패:', error)
    }
  }

  /**
   * 만료된 캐시 정리
   */
  async cleanup(): Promise<void> {
    const now = Date.now()

    // 메모리 캐시 정리
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key)
      }
    }

    // 데이터베이스 캐시 정리
    try {
      const prisma = getPrismaClient()
      await prisma.cache.deleteMany({
        where: {
          expiresAt: { lte: new Date() }
        }
      })
    } catch (error) {
      logger.warn('데이터베이스 캐시 정리 실패:', error)
    }
  }

  /**
   * 캐시 무효화 (패턴 기반)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern)

    // 메모리 캐시
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
      }
    }

    // 데이터베이스 캐시
    try {
      const prisma = getPrismaClient()
      const caches = await prisma.cache.findMany()
      for (const cache of caches) {
        if (regex.test(cache.key)) {
          await prisma.cache.delete({ where: { key: cache.key } })
        }
      }
    } catch (error) {
      logger.warn('패턴 기반 캐시 무효화 실패:', error)
    }
  }
}

export const cacheManager = new CacheManager()

// 주기적으로 만료된 캐시 정리 (매 1시간마다)
setInterval(() => {
  cacheManager.cleanup().catch(err => logger.error('캐시 정리 오류:', err))
}, 60 * 60 * 1000)

