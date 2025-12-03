/**
 * 데이터베이스 시드 스크립트
 * 기본 관리자 계정 생성
 */

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 데이터베이스 시드 시작...')

  // 기본 관리자 계정
  const adminEmail = 'admin@freeshell.co.kr'
  const adminUsername = 'admin'
  const adminPassword = 'Qawsedrftg12345!'

  // 기존 관리자 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('✅ 관리자 계정이 이미 존재합니다.')
    console.log(`   이메일: ${adminEmail}`)
    console.log(`   사용자명: ${adminUsername}`)
    return
  }

  // 관리자 계정 생성
  const hashedPassword = hashPassword(adminPassword)

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isApproved: true, // 관리자는 자동 승인
      isEmailVerified: true, // 관리자는 자동 인증
    },
  })

  console.log('✅ 관리자 계정이 생성되었습니다!')
  console.log('')
  console.log('========================================')
  console.log('🔐 관리자 계정 정보')
  console.log('========================================')
  console.log(`이메일:    ${adminEmail}`)
  console.log(`사용자명:  ${adminUsername}`)
  console.log(`비밀번호:  ${adminPassword}`)
  console.log('========================================')
  console.log('')
  console.log('⚠️  보안을 위해 첫 로그인 후 비밀번호를 변경하세요!')
}

main()
  .catch((e) => {
    console.error('❌ 시드 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

