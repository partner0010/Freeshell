/**
 * 캐싱 전략 관리자
 * API 응답 및 정적 자산 캐싱
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000; // 최대 캐시 항목 수

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, ttl: number = 3600000): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // TTL 확인
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 캐시에서 데이터 삭제
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 캐시 전체 삭제
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 가장 오래된 항목 제거
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 만료된 항목 정리
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 캐시 통계
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 싱글톤 인스턴스
export const cacheManager = new CacheManager();

// 주기적으로 만료된 항목 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * 캐시 키 생성 헬퍼
 */
export function createCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

/**
 * API 응답 캐싱 래퍼
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  ttl: number = 3600000 // 1시간 기본값
): Promise<T> {
  const cacheKey = createCacheKey('api', url, JSON.stringify(options));
  
  // 캐시에서 확인
  const cached = cacheManager.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // API 호출
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as T;
  
  // 캐시에 저장
  cacheManager.set(cacheKey, data, ttl);
  
  return data;
}

