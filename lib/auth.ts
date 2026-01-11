/**
 * 인증 유틸리티
 * 간단한 세션 관리 및 인증 헬퍼 함수
 */
import { cookies } from 'next/headers';
import { userService } from './services/userService';
import bcrypt from 'bcryptjs';

// 클라이언트 사이드 세션 관리 (브라우저 localStorage 사용)
if (typeof window !== 'undefined') {
  // 클라이언트 사이드에서는 localStorage 사용
  (globalThis as any).__sessionStorage = {
    get: (key: string) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    },
    set: (key: string, value: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('localStorage 저장 실패:', e);
      }
    },
    remove: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('localStorage 삭제 실패:', e);
      }
    },
  };
}

export interface AuthUser {
  id: string;
  email: string;
  plan: 'free' | 'personal' | 'pro' | 'enterprise';
}

/**
 * 세션 생성
 */
export async function createSession(userId: string, email: string, plan: 'free' | 'personal' | 'pro' | 'enterprise') {
  const cookieStore = await cookies();
  const sessionToken = crypto.randomUUID(); // 세션 토큰 생성
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일
  
  const sessionData = {
    userId,
    email,
    plan,
    sessionToken,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  cookieStore.set('session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7일
  });

  return sessionToken;
}

/**
 * 세션 조회
 */
export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionData = JSON.parse(sessionCookie.value);
    
    // 만료 확인
    if (new Date(sessionData.expiresAt) < new Date()) {
      await destroySession();
      return null;
    }
    
    // 세션 토큰 확인
    if (!sessionData.sessionToken) {
      await destroySession();
      return null;
    }

    // 세션 갱신 (7일 중 3일이 지나면 자동 갱신)
    const createdAt = new Date(sessionData.createdAt);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation > 3) {
      // 세션 갱신
      const newSessionToken = crypto.randomUUID();
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const updatedSessionData = {
        ...sessionData,
        sessionToken: newSessionToken,
        expiresAt: newExpiresAt.toISOString(),
        createdAt: sessionData.createdAt, // 원래 생성 시간 유지
      };
      
      cookieStore.set('session', JSON.stringify(updatedSessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
      });
    }
    
    return {
      id: sessionData.userId,
      email: sessionData.email,
      plan: sessionData.plan,
    };
  } catch (error) {
    return null;
  }
}

/**
 * 세션 삭제
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

/**
 * 비밀번호 해시
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

