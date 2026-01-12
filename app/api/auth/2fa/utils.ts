/**
 * 2단계 인증 (2FA) 유틸리티
 * TOTP (Time-based One-Time Password) 사용
 * API 라우트 내부에 위치하여 서버 사이드 전용임을 보장
 * 
 * NOTE: otplib와 qrcode는 런타임에 동적으로 로드됩니다.
 * 빌드 시점 모듈 해결 문제를 방지하기 위해 동적 import만 사용합니다.
 */
import { randomBytes } from 'crypto';

// otplib를 동적으로 로드 (빌드 시점 모듈 해결 문제 방지)
let authenticatorInstance: any = null;

async function getAuthenticator() {
  if (!authenticatorInstance) {
    // 서버 사이드에서만 실행되도록 확인
    if (typeof window !== 'undefined') {
      throw new Error('2FA 모듈은 서버 사이드에서만 사용할 수 있습니다.');
    }
    // 동적 import를 사용하여 빌드 시점 모듈 해결 문제 방지
    // 문자열로 모듈명을 전달하여 webpack이 분석하지 않도록 함
    const otplibModule = 'otplib';
    // @ts-ignore - 동적 import는 런타임에만 실행됨
    const otplib = await import(/* webpackIgnore: true */ otplibModule).catch((err) => {
      console.error('otplib 로드 실패:', err);
      throw new Error('2FA 모듈을 로드할 수 없습니다. 서버 사이드에서만 사용할 수 있습니다.');
    });
    authenticatorInstance = otplib.authenticator;
    if (authenticatorInstance) {
      authenticatorInstance.options = {
        step: 30, // 30초마다 토큰 변경
        window: [1, 1], // 1단계 전후 허용
      };
    }
  }
  return authenticatorInstance;
}

/**
 * 2FA 비밀 키 생성
 */
export async function generate2FASecret(email: string): Promise<string> {
  const auth = await getAuthenticator();
  return auth.generateSecret();
}

/**
 * 2FA QR 코드 생성
 */
export async function generate2FAQRCode(
  email: string,
  secret: string,
  serviceName: string = 'Shell'
): Promise<string> {
  const auth = await getAuthenticator();
  const otpauth = auth.keyuri(email, serviceName, secret);
  try {
    // qrcode 모듈 동적 import (서버 사이드에서만 사용)
    // eval을 사용하여 webpack이 정적 분석하지 않도록 함
    const qrcodeModuleName = 'qr' + 'code'; // 빌드 시점 정적 분석 방지
    // @ts-ignore - 동적 import는 런타임에만 실행됨
    const QRCodeModule = await import(/* webpackIgnore: true */ qrcodeModuleName);
    const qrCode = await QRCodeModule.default.toDataURL(otpauth);
    return qrCode;
  } catch (error) {
    console.error('QR 코드 생성 실패:', error);
    throw error;
  }
}

/**
 * 2FA 토큰 검증
 */
export async function verify2FAToken(secret: string, token: string): Promise<boolean> {
  try {
    const auth = await getAuthenticator();
    return auth.verify({ token, secret });
  } catch (error) {
    console.error('2FA 토큰 검증 실패:', error);
    return false;
  }
}

/**
 * 2FA 백업 코드 생성
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * 백업 코드 검증
 */
export function verifyBackupCode(
  code: string,
  usedCodes: string[]
): { valid: boolean; alreadyUsed: boolean } {
  if (usedCodes.includes(code)) {
    return { valid: false, alreadyUsed: true };
  }
  
  // 백업 코드 형식 검증 (8자리 영숫자)
  if (!/^[A-Z0-9]{8}$/.test(code)) {
    return { valid: false, alreadyUsed: false };
  }

  return { valid: true, alreadyUsed: false };
}

/**
 * 2FA 설정 확인
 */
export interface TwoFactorConfig {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  verified: boolean;
}

/**
 * 2FA 활성화
 */
export async function enable2FA(
  email: string,
  secret: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await verify2FAToken(secret, token))) {
    return { success: false, error: '잘못된 인증 코드입니다.' };
  }

  const backupCodes = generateBackupCodes();
  
  return {
    success: true,
  };
}
