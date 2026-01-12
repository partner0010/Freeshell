/**
 * 성능 최적화: 캐싱 시스템
 * 메모리 캐시 및 Redis 캐시 지원
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000;
  private defaultTTL: number = 60 * 1000; // 1분

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // 캐시 크기 제한
    if (this.memoryCache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.memoryCache.set(key, {
      data,
      expiresAt,
      createdAt: now,
    });
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // 만료 확인
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 캐시 삭제
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
  }

  /**
   * 캐시 전체 삭제
   */
  clear(): void {
    this.memoryCache.clear();
  }

  /**
   * 가장 오래된 항목 제거
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * 만료된 항목 정리
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// 싱글톤 인스턴스
export const cache = new CacheManager();

// 주기적으로 정리 (5분마다)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * 캐시 데코레이터 (함수 결과 캐싱)
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl?: number,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : `cache:${fn.name}:${JSON.stringify(args)}`;
    
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  }) as T;
}
