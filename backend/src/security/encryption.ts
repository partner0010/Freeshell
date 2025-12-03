/**
 * 고급 암호화
 * AES-256-GCM
 */

import crypto from 'crypto'
import { logger } from '../utils/logger'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 64

export class AdvancedEncryption {
  private static masterKey: Buffer

  /**
   * 초기화
   */
  static initialize() {
    const secret = process.env.ENCRYPTION_SECRET || 'default-secret-key-change-this-in-production'
    this.masterKey = crypto.scryptSync(secret, 'salt', KEY_LENGTH)
    logger.info('✅ 암호화 시스템 초기화 완료')
  }

  /**
   * 데이터 암호화 (AES-256-GCM)
   */
  static encrypt(plaintext: string): string {
    try {
      const iv = crypto.randomBytes(IV_LENGTH)
      const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv)
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const authTag = cipher.getAuthTag()
      
      // IV + AuthTag + Encrypted 결합
      return iv.toString('hex') + authTag.toString('hex') + encrypted
    } catch (error) {
      logger.error('암호화 실패:', error)
      throw new Error('Encryption failed')
    }
  }

  /**
   * 데이터 복호화 (AES-256-GCM)
   */
  static decrypt(encrypted: string): string {
    try {
      const iv = Buffer.from(encrypted.slice(0, IV_LENGTH * 2), 'hex')
      const authTag = Buffer.from(
        encrypted.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2),
        'hex'
      )
      const ciphertext = encrypted.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2)
      
      const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv)
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      logger.error('복호화 실패:', error)
      throw new Error('Decryption failed')
    }
  }

  /**
   * 비밀번호 해시 (Argon2 대신 bcrypt 강화)
   */
  static async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs')
    const salt = await bcrypt.genSalt(12) // 높은 cost factor
    return await bcrypt.hash(password, salt)
  }

  /**
   * 민감 데이터 암호화 (API 키, 토큰 등)
   */
  static encryptSensitiveData(data: any): string {
    const jsonString = JSON.stringify(data)
    return this.encrypt(jsonString)
  }

  /**
   * 민감 데이터 복호화
   */
  static decryptSensitiveData(encrypted: string): any {
    const decrypted = this.decrypt(encrypted)
    return JSON.parse(decrypted)
  }

  /**
   * HMAC 서명 생성
   */
  static createHMAC(data: string): string {
    return crypto
      .createHmac('sha256', this.masterKey)
      .update(data)
      .digest('hex')
  }

  /**
   * HMAC 서명 검증
   */
  static verifyHMAC(data: string, signature: string): boolean {
    const expected = this.createHMAC(data)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  }

  /**
   * 난수 생성 (CSPRNG)
   */
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * 토큰 생성 (JWT 대신)
   */
  static generateSecureToken(): string {
    return this.generateSecureRandom(64)
  }
}

// 초기화
AdvancedEncryption.initialize()

export default AdvancedEncryption

