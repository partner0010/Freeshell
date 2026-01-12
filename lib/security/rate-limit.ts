/**
 * Rate Limiting 유틸리티
 * API 엔드포인트 보호
 */
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  headers: Headers;
}

// 메모리 기반 Rate Limiter (프로덕션에서는 Redis 사용 권장)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimitCheck(
  request: NextRequest,
  maxRequests: number = 60,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const identifier = getIdentifier(request);
  const now = Date.now();
  
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    // 새 레코드 생성
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      reset: now + windowMs,
      headers: createHeaders(maxRequests - 1, now + windowMs),
    };
  }
  
  if (record.count >= maxRequests) {
    // Rate limit 초과
    return {
      allowed: false,
      remaining: 0,
      reset: record.resetTime,
      headers: createHeaders(0, record.resetTime),
    };
  }
  
  // 카운트 증가
  record.count++;
  rateLimitStore.set(identifier, record);
  
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    reset: record.resetTime,
    headers: createHeaders(maxRequests - record.count, record.resetTime),
  };
}

function getIdentifier(request: NextRequest): string {
  // IP 주소 또는 사용자 ID 사용
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip.split(',')[0].trim();
}

function createHeaders(remaining: number, reset: number): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', '60');
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', reset.toString());
  return headers;
}

// 주기적으로 오래된 레코드 정리
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // 1분마다 정리
