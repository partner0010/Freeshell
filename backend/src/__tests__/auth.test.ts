/**
 * 인증 테스트
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { hashPassword, verifyPassword } from '../utils/encryption'

describe('Authentication Utils', () => {
  beforeAll(() => {
    // 테스트 환경 변수 설정
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-only'
  })

  describe('hashPassword', () => {
    it('should hash password correctly', () => {
      const password = 'testPassword123'
      const hashed = hashPassword(password)
      
      expect(hashed).toBeDefined()
      expect(typeof hashed).toBe('string')
      expect(hashed).toContain(':')
      expect(hashed.length).toBeGreaterThan(50)
    })

    it('should produce different hashes for same password', () => {
      const password = 'testPassword123'
      const hash1 = hashPassword(password)
      const hash2 = hashPassword(password)
      
      // 같은 비밀번호라도 다른 해시 생성 (salt 사용)
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', () => {
      const password = 'testPassword123'
      const hashed = hashPassword(password)
      
      const isValid = verifyPassword(password, hashed)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword'
      const hashed = hashPassword(password)
      
      const isValid = verifyPassword(wrongPassword, hashed)
      expect(isValid).toBe(false)
    })

    it('should handle invalid hash format', () => {
      const password = 'testPassword123'
      const invalidHash = 'invalid-hash-format'
      
      const isValid = verifyPassword(password, invalidHash)
      expect(isValid).toBe(false)
    })
  })
})

