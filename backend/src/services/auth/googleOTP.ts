/**
 * 🔐 Google OTP (TOTP) 인증 시스템
 * 회원가입 시 등록, 로그인 시 인증
 */

import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { logger } from '../../utils/logger'

export interface OTPSecret {
  secret: string
  qrCodeUrl: string
  manualEntryKey: string
}

class GoogleOTPService {
  /**
   * 🔑 OTP Secret 생성 (회원가입 시)
   */
  generateSecret(username: string): OTPSecret {
    try {
      const secret = speakeasy.generateSecret({
        name: `Freeshell (${username})`,
        issuer: 'Freeshell',
        length: 32
      })

      logger.info(`🔑 OTP Secret 생성: ${username}`)

      return {
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url || '',
        manualEntryKey: secret.base32
      }
    } catch (error: any) {
      logger.error('OTP Secret 생성 실패:', error)
      throw new Error('OTP Secret 생성 실패')
    }
  }

  /**
   * 📱 QR 코드 생성 (이미지 Data URL)
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)
      logger.info('📱 QR 코드 생성 완료')
      return qrCodeDataUrl
    } catch (error: any) {
      logger.error('QR 코드 생성 실패:', error)
      throw new Error('QR 코드 생성 실패')
    }
  }

  /**
   * ✅ OTP 토큰 검증 (로그인 시)
   */
  verifyToken(secret: string, token: string): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // ±2 타임 윈도우 (1분 여유)
      })

      logger.info(`🔐 OTP 검증: ${verified ? '성공 ✅' : '실패 ❌'}`)
      return verified
    } catch (error: any) {
      logger.error('OTP 검증 실패:', error)
      return false
    }
  }

  /**
   * 🕐 현재 토큰 생성 (테스트용)
   */
  generateCurrentToken(secret: string): string {
    try {
      const token = speakeasy.totp({
        secret,
        encoding: 'base32'
      })

      return token
    } catch (error: any) {
      logger.error('토큰 생성 실패:', error)
      throw new Error('토큰 생성 실패')
    }
  }

  /**
   * 🔢 백업 코드 생성 (OTP 분실 시 사용)
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []

    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }

    logger.info(`🔢 백업 코드 ${count}개 생성`)
    return codes
  }
}

// 싱글톤 인스턴스
export const googleOTP = new GoogleOTPService()
export default googleOTP

