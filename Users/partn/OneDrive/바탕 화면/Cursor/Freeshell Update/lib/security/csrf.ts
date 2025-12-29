/**
 * CSRF (Cross-Site Request Forgery) 보호
 */

import { randomBytes, createHash } from 'crypto';

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }

  // 토큰 해시 비교
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const sessionHash = createHash('sha256').update(sessionToken).digest('hex');

  return tokenHash === sessionHash;
}

/**
 * CSRF 토큰을 쿠키에 저장
 */
export function setCSRFTokenCookie(response: Response, token: string): void {
  response.headers.set(
    'Set-Cookie',
    `csrf-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
  );
}

/**
 * 요청에서 CSRF 토큰 추출
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  // 헤더에서 추출
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }

  // 쿠키에서 추출
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies['csrf-token'] || null;
  }

  return null;
}

