import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'master@freeshell.co.kr' }
    })

    if (admin) {
      console.log('✅ 관리자 계정 존재')
      console.log('')
      console.log('이메일:', admin.email)
      console.log('사용자명:', admin.username)
      console.log('역할:', admin.role)
      console.log('활성화:', admin.isActive)
      console.log('승인:', admin.isApproved)
      console.log('이메일인증:', admin.isEmailVerified)
    } else {
      console.log('❌ 관리자 계정이 없습니다!')
      console.log('생성하려면: npm run create-admin')
    }
  } catch (error) {
    console.error('오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()

