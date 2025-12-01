/**
 * 암호화 유틸리티 테스트
 */

import { describe, it, expect, beforeAll } from '@jest/globals'
import { encrypt, decrypt } from '../utils/encryption'

describe('Encryption Utils', () => {
  beforeAll(() => {
    // 테스트 환경 변수 설정
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-only-32chars'
  })

  describe('encrypt', () => {
    it('should encrypt text correctly', () => {
      const text = 'test message'
      const encrypted = encrypt(text)
      
      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
      expect(encrypted).toContain(':')
      expect(encrypted).not.toBe(text)
    })

    it('should produce different encrypted values for same text', () => {
      const text = 'test message'
      const encrypted1 = encrypt(text)
      const encrypted2 = encrypt(text)
      
      // 같은 텍스트라도 다른 암호화 값 생성 (IV 사용)
      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe('decrypt', () => {
    it('should decrypt encrypted text correctly', () => {
      const originalText = 'test message'
      const encrypted = encrypt(originalText)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(originalText)
    })

    it('should handle invalid encrypted format', () => {
      const invalidEncrypted = 'invalid-format'
      
      expect(() => {
        decrypt(invalidEncrypted)
      }).toThrow()
    })

    it('should handle empty string', () => {
      const text = ''
      const encrypted = encrypt(text)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(text)
    })
  })
})

