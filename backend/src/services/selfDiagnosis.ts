import { logger } from '../utils/logger'
import { getPrismaClient } from '../utils/database'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execAsync = promisify(exec)

export interface DiagnosisResult {
  category: string
  issue: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  solution: string
  autoFixable: boolean
  fixed?: boolean
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical'
  issues: DiagnosisResult[]
  timestamp: Date
}

/**
 * 시스템 자가 진단
 */
export async function diagnoseSystem(): Promise<SystemHealth> {
  logger.info('시스템 자가 진단 시작...')
  
  const issues: DiagnosisResult[] = []
  
  // 1. 데이터베이스 연결 확인
  const dbIssue = await checkDatabase()
  if (dbIssue) issues.push(dbIssue)
  
  // 2. 환경 변수 확인
  const envIssues = await checkEnvironmentVariables()
  issues.push(...envIssues)
  
  // 3. 필수 디렉토리 확인
  const dirIssues = await checkDirectories()
  issues.push(...dirIssues)
  
  // 4. 포트 사용 확인
  const portIssue = await checkPort()
  if (portIssue) issues.push(portIssue)
  
  // 5. 의존성 확인
  const depIssue = await checkDependencies()
  if (depIssue) issues.push(depIssue)
  
  // 6. 디스크 공간 확인
  const diskIssue = await checkDiskSpace()
  if (diskIssue) issues.push(diskIssue)
  
  // 심각도 결정
  const criticalIssues = issues.filter(i => i.severity === 'critical')
  const highIssues = issues.filter(i => i.severity === 'high')
  
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy'
  if (criticalIssues.length > 0) {
    status = 'critical'
  } else if (highIssues.length > 0) {
    status = 'degraded'
  }
  
  logger.info(`진단 완료: ${status}, 문제 ${issues.length}개 발견`)
  
  return {
    status,
    issues,
    timestamp: new Date()
  }
}

/**
 * 데이터베이스 연결 확인
 */
async function checkDatabase(): Promise<DiagnosisResult | null> {
  try {
    const prisma = getPrismaClient()
    await prisma.$queryRaw`SELECT 1`
    return null
  } catch (error: any) {
    return {
      category: '데이터베이스',
      issue: '데이터베이스 연결 실패',
      severity: 'critical',
      solution: '데이터베이스 파일을 확인하고 Prisma 마이그레이션을 실행하세요: npx prisma migrate dev',
      autoFixable: false
    }
  }
}

/**
 * 환경 변수 확인
 */
async function checkEnvironmentVariables(): Promise<DiagnosisResult[]> {
  const issues: DiagnosisResult[] = []
  const required = ['DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY']
  const recommended = ['OPENAI_API_KEY', 'CLAUDE_API_KEY']
  
  for (const key of required) {
    if (!process.env[key]) {
      issues.push({
        category: '환경 변수',
        issue: `${key}가 설정되지 않았습니다`,
        severity: 'critical',
        solution: `.env 파일에 ${key}를 추가하세요`,
        autoFixable: false
      })
    }
  }
  
  // AI API 키 확인 (최소 하나)
  if (!process.env.OPENAI_API_KEY && !process.env.CLAUDE_API_KEY) {
    issues.push({
      category: '환경 변수',
      issue: 'AI API 키가 설정되지 않았습니다 (OPENAI_API_KEY 또는 CLAUDE_API_KEY)',
      severity: 'high',
      solution: '.env 파일에 최소 하나의 AI API 키를 추가하세요',
      autoFixable: false
    })
  }
  
  // JWT_SECRET 길이 확인
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    issues.push({
      category: '환경 변수',
      issue: 'JWT_SECRET이 너무 짧습니다 (최소 32자 필요)',
      severity: 'high',
      solution: 'JWT_SECRET을 32자 이상의 랜덤 문자열로 변경하세요',
      autoFixable: false
    })
  }
  
  return issues
}

/**
 * 필수 디렉토리 확인
 */
async function checkDirectories(): Promise<DiagnosisResult[]> {
  const issues: DiagnosisResult[] = []
  const requiredDirs = [
    './data',
    './uploads/images',
    './uploads/videos',
    './uploads/temp',
    './logs'
  ]
  
  for (const dir of requiredDirs) {
    try {
      await fs.access(dir)
    } catch {
      issues.push({
        category: '파일 시스템',
        issue: `필수 디렉토리가 없습니다: ${dir}`,
        severity: 'medium',
        solution: `디렉토리를 생성하세요: mkdir -p ${dir}`,
        autoFixable: true
      })
    }
  }
  
  return issues
}

/**
 * 포트 사용 확인
 */
async function checkPort(): Promise<DiagnosisResult | null> {
  const port = process.env.PORT || '3001'
  
  try {
    // Windows와 Linux 모두에서 작동하는 방법
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
    if (stdout) {
      return {
        category: '네트워크',
        issue: `포트 ${port}가 이미 사용 중입니다`,
        severity: 'high',
        solution: `다른 포트를 사용하거나 사용 중인 프로세스를 종료하세요`,
        autoFixable: false
      }
    }
  } catch {
    // 포트가 사용되지 않음 (정상)
  }
  
  return null
}

/**
 * 의존성 확인
 */
async function checkDependencies(): Promise<DiagnosisResult | null> {
  try {
    await fs.access('./node_modules')
    return null
  } catch {
    return {
      category: '의존성',
      issue: 'node_modules가 없습니다. 의존성이 설치되지 않았습니다',
      severity: 'high',
      solution: 'npm install을 실행하세요',
      autoFixable: true
    }
  }
}

/**
 * 디스크 공간 확인
 */
async function checkDiskSpace(): Promise<DiagnosisResult | null> {
  try {
    const stats = await fs.statfs('./')
    const freeSpaceGB = stats.bavail * stats.bsize / (1024 * 1024 * 1024)
    
    if (freeSpaceGB < 1) {
      return {
        category: '시스템',
        issue: `디스크 공간이 부족합니다 (남은 공간: ${freeSpaceGB.toFixed(2)}GB)`,
        severity: 'high',
        solution: '불필요한 파일을 삭제하거나 디스크 공간을 확보하세요',
        autoFixable: false
      }
    }
  } catch {
    // Windows에서는 statfs가 없을 수 있음
  }
  
  return null
}

/**
 * 자동 복구 시도
 */
export async function autoFix(issue: DiagnosisResult): Promise<boolean> {
  if (!issue.autoFixable) {
    return false
  }
  
  logger.info(`자동 복구 시도: ${issue.issue}`)
  
  try {
    if (issue.category === '파일 시스템') {
      // 디렉토리 생성
      const dirMatch = issue.solution.match(/mkdir -p (.+)/)
      if (dirMatch) {
        const dir = dirMatch[1]
        await fs.mkdir(dir, { recursive: true })
        logger.info(`디렉토리 생성 완료: ${dir}`)
        return true
      }
    }
    
    if (issue.category === '의존성') {
      // npm install 실행
      logger.info('의존성 설치 시작...')
      await execAsync('npm install')
      logger.info('의존성 설치 완료')
      return true
    }
    
    return false
  } catch (error: any) {
    logger.error(`자동 복구 실패: ${error.message}`)
    return false
  }
}

/**
 * 모든 자동 복구 가능한 문제 해결
 */
export async function autoFixAll(): Promise<{ fixed: number; failed: number }> {
  const health = await diagnoseSystem()
  const autoFixableIssues = health.issues.filter(i => i.autoFixable)
  
  let fixed = 0
  let failed = 0
  
  for (const issue of autoFixableIssues) {
    const success = await autoFix(issue)
    if (success) {
      fixed++
      issue.fixed = true
    } else {
      failed++
    }
  }
  
  logger.info(`자동 복구 완료: ${fixed}개 성공, ${failed}개 실패`)
  
  return { fixed, failed }
}

