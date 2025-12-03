/**
 * ⚡ 캐시 최적화 시스템 - Redis + 메모리 캐시
 * 다층 캐싱 전략으로 초고속 응답
 */

import Redis from 'ioredis'
import { logger } from '../../utils/logger'
import crypto from 'crypto'

interface CacheOptions {
  ttl?: number // 초 단위
  compress?: boolean
  tags?: string[]
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  hitRate: number
}

class CacheOptimizer {
  private redis: Redis | null = null
  private memoryCache: Map<string, { value: any; expires: number }> = new Map()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0
  }

  constructor() {
    this.initializeRedis()
    this.startCleanupInterval()
    logger.info('⚡ 캐시 최적화 시스템 초기화')
  }

  /**
   * 🔴 Redis 초기화
   */
  private initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
      
      this.redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 2) {
            // 재시도 중단
            this.redis = null
            return null
          }
          return null // 즉시 포기
        },
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        lazyConnect: true // 지연 연결
      })

      // 연결 시도 (타임아웃 2초)
      this.redis.connect().then(() => {
        logger.info('✅ Redis 연결 성공')
      }).catch(() => {
        logger.warn('⚠️ Redis 미연결 - 메모리 캐시 사용 (정상 작동)')
        this.redis = null
      })

      this.redis.on('error', () => {
        // 에러 로그 무시 (이미 처리됨)
      })
    } catch (error: any) {
      logger.warn('⚠️ Redis 사용 불가 - 메모리 캐시만 사용 (정상 작동)')
      this.redis = null
    }
  }

  /**
   * 💾 캐시 저장 (다층)
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      const ttl = options.ttl || 300 // 기본 5분

      // 메모리 캐시 (L1)
      this.memoryCache.set(key, {
        value,
        expires: Date.now() + ttl * 1000
      })

      // Redis 캐시 (L2)
      if (this.redis) {
        await this.redis.setex(key, ttl, serialized)
      }

      // 태그 추가
      if (options.tags && this.redis) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${tag}`, key)
        }
      }

      this.stats.sets++
      logger.debug(`💾 캐시 저장: ${key} (TTL: ${ttl}s)`)
    } catch (error: any) {
      logger.error('캐시 저장 실패:', error)
    }
  }

  /**
   * 📥 캐시 읽기 (다층)
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      // L1: 메모리 캐시 확인
      const memCached = this.memoryCache.get(key)
      if (memCached) {
        if (memCached.expires > Date.now()) {
          this.stats.hits++
          this.updateHitRate()
          logger.debug(`✨ L1 캐시 히트: ${key}`)
          return memCached.value as T
        } else {
          this.memoryCache.delete(key)
        }
      }

      // L2: Redis 캐시 확인
      if (this.redis) {
        const cached = await this.redis.get(key)
        if (cached) {
          const value = JSON.parse(cached)
          
          // L1 캐시에도 저장
          this.memoryCache.set(key, {
            value,
            expires: Date.now() + 60000 // 1분
          })

          this.stats.hits++
          this.updateHitRate()
          logger.debug(`✨ L2 캐시 히트: ${key}`)
          return value as T
        }
      }

      this.stats.misses++
      this.updateHitRate()
      return null
    } catch (error: any) {
      logger.error('캐시 읽기 실패:', error)
      return null
    }
  }

  /**
   * 🗑️ 캐시 삭제
   */
  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key)

      if (this.redis) {
        await this.redis.del(key)
      }

      this.stats.deletes++
      logger.debug(`🗑️ 캐시 삭제: ${key}`)
    } catch (error: any) {
      logger.error('캐시 삭제 실패:', error)
    }
  }

  /**
   * 🏷️ 태그로 캐시 삭제
   */
  async deleteByTag(tag: string): Promise<void> {
    try {
      if (!this.redis) return

      const keys = await this.redis.smembers(`tag:${tag}`)
      
      if (keys.length > 0) {
        await this.redis.del(...keys)
        await this.redis.del(`tag:${tag}`)
        
        keys.forEach(key => this.memoryCache.delete(key))
        
        logger.info(`🏷️ 태그로 캐시 삭제: ${tag} (${keys.length}개)`)
      }
    } catch (error: any) {
      logger.error('태그 캐시 삭제 실패:', error)
    }
  }

  /**
   * 🧹 모든 캐시 삭제
   */
  async flush(): Promise<void> {
    try {
      this.memoryCache.clear()

      if (this.redis) {
        await this.redis.flushdb()
      }

      logger.info('🧹 모든 캐시 삭제')
    } catch (error: any) {
      logger.error('캐시 플러시 실패:', error)
    }
  }

  /**
   * 🔄 캐시 갱신 (만료 시간 연장)
   */
  async refresh(key: string, ttl: number = 300): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.expire(key, ttl)
      }

      const memCached = this.memoryCache.get(key)
      if (memCached) {
        memCached.expires = Date.now() + ttl * 1000
      }

      logger.debug(`🔄 캐시 갱신: ${key} (TTL: ${ttl}s)`)
    } catch (error: any) {
      logger.error('캐시 갱신 실패:', error)
    }
  }

  /**
   * 🎯 캐시 또는 실행 (Cache-Aside 패턴)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // 캐시 확인
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // 캐시 미스 - 값 생성
    const value = await factory()
    await this.set(key, value, options)

    return value
  }

  /**
   * 📊 캐시 통계
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 📈 히트율 업데이트
   */
  private updateHitRate() {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * 🧹 메모리 캐시 정리 (만료된 항목)
   */
  private startCleanupInterval() {
    setInterval(() => {
      const now = Date.now()
      let cleaned = 0

      for (const [key, item] of this.memoryCache.entries()) {
        if (item.expires < now) {
          this.memoryCache.delete(key)
          cleaned++
        }
      }

      if (cleaned > 0) {
        logger.debug(`🧹 메모리 캐시 정리: ${cleaned}개 항목`)
      }
    }, 60000) // 1분마다
  }

  /**
   * 🔑 캐시 키 생성 헬퍼
   */
  generateKey(prefix: string, ...args: any[]): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(args))
      .digest('hex')
      .substring(0, 8)

    return `${prefix}:${hash}`
  }

  /**
   * 💾 메모리 사용량
   */
  getMemoryUsage(): {
    entries: number
    estimatedSize: string
  } {
    const entries = this.memoryCache.size
    const estimatedSize = (entries * 1024).toString() // 대략적인 추정

    return {
      entries,
      estimatedSize: `${(parseInt(estimatedSize) / 1024 / 1024).toFixed(2)} MB`
    }
  }
}

// 싱글톤 인스턴스
export const cacheOptimizer = new CacheOptimizer()

export default cacheOptimizer

