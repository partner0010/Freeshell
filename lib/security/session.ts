/**
 * 세션 관리 강화
 * 보안 세션 관리 및 타임아웃
 */
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { randomBytes } from 'crypto';

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-session-secret-key-change-in-production-min-32-chars'
);

const SESSION_COOKIE_NAME = 'session-token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일
const SESSION_IDLE_TIMEOUT = 60 * 60 * 2; // 2시간 (비활성 시)

interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
}

/**
 * 세션 생성
 */
export async function createSession(
  userId: string,
  email: string,
  role: string,
  request: NextRequest
): Promise<string> {
  const now = Date.now();
  const ipAddress = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const sessionData: SessionData = {
    userId,
    email,
    role,
    createdAt: now,
    lastActivity: now,
    ipAddress,
    userAgent,
  };

  const token = await new SignJWT(sessionData as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(now / 1000) + SESSION_MAX_AGE)
    .sign(SESSION_SECRET);

  return token;
}

/**
 * 세션 검증
 */
export async function verifySession(
  request: NextRequest
): Promise<{ valid: boolean; data?: SessionData; error?: string }> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return { valid: false, error: '세션이 없습니다.' };
  }

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    const sessionData = payload as unknown as SessionData;

    // 비활성 타임아웃 검사
    const now = Date.now();
    const idleTime = now - sessionData.lastActivity;
    
    if (idleTime > SESSION_IDLE_TIMEOUT * 1000) {
      return { valid: false, error: '세션이 만료되었습니다. (비활성)' };
    }

    // IP 주소 변경 감지 (보안 강화)
    const currentIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    if (sessionData.ipAddress !== currentIp.split(',')[0].trim()) {
      // IP 변경 시 경고 (선택적으로 세션 무효화)
      console.warn('세션 IP 주소 변경 감지:', {
        original: sessionData.ipAddress,
        current: currentIp,
      });
    }

    // 마지막 활동 시간 업데이트
    sessionData.lastActivity = now;

    return { valid: true, data: sessionData };
  } catch (error: any) {
    return { valid: false, error: '세션이 유효하지 않습니다.' };
  }
}

/**
 * 세션 쿠키 설정
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * 세션 삭제
 */
export function deleteSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}

/**
 * 세션 갱신 (활동 시간 업데이트)
 */
export async function refreshSession(
  request: NextRequest,
  response: NextResponse
): Promise<boolean> {
  const session = await verifySession(request);
  
  if (!session.valid || !session.data) {
    return false;
  }

  // 새로운 토큰 생성 (활동 시간 업데이트)
  const newToken = await new SignJWT({
    ...session.data,
    lastActivity: Date.now(),
  } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE)
    .sign(SESSION_SECRET);

  setSessionCookie(response, newToken);
  return true;
}

/**
 * 세션 고정 공격 방지
 */
export function regenerateSessionId(): string {
  return randomBytes(32).toString('hex');
}
