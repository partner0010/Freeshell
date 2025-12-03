/**
 * 간단한 관리자 계정 생성 스크립트
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('👑 관리자 계정 생성 중...\n')

    // 기존 관리자 확인
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@freeshell.co.kr' }
    })

    if (existing) {
      console.log('⚠️  관리자 계정이 이미 존재합니다.')
      console.log('   이메일:', existing.email)
      console.log('   역할:', existing.role)
      console.log('   승인 상태:', existing.isApproved)
      return
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12)

    // 관리자 생성
    const admin = await prisma.user.create({
      data: {
        id: 'admin-master-001',
        email: 'admin@freeshell.co.kr',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isApproved: true,
        isEmailVerified: true,
      }
    })

    console.log('✅ 관리자 계정 생성 완료!\n')
    console.log('========================================')
    console.log('👑 관리자 계정 정보')
    console.log('========================================')
    console.log('이메일: admin@freeshell.co.kr')
    console.log('비밀번호: Admin123!@#')
    console.log('역할: admin')
    console.log('승인 상태: true (즉시 사용 가능)')
    console.log('========================================\n')

    // AI 사용량 제한 설정
    try {
      await prisma.aIUsageLimit.create({
        data: {
          userId: admin.id,
          dailyLimit: 999999,
          monthlyLimit: 999999,
        }
      })
      console.log('✅ AI 사용량 제한 설정 완료 (무제한)\n')
    } catch (e) {
      console.log('⚠️  AI 사용량 제한 설정 건너뜀 (이미 존재할 수 있음)\n')
    }

  } catch (error: any) {
    console.error('❌ 오류:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
  .then(() => {
    console.log('✅ 완료!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 실패:', error)
    process.exit(1)
  })

