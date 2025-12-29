/**
 * Rate Limiting
 * API 요청 제한을 통한 DDoS 및 남용 방지
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 주기적으로 만료된 항목 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // 1분마다
  }

  private cleanup() {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  /**
   * Rate Limit 체크
   * @param identifier 요청자 식별자 (IP 주소 등)
   * @param maxRequests 최대 요청 수
   * @param windowMs 시간 윈도우 (밀리초)
   * @returns 허용 여부 및 남은 요청 수
   */
  check(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const key = identifier;

    if (!this.store[key] || this.store[key].resetTime < now) {
      // 새로운 윈도우 시작
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: this.store[key].resetTime,
      };
    }

    // 기존 윈도우 내 요청
    if (this.store[key].count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime,
      };
    }

    this.store[key].count++;
    return {
      allowed: true,
      remaining: maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime,
    };
  }

  /**
   * Rate Limit 초기화 (테스트용)
   */
  reset(identifier: string) {
    delete this.store[identifier];
  }

  /**
   * 모든 Rate Limit 초기화
   */
  resetAll() {
    this.store = {};
  }

  /**
   * 정리
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.store = {};
  }
}

export const rateLimiter = new RateLimiter();

/**
 * IP 주소 추출
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) {
    return cfConnectingIP.split(',')[0].trim();
  }

  if (realIP) {
    return realIP.split(',')[0].trim();
  }

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return 'unknown';
}

/**
 * Rate Limit 미들웨어 헬퍼
 */
export async function rateLimitCheck(
  request: Request,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  headers: Headers;
}> {
  const ip = getClientIP(request);
  const result = rateLimiter.check(ip, maxRequests, windowMs);

  const headers = new Headers();
  headers.set('X-RateLimit-Limit', maxRequests.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());

  return {
    ...result,
    headers,
  };
}

