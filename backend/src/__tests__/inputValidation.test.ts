/**
 * 입력 검증 테스트
 */

import { describe, it, expect } from '@jest/globals'
import {
  sanitizeInput,
  validateNoSQLInjection,
  validateEmail,
  validateURL,
  validateFileExtension,
  validateFileSize
} from '../middleware/inputValidation'

describe('Input Validation', () => {
  describe('sanitizeInput', () => {
    it('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>hello'
      const sanitized = sanitizeInput(input)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('</script>')
    })

    it('should trim whitespace', () => {
      const input = '  hello world  '
      const sanitized = sanitizeInput(input)
      
      expect(sanitized).toBe('hello world')
    })
  })

  describe('validateNoSQLInjection', () => {
    it('should detect SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --"
      const isValid = validateNoSQLInjection(maliciousInput)
      
      expect(isValid).toBe(false)
    })

    it('should allow normal input', () => {
      const normalInput = 'hello world'
      const isValid = validateNoSQLInjection(normalInput)
      
      expect(isValid).toBe(true)
    })

    it('should detect SELECT statements', () => {
      const maliciousInput = "SELECT * FROM users"
      const isValid = validateNoSQLInjection(maliciousInput)
      
      expect(isValid).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const email = 'user@example.com'
      const isValid = validateEmail(email)
      
      expect(isValid).toBe(true)
    })

    it('should reject invalid email', () => {
      const email = 'invalid-email'
      const isValid = validateEmail(email)
      
      expect(isValid).toBe(false)
    })

    it('should reject email without domain', () => {
      const email = 'user@'
      const isValid = validateEmail(email)
      
      expect(isValid).toBe(false)
    })
  })

  describe('validateURL', () => {
    it('should validate correct URL', () => {
      const url = 'https://example.com'
      const isValid = validateURL(url)
      
      expect(isValid).toBe(true)
    })

    it('should reject URL without protocol', () => {
      const url = 'example.com'
      const isValid = validateURL(url)
      
      expect(isValid).toBe(false)
    })

    it('should reject invalid URL', () => {
      const url = 'not-a-url'
      const isValid = validateURL(url)
      
      expect(isValid).toBe(false)
    })
  })

  describe('validateFileExtension', () => {
    it('should validate allowed extension', () => {
      const filename = 'image.jpg'
      const allowed = ['jpg', 'png', 'gif']
      const isValid = validateFileExtension(filename, allowed)
      
      expect(isValid).toBe(true)
    })

    it('should reject disallowed extension', () => {
      const filename = 'file.exe'
      const allowed = ['jpg', 'png', 'gif']
      const isValid = validateFileExtension(filename, allowed)
      
      expect(isValid).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('should validate file size within limit', () => {
      const size = 1024 * 1024 // 1MB
      const maxSize = 5 * 1024 * 1024 // 5MB
      const isValid = validateFileSize(size, maxSize)
      
      expect(isValid).toBe(true)
    })

    it('should reject file size exceeding limit', () => {
      const size = 10 * 1024 * 1024 // 10MB
      const maxSize = 5 * 1024 * 1024 // 5MB
      const isValid = validateFileSize(size, maxSize)
      
      expect(isValid).toBe(false)
    })
  })
})

