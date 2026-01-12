/**
 * CSRF 보호 유틸리티
 * Cross-Site Request Forgery 방지
 */
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex');
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(token);
  return `${token}.${hmac.digest('hex')}`;
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(token: string): boolean {
  if (!token || !token.includes('.')) {
    return false;
  }

  const [tokenPart, signature] = token.split('.');
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(tokenPart);
  const expectedSignature = hmac.digest('hex');

  return signature === expectedSignature;
}

/**
 * CSRF 토큰을 쿠키에 설정
 */
export function setCSRFTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24시간
    path: '/',
  });
}

/**
 * CSRF 토큰을 쿠키에서 가져오기
 */
export function getCSRFTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * CSRF 보호 미들웨어
 */
export async function validateCSRF(request: NextRequest): Promise<{
  valid: boolean;
  error?: string;
}> {
  // GET, HEAD, OPTIONS는 CSRF 검증 제외
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true };
  }

  const tokenFromHeader = request.headers.get(CSRF_TOKEN_HEADER);
  const tokenFromCookie = getCSRFTokenFromCookie(request);

  if (!tokenFromHeader || !tokenFromCookie) {
    return {
      valid: false,
      error: 'CSRF 토큰이 없습니다.',
    };
  }

  if (tokenFromHeader !== tokenFromCookie) {
    return {
      valid: false,
      error: 'CSRF 토큰이 일치하지 않습니다.',
    };
  }

  if (!verifyCSRFToken(tokenFromHeader)) {
    return {
      valid: false,
      error: 'CSRF 토큰이 유효하지 않습니다.',
    };
  }

  return { valid: true };
}

/**
 * CSRF 토큰을 응답에 포함
 */
export function addCSRFTokenToResponse(response: NextResponse): string {
  const token = generateCSRFToken();
  setCSRFTokenCookie(response, token);
  return token;
}