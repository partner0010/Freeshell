import { logger } from './logger'
import { prisma } from './database'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    database: boolean
    ffmpeg: boolean
    openai: boolean
    claude: boolean
  }
  timestamp: string
}

/**
 * 시스템 헬스 체크
 */
export async function performHealthCheck(): Promise<HealthStatus> {
  const checks = {
    database: false,
    ffmpeg: false,
    openai: false,
    claude: false
  }

  // 데이터베이스 체크
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    logger.error('데이터베이스 연결 실패:', error)
  }

  // FFmpeg 체크
  try {
    await execAsync('ffmpeg -version')
    checks.ffmpeg = true
  } catch (error) {
    logger.warn('FFmpeg 미설치')
  }

  // OpenAI API 키 체크
  checks.openai = !!process.env.OPENAI_API_KEY

  // Claude API 키 체크
  checks.claude = !!process.env.CLAUDE_API_KEY

  // 상태 결정
  const criticalChecks = [checks.database]
  const allCriticalHealthy = criticalChecks.every(check => check)
  
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (allCriticalHealthy) {
    status = checks.ffmpeg && (checks.openai || checks.claude) ? 'healthy' : 'degraded'
  } else {
    status = 'unhealthy'
  }

  return {
    status,
    checks,
    timestamp: new Date().toISOString()
  }
}

