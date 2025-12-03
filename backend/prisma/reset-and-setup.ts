#!/usr/bin/env tsx
/**
 * 데이터베이스 완전 초기화 및 관리자 계정 자동 생성
 * 사용법: npm run reset-db
 */

import { getPrismaClient } from '../src/utils/database'
import bcrypt from 'bcryptjs'
import { existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function resetDatabase() {
  console.log('🔄 데이터베이스 완전 초기화 시작...\n')

  const dbPath = resolve(__dirname, 'data', 'database.db')

  try {
    // 1. 기존 데이터베이스 파일 삭제
    if (existsSync(dbPath)) {
      console.log('📁 기존 데이터베이스 파일 삭제 중...')
      unlinkSync(dbPath)
      console.log('✅ 데이터베이스 파일 삭제 완료\n')
    }

    // 2. 마이그레이션 실행
    console.log('🔨 데이터베이스 마이그레이션 실행 중...')
    await execAsync('npx prisma migrate deploy', { cwd: resolve(__dirname, '..') })
    console.log('✅ 마이그레이션 완료\n')

    // 3. Prisma 클라이언트 재생성
    console.log('⚙️  Prisma 클라이언트 생성 중...')
    await execAsync('npx prisma generate', { cwd: resolve(__dirname, '..') })
    console.log('✅ Prisma 클라이언트 생성 완료\n')

    // 4. 관리자 계정 생성
    console.log('👑 관리자 계정 생성 중...')
    await createAdminAccount()

    console.log('\n✅ 데이터베이스 초기화 완료!')
    console.log('\n========================================')
    console.log('👑 관리자 계정 정보')
    console.log('========================================')
    console.log('이메일: admin@freeshell.co.kr')
    console.log('비밀번호: Admin123!@#')
    console.log('역할: admin')
    console.log('========================================\n')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ 데이터베이스 초기화 실패:', error.message)
    process.exit(1)
  }
}

async function createAdminAccount() {
  const prisma = getPrismaClient()

  try {
    // 기존 관리자 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@freeshell.co.kr' }
    })

    if (existingAdmin) {
      console.log('⚠️  관리자 계정이 이미 존재합니다.')
      return
    }

    // 비밀번호 해시 생성
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12)

    // 관리자 계정 생성
    const admin = await prisma.user.create({
      data: {
        id: 'admin-master-001',
        email: 'admin@freeshell.co.kr',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isApproved: true, // 관리자는 승인 필요 없음
        isEmailVerified: true,
        isPhoneVerified: false,
      }
    })

    console.log('✅ 관리자 계정 생성 완료:', admin.email)
    console.log('   - ID:', admin.id)
    console.log('   - 역할:', admin.role)
    console.log('   - 활성화:', admin.isActive)
    console.log('   - 승인:', admin.isApproved)

    // AI 사용량 제한 설정
    await prisma.aIUsageLimit.create({
      data: {
        userId: admin.id,
        dailyLimit: 999999,
        monthlyLimit: 999999,
        dailyUsed: 0,
        monthlyUsed: 0,
      }
    })

    console.log('✅ 관리자 AI 사용량 제한 설정 완료 (무제한)')

  } catch (error: any) {
    console.error('❌ 관리자 계정 생성 실패:', error.message)
    throw error
  }
}

// 실행
resetDatabase()

