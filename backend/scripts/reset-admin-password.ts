/**
 * 관리자 비밀번호 재설정 스크립트
 */

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/encryption'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  const adminEmail = 'admin@freeshell.co.kr'
  const newPassword = 'Qawsedrftg12345!'

  console.log('🔐 관리자 비밀번호 재설정 중...')
  console.log('')

  try {
    // 관리자 찾기
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (!admin) {
      console.error('❌ 관리자 계정을 찾을 수 없습니다.')
      console.log('   계정을 먼저 생성하세요: npm run seed')
      process.exit(1)
    }

    // 비밀번호 해싱
    const hashedPassword = hashPassword(newPassword)

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        isActive: true,
        isApproved: true,
        isEmailVerified: true,
      },
    })

    console.log('✅ 관리자 비밀번호가 재설정되었습니다!')
    console.log('')
    console.log('========================================')
    console.log('🔐 관리자 계정 정보')
    console.log('========================================')
    console.log(`이메일:    ${adminEmail}`)
    console.log(`비밀번호:  ${newPassword}`)
    console.log('========================================')
    console.log('')
  } catch (error) {
    console.error('❌ 비밀번호 재설정 실패:', error)
    process.exit(1)
  }
}

resetAdminPassword()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

