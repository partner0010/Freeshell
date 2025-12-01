import { logger } from '../utils/logger'
import { getPrismaClient } from '../utils/database'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface ErrorInfo {
  type: string
  message: string
  stack?: string
  timestamp: Date
  context?: Record<string, any>
}

/**
 * 에러 분석 및 해결책 제시
 */
export async function analyzeError(error: Error, context?: Record<string, any>): Promise<{
  diagnosis: string
  solution: string
  autoFixable: boolean
  fixCommand?: string
}> {
  const errorInfo: ErrorInfo = {
    type: error.constructor.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date(),
    context
  }
  
  logger.error('에러 분석 시작:', errorInfo)
  
  // 에러 타입별 분석
  if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
    return {
      diagnosis: '데이터베이스 연결 실패',
      solution: '데이터베이스 서버가 실행 중인지 확인하거나 SQLite 파일이 존재하는지 확인하세요',
      autoFixable: false,
      fixCommand: 'npx prisma migrate dev'
    }
  }
  
  if (error.message.includes('ENOENT') || error.message.includes('파일을 찾을 수 없습니다')) {
    return {
      diagnosis: '필수 파일 또는 디렉토리가 없습니다',
      solution: '필수 디렉토리를 생성하세요',
      autoFixable: true,
      fixCommand: 'mkdir -p data uploads/images uploads/videos uploads/temp logs'
    }
  }
  
  if (error.message.includes('EADDRINUSE') || error.message.includes('포트')) {
    return {
      diagnosis: '포트가 이미 사용 중입니다',
      solution: '다른 포트를 사용하거나 사용 중인 프로세스를 종료하세요',
      autoFixable: false,
      fixCommand: 'netstat -ano | findstr :3001'
    }
  }
  
  if (error.message.includes('Prisma') || error.message.includes('schema')) {
    return {
      diagnosis: 'Prisma 스키마 오류',
      solution: 'Prisma 클라이언트를 재생성하고 마이그레이션을 실행하세요',
      autoFixable: true,
      fixCommand: 'npx prisma generate && npx prisma migrate dev'
    }
  }
  
  if (error.message.includes('JWT') || error.message.includes('토큰')) {
    return {
      diagnosis: '인증 토큰 오류',
      solution: 'JWT_SECRET이 .env 파일에 올바르게 설정되어 있는지 확인하세요 (최소 32자)',
      autoFixable: false
    }
  }
  
  if (error.message.includes('API') && error.message.includes('키')) {
    return {
      diagnosis: 'API 키 오류',
      solution: '.env 파일에 올바른 API 키를 설정하세요',
      autoFixable: false
    }
  }
  
  // 기본 응답
  return {
    diagnosis: '알 수 없는 오류',
    solution: '로그 파일을 확인하고 에러 메시지를 검토하세요',
    autoFixable: false
  }
}

/**
 * 자동 복구 시도
 */
export async function attemptAutoRecovery(error: Error, context?: Record<string, any>): Promise<boolean> {
  const analysis = await analyzeError(error, context)
  
  if (!analysis.autoFixable || !analysis.fixCommand) {
    return false
  }
  
  logger.info(`자동 복구 시도: ${analysis.diagnosis}`)
  
  try {
    // Windows와 Linux 모두 지원
    const command = analysis.fixCommand.replace('mkdir -p', process.platform === 'win32' ? 'mkdir' : 'mkdir -p')
    await execAsync(command)
    logger.info('자동 복구 성공')
    return true
  } catch (fixError: any) {
    logger.error(`자동 복구 실패: ${fixError.message}`)
    return false
  }
}

/**
 * 에러 로그 저장
 */
export async function saveErrorLog(error: ErrorInfo): Promise<void> {
  try {
    const logDir = './logs'
    await fs.mkdir(logDir, { recursive: true })
    
    const logFile = path.join(logDir, `errors_${new Date().toISOString().split('T')[0]}.json`)
    
    let errors: ErrorInfo[] = []
    try {
      const existing = await fs.readFile(logFile, 'utf-8')
      errors = JSON.parse(existing)
    } catch {
      // 파일이 없으면 새로 생성
    }
    
    errors.push(error)
    
    // 최근 100개만 유지
    if (errors.length > 100) {
      errors = errors.slice(-100)
    }
    
    await fs.writeFile(logFile, JSON.stringify(errors, null, 2))
  } catch (err) {
    logger.error('에러 로그 저장 실패:', err)
  }
}

