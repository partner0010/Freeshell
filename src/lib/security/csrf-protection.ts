/**
 * CSRF 보호 시스템
 * Cross-Site Request Forgery 방어
 */

import { NextRequest } from 'next/server';
import { randomBytes, createHmac } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const hmac = createHmac('sha256', CSRF_SECRET)
    .update(token + timestamp)
    .digest('hex');
  
  return `${token}:${timestamp}:${hmac}`;
}

/**
 * CSRF 토큰 검증
 */
export function validateCSRFToken(token: string): boolean {
  try {
    const [tokenPart, timestamp, hmac] = token.split(':');
    
    if (!tokenPart || !timestamp || !hmac) {
      return false;
    }
    
    // 토큰 만료 시간 체크 (1시간)
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    if (now - tokenTime > 3600000) { // 1시간
      return false;
    }
    
    // HMAC 검증
    const expectedHmac = createHmac('sha256', CSRF_SECRET)
      .update(tokenPart + timestamp)
      .digest('hex');
    
    return hmac === expectedHmac;
  } catch (error) {
    return false;
  }
}

/**
 * 요청에서 CSRF 토큰 추출
 */
export function extractCSRFToken(request: NextRequest): string | null {
  // 헤더에서 먼저 확인
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }
  
  // 쿠키에서 확인
  const cookieToken = request.cookies.get('csrf-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  // POST 요청의 경우 body에서 확인
  // (실제로는 미들웨어에서 body를 읽을 수 없으므로 API 라우트에서 처리)
  return null;
}

/**
 * CSRF 보호가 필요한 메서드
 */
export function requiresCSRFProtection(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

/**
 * CSRF 검증 미들웨어
 * API 라우트에서만 검증 (일반 페이지는 제외)
 */
export function validateCSRFRequest(request: NextRequest): { valid: boolean; error?: string } {
  const method = request.method;
  
  // GET, HEAD, OPTIONS는 CSRF 보호 불필요
  if (!requiresCSRFProtection(method)) {
    return { valid: true };
  }
  
  // API 라우트가 아닌 경우 검증 건너뛰기 (일반 페이지 POST는 Next.js가 처리)
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/api/')) {
    return { valid: true };
  }
  
  const token = extractCSRFToken(request);
  
  if (!token) {
    return { valid: false, error: 'CSRF 토큰이 없습니다.' };
  }
  
  if (!validateCSRFToken(token)) {
    return { valid: false, error: 'CSRF 토큰이 유효하지 않습니다.' };
  }
  
  return { valid: true };
}

