/**
 * 환경 변수 검증 및 설정
 */

import { logger } from './logger'
import * as fs from 'fs'
import * as path from 'path'
import crypto from 'crypto'

interface EnvConfig {
  required: string[]
  optional: string[]
  defaults: Record<string, string>
}

const envConfig: EnvConfig = {
  required: [
    'DATABASE_URL',
    'JWT_SECRET',
  ],
  optional: [
    'PORT',
    'FRONTEND_URL',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_AI_API_KEY',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'REDIS_URL',
    'LOG_LEVEL',
    'NODE_ENV',
  ],
  defaults: {
    PORT: '5000',
    FRONTEND_URL: 'http://localhost:5173',
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: '587',
    LOG_LEVEL: 'info',
    NODE_ENV: 'development',
    REDIS_URL: 'redis://localhost:6379',
  }
}

/**
 * 환경 변수 검증
 */
export function validateEnv(): boolean {
  console.log('\n========================================')
  console.log('⚙️  환경 변수 검증 시작')
  console.log('========================================\n')

  let isValid = true
  const missing: string[] = []
  const warnings: string[] = []

  // 필수 환경 변수 확인
  for (const key of envConfig.required) {
    if (!process.env[key]) {
      missing.push(key)
      isValid = false
    }
  }

  // 누락된 필수 환경 변수 보고
  if (missing.length > 0) {
    console.error('❌ 누락된 필수 환경 변수:')
    missing.forEach(key => console.error(`   - ${key}`))
    console.error('\n')
  }

  // JWT_SECRET 검증
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET이 너무 짧습니다 (최소 32자 권장)')
    }
    if (process.env.JWT_SECRET === 'your-secret-key' || 
        process.env.JWT_SECRET === 'change-this') {
      warnings.push('JWT_SECRET을 기본값에서 변경해야 합니다')
    }
  }

  // DATABASE_URL 검증
  if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL.startsWith('file:')) {
      warnings.push('SQLite 데이터베이스 URL이 올바르지 않을 수 있습니다')
    }
  }

  // 선택적 환경 변수의 기본값 설정
  for (const [key, defaultValue] of Object.entries(envConfig.defaults)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue
      console.log(`✅ ${key}: ${defaultValue} (기본값)`)
    } else {
      console.log(`✅ ${key}: ${process.env[key]}`)
    }
  }

  // AI API 키 확인
  const aiKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY']
  const hasAnyAiKey = aiKeys.some(key => process.env[key])
  if (!hasAnyAiKey) {
    warnings.push('AI API 키가 설정되지 않았습니다 (AI 기능 사용 불가)')
  }

  // 이메일 설정 확인
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    warnings.push('이메일 설정이 없습니다 (이메일 전송 기능 사용 불가)')
  }

  // 경고 출력
  if (warnings.length > 0) {
    console.log('\n⚠️  경고:')
    warnings.forEach(warning => console.log(`   - ${warning}`))
  }

  console.log('\n========================================')
  if (isValid) {
    console.log('✅ 환경 변수 검증 완료')
  } else {
    console.log('❌ 환경 변수 검증 실패')
  }
  console.log('========================================\n')

  return isValid
}

/**
 * .env 파일 생성 (없는 경우)
 */
export function createEnvFileIfNotExists(): void {
  const envPath = path.resolve(process.cwd(), '.env')
  const envExamplePath = path.resolve(process.cwd(), '.env.example')

  // .env 파일이 이미 있으면 스킵
  if (fs.existsSync(envPath)) {
    return
  }

  console.log('⚠️  .env 파일이 없습니다. 자동 생성 중...\n')

  // JWT 시크릿 생성
  const jwtSecret = crypto.randomBytes(32).toString('hex')

  const envContent = `# 데이터베이스
DATABASE_URL="file:./prisma/data/database.db"

# JWT 시크릿 (자동 생성됨)
JWT_SECRET="${jwtSecret}"

# 서버 포트
PORT=5000

# 프론트엔드 URL
FRONTEND_URL="http://localhost:5173"

# AI API 키 (필요시 입력)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""

# 이메일 설정 (필요시 입력)
EMAIL_USER=""
EMAIL_PASS=""
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587

# Redis
REDIS_URL="redis://localhost:6379"

# 로그 레벨
LOG_LEVEL="info"

# 환경
NODE_ENV="development"
`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env 파일이 생성되었습니다')
  console.log(`   JWT_SECRET: ${jwtSecret}\n`)
}

/**
 * 환경 변수 초기화
 */
export function initializeEnv(): boolean {
  try {
    // .env 파일 생성 (없는 경우)
    createEnvFileIfNotExists()

    // 환경 변수 검증
    return validateEnv()
  } catch (error: any) {
    logger.error('환경 변수 초기화 실패:', error)
    return false
  }
}

/**
 * 환경 변수 요약 출력
 */
export function printEnvSummary(): void {
  console.log('\n========================================')
  console.log('📋 환경 설정 요약')
  console.log('========================================')
  console.log(`🌍 환경: ${process.env.NODE_ENV}`)
  console.log(`🚀 포트: ${process.env.PORT}`)
  console.log(`💾 데이터베이스: ${process.env.DATABASE_URL}`)
  console.log(`🔑 JWT 설정됨: ${process.env.JWT_SECRET ? '✅' : '❌'}`)
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`)
  console.log(`🤖 Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'}`)
  console.log(`🤖 Google AI: ${process.env.GOOGLE_AI_API_KEY ? '✅' : '❌'}`)
  console.log(`📧 이메일: ${process.env.EMAIL_USER ? '✅' : '❌'}`)
  console.log('========================================\n')
}
