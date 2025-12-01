import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

let prismaInstance: PrismaClient | null = null

/**
 * 데이터베이스 연결
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error']
    })

    // 연결 이벤트
    prismaInstance.$on('error' as never, (e: any) => {
      logger.error('Prisma 오류:', e)
    })
  }

  return prismaInstance
}

/**
 * 데이터베이스 연결
 */
export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient()
    await client.$connect()
    logger.info('✅ 데이터베이스 연결 성공')
  } catch (error) {
    logger.error('❌ 데이터베이스 연결 실패:', error)
    throw error
  }
}

/**
 * 데이터베이스 연결 해제
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient()
    await client.$disconnect()
    logger.info('데이터베이스 연결 해제')
  } catch (error) {
    logger.error('데이터베이스 연결 해제 실패:', error)
  }
}

// Prisma 클라이언트 export
export const prisma = getPrismaClient()
