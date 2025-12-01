/**
 * 인증 통합 테스트
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import authRoutes from '../../routes/auth'
import { getPrismaClient } from '../../utils/database'

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('Auth Integration Tests', () => {
  let prisma: any

  beforeAll(async () => {
    prisma = getPrismaClient()
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing'
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-only-32chars'
  })

  afterAll(async () => {
    // 테스트 데이터 정리
    if (prisma) {
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: 'test@'
          }
        }
      })
    }
  })

  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        password: 'testPassword123'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.user).toBeDefined()
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.token).toBeDefined()
    })

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // username and password missing
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'short' // less than 8 characters
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    let testUser: any
    let testToken: string

    beforeAll(async () => {
      // 테스트 사용자 생성
      const userData = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        password: 'testPassword123'
      }

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)

      testUser = registerResponse.body.user
      testToken = registerResponse.body.token
    })

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'testPassword123'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.user).toBeDefined()
      expect(response.body.token).toBeDefined()
    })

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongPassword'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testPassword123'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })
})

