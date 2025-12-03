/**
 * 새 관리자 계정 생성 스크립트
 */

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/encryption'

const prisma = new PrismaClient()

async function createNewAdmin() {
  const adminEmail = 'master@freeshell.co.kr'
  const adminUsername = 'master'
  const adminPassword = 'Master2024!@#'

  console.log('🔐 새 관리자 계정 생성 중...')
  console.log('')

  try {
    // 기존 계정 확인
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existing) {
      console.log('⚠️  이미 존재하는 계정입니다. 삭제 후 재생성합니다...')
      await prisma.user.delete({
        where: { email: adminEmail },
      })
    }

    // 비밀번호 해싱
    const hashedPassword = hashPassword(adminPassword)

    // 새 관리자 계정 생성
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isApproved: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    })

    console.log('✅ 새 관리자 계정이 생성되었습니다!')
    console.log('')
    console.log('========================================')
    console.log('🔐 관리자 계정 정보')
    console.log('========================================')
    console.log(`이메일:    ${adminEmail}`)
    console.log(`사용자명:  ${adminUsername}`)
    console.log(`비밀번호:  ${adminPassword}`)
    console.log(`역할:      ${admin.role}`)
    console.log(`활성화:    ${admin.isActive}`)
    console.log(`승인:      ${admin.isApproved}`)
    console.log('========================================')
    console.log('')
    console.log('✅ 모든 권한이 활성화되었습니다!')
  } catch (error) {
    console.error('❌ 계정 생성 실패:', error)
    process.exit(1)
  }
}

createNewAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

