/**
 * 강화된 인증 시스템
 * 로그인, 회원가입, 마이페이지 보안 강화
 */
'use server';

import { hash, compare } from 'bcryptjs';
import { createSession, verifySession, destroySession, getDeviceFingerprint } from './session-enhanced';
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from './input-validation';
import { rateLimitCheck } from './rate-limit';

const SALT_ROUNDS = 12; // 강력한 해싱
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15분

interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

// 실제로는 데이터베이스 사용
// 서버 사이드에서 사용할 수 있는 영구 저장소 (파일 기반 또는 DB)
let users: Map<string, User> = new Map();
let loginAttempts: Map<string, { count: number; lockedUntil?: Date }> = new Map();

// 초기화 플래그
let adminAccountsInitialized = false;

// 초기화 시 관리자 계정 생성 (지연 초기화)
async function initializeAdminAccounts() {
  if (adminAccountsInitialized) return;
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@freeshell.co.kr';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';
  const testEmail = process.env.TEST_EMAIL || 'test@freeshell.co.kr';
  const testPassword = process.env.TEST_PASSWORD || 'Test123!@#';

  // 관리자 계정이 없으면 생성
  const existingAdmin = Array.from(users.values()).find(u => u.email === adminEmail);
  if (!existingAdmin) {
    const adminPasswordHash = await hash(adminPassword, SALT_ROUNDS);
    const adminUser: User = {
      id: 'admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: '관리자',
      role: 'admin',
      emailVerified: true,
      createdAt: new Date(),
      loginAttempts: 0,
      twoFactorEnabled: false,
    };
    users.set('admin', adminUser);
    console.log('[Auth] 관리자 계정 초기화 완료:', adminEmail);
  }

  // 테스트 계정이 없으면 생성
  const existingTest = Array.from(users.values()).find(u => u.email === testEmail);
  if (!existingTest) {
    const testPasswordHash = await hash(testPassword, SALT_ROUNDS);
    const testUser: User = {
      id: 'test',
      email: testEmail,
      passwordHash: testPasswordHash,
      name: '테스트',
      role: 'admin',
      emailVerified: true,
      createdAt: new Date(),
      loginAttempts: 0,
      twoFactorEnabled: false,
    };
    users.set('test', testUser);
    console.log('[Auth] 테스트 계정 초기화 완료:', testEmail);
  }

  adminAccountsInitialized = true;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  request: NextRequest
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // 관리자 계정 초기화 (지연 초기화)
    await initializeAdminAccounts();

    // Rate limiting
    const rateLimit = await rateLimitCheck(request, 5, 60000);
    if (!rateLimit.allowed) {
      return { success: false, error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' };
    }

    // 입력 검증
    const emailValidation = validateInput(email, {
      type: 'email',
      maxLength: 255,
      required: true,
    });
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = validateInput(password, {
      minLength: 8,
      maxLength: 128,
      required: true,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    });
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: '비밀번호는 최소 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.',
      };
    }

    const nameValidation = validateInput(name, {
      minLength: 2,
      maxLength: 50,
      required: true,
    });
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error };
    }

    // 이메일 중복 확인
    const existingUser = Array.from(users.values()).find(u => u.email === emailValidation.sanitized);
    if (existingUser) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }

    // 비밀번호 해싱
    const passwordHash = await hash(password, SALT_ROUNDS);

    // 사용자 생성
    const userId = `user_${Date.now()}`;
    const user: User = {
      id: userId,
      email: emailValidation.sanitized!,
      passwordHash,
      name: nameValidation.sanitized!,
      role: 'user',
      emailVerified: false,
      createdAt: new Date(),
      loginAttempts: 0,
      twoFactorEnabled: false,
    };

    users.set(userId, user);

    return { success: true, userId };
  } catch (error: any) {
    console.error('[Auth] 회원가입 오류:', error);
    return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
  }
}

export async function loginUser(
  email: string,
  password: string,
  request: NextRequest
): Promise<{ success: boolean; error?: string; token?: string }> {
  try {
    // 관리자 계정 초기화 (지연 초기화)
    await initializeAdminAccounts();

    // Rate limiting
    const rateLimit = await rateLimitCheck(request, 10, 60000);
    if (!rateLimit.allowed) {
      return { success: false, error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' };
    }

    // 입력 검증
    const emailValidation = validateInput(email, { type: 'email', required: true });
    if (!emailValidation.valid) {
      return { success: false, error: '유효한 이메일을 입력해주세요.' };
    }

    // 사용자 찾기
    const user = Array.from(users.values()).find(u => u.email === emailValidation.sanitized);
    if (!user) {
      // 사용자가 없어도 동일한 응답 시간 (타이밍 공격 방지)
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    // 계정 잠금 확인
    const attempts = loginAttempts.get(user.id);
    if (attempts?.lockedUntil && attempts.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((attempts.lockedUntil.getTime() - Date.now()) / 60000);
      return {
        success: false,
        error: `계정이 잠겼습니다. ${remainingMinutes}분 후 다시 시도해주세요.`,
      };
    }

    // 비밀번호 확인
    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      // 실패 횟수 증가
      const currentAttempts = loginAttempts.get(user.id) || { count: 0 };
      currentAttempts.count += 1;

      if (currentAttempts.count >= MAX_LOGIN_ATTEMPTS) {
        currentAttempts.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        return {
          success: false,
          error: '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.',
        };
      }

      loginAttempts.set(user.id, currentAttempts);
      return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    // 성공 - 실패 횟수 초기화
    loginAttempts.delete(user.id);
    user.lastLogin = new Date();
    user.loginAttempts = 0;

    // 세션 생성
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const deviceFingerprint = getDeviceFingerprint(request);

    const token = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      ipAddress,
      userAgent,
      loginMethod: 'email',
      deviceFingerprint,
    });

    return { success: true, token };
  } catch (error: any) {
    console.error('[Auth] 로그인 오류:', error);
    return { success: false, error: '로그인 중 오류가 발생했습니다.' };
  }
}

export async function logoutUser(request: NextRequest): Promise<void> {
  await destroySession();
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const session = await verifySession(request);
  if (!session) return null;

  const user = users.get(session.userId);
  return user || null;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.ip || 'unknown';
}

// 로컬 함수는 제거 (session-enhanced에서 import 사용)
