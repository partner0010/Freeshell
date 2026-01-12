/**
 * 2FA 인증 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { generate2FASecret, generate2FAQRCode, verify2FAToken, generateBackupCodes } from './utils';
import { verifySession } from '@/lib/security/session';
import { validateCSRF } from '@/lib/security/csrf';

// 실제로는 데이터베이스에 저장
const user2FA: Map<string, {
  secret: string;
  enabled: boolean;
  backupCodes: string[];
  verified: boolean;
}> = new Map();

export async function POST(request: NextRequest) {
  try {
    // CSRF 검증
    const csrfValidation = await validateCSRF(request);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: csrfValidation.error },
        { status: 403 }
      );
    }

    // 세션 검증
    const session = await verifySession(request);
    if (!session.valid || !session.data) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, token, backupCode } = body;

    switch (action) {
      case 'generate':
        // 2FA 비밀 키 생성
        const secret = await generate2FASecret(session.data.email);
        const qrCode = await generate2FAQRCode(session.data.email, secret);
        const backupCodes = generateBackupCodes();

        user2FA.set(session.data.userId, {
          secret,
          enabled: false,
          backupCodes,
          verified: false,
        });

        return NextResponse.json({
          success: true,
          secret,
          qrCode,
          backupCodes,
        });

      case 'verify':
        // 2FA 토큰 검증
        const user2FAData = user2FA.get(session.data.userId);
        if (!user2FAData) {
          return NextResponse.json(
            { error: '2FA가 설정되지 않았습니다.' },
            { status: 400 }
          );
        }

        if (token) {
          // TOTP 토큰 검증
          const isValid = await verify2FAToken(user2FAData.secret, token);
          if (!isValid) {
            return NextResponse.json(
              { error: '잘못된 인증 코드입니다.' },
              { status: 400 }
            );
          }
        } else if (backupCode) {
          // 백업 코드 검증
          if (!user2FAData.backupCodes.includes(backupCode)) {
            return NextResponse.json(
              { error: '잘못된 백업 코드입니다.' },
              { status: 400 }
            );
          }
          // 백업 코드 제거 (일회용)
          user2FAData.backupCodes = user2FAData.backupCodes.filter(c => c !== backupCode);
        } else {
          return NextResponse.json(
            { error: '인증 코드 또는 백업 코드가 필요합니다.' },
            { status: 400 }
          );
        }

        // 2FA 활성화
        user2FAData.enabled = true;
        user2FAData.verified = true;
        user2FA.set(session.data.userId, user2FAData);

        return NextResponse.json({
          success: true,
          message: '2FA가 활성화되었습니다.',
        });

      case 'disable':
        // 2FA 비활성화
        user2FA.delete(session.data.userId);
        return NextResponse.json({
          success: true,
          message: '2FA가 비활성화되었습니다.',
        });

      default:
        return NextResponse.json(
          { error: '잘못된 액션입니다.' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[2FA API] 오류:', error);
    return NextResponse.json(
      { error: '2FA 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 세션 검증
    const session = await verifySession(request);
    if (!session.valid || !session.data) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user2FAData = user2FA.get(session.data.userId);

    return NextResponse.json({
      success: true,
      enabled: user2FAData?.enabled || false,
      verified: user2FAData?.verified || false,
    });
  } catch (error: any) {
    console.error('[2FA API] GET 오류:', error);
    return NextResponse.json(
      { error: '2FA 상태를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
