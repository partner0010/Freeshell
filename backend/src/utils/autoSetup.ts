import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { logger } from './logger'

const execAsync = promisify(exec)

interface ServerInfo {
  os: string
  nodeVersion: string
  hasDocker: boolean
  hasFFmpeg: boolean
  hasPython: boolean
  recommendedSetup: string[]
}

/**
 * 서버 환경을 자동으로 감지하고 필요한 설정을 수행합니다.
 */
export async function autoSetup(): Promise<ServerInfo> {
  logger.info('🔍 서버 환경 자동 감지 시작...')

  const info: ServerInfo = {
    os: '',
    nodeVersion: '',
    hasDocker: false,
    hasFFmpeg: false,
    hasPython: false,
    recommendedSetup: []
  }

  try {
    // OS 감지
    const os = process.platform
    info.os = os
    logger.info(`📦 OS: ${os}`)

    // Node.js 버전 확인
    const { stdout: nodeVersion } = await execAsync('node --version')
    info.nodeVersion = nodeVersion.trim()
    logger.info(`✅ Node.js: ${info.nodeVersion}`)

    // Docker 확인
    try {
      await execAsync('docker --version')
      info.hasDocker = true
      logger.info('✅ Docker 설치됨')
    } catch {
      info.hasDocker = false
      info.recommendedSetup.push('Docker 설치 권장 (자동 배포용)')
      logger.warn('⚠️ Docker 미설치')
    }

    // FFmpeg 확인
    try {
      await execAsync('ffmpeg -version')
      info.hasFFmpeg = true
      logger.info('✅ FFmpeg 설치됨')
    } catch {
      info.hasFFmpeg = false
      info.recommendedSetup.push('FFmpeg 설치 필요 (비디오 처리용)')
      logger.warn('⚠️ FFmpeg 미설치 - 비디오 처리 기능 제한됨')
    }

    // Python 확인 (선택적)
    try {
      await execAsync('python --version')
      info.hasPython = true
      logger.info('✅ Python 설치됨')
    } catch {
      info.hasPython = false
    }

    // 환경 변수 파일 생성 (없는 경우)
    const envPath = path.join(process.cwd(), '.env')
    try {
      await fs.access(envPath)
      logger.info('✅ .env 파일 존재')
    } catch {
      logger.info('📝 .env 파일 생성 중...')
      await createDefaultEnvFile(envPath)
      logger.warn('⚠️ .env 파일을 확인하고 API 키를 설정해주세요!')
    }

    // Redis 확인
    try {
      const { getRedisClient } = await import('./cache')
      const redisClient = getRedisClient()
      if (redisClient) {
        await redisClient.ping()
        logger.info('✅ Redis 연결 확인')
      }
    } catch (error) {
      logger.warn('⚠️ Redis 연결 실패 (캐싱 없이 계속 진행)')
    }

    // 필요한 디렉토리 생성
    await createDirectories()

    // 권장 사항 출력
    if (info.recommendedSetup.length > 0) {
      logger.warn('📋 권장 사항:')
      info.recommendedSetup.forEach((item) => logger.warn(`  - ${item}`))
    }

    logger.info('✅ 서버 환경 감지 완료')
    return info

  } catch (error) {
    logger.error('❌ 서버 환경 감지 실패:', error)
    throw error
  }
}

/**
 * 기본 .env 파일 생성
 */
async function createDefaultEnvFile(envPath: string): Promise<void> {
  const defaultEnv = `# 올인원 콘텐츠 AI 환경 변수

# 서버 설정
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# 데이터베이스 (선택: SQLite 기본 사용)
DATABASE_URL="file:./data/database.db"

# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# YouTube API
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/platform/youtube/callback

# TikTok API (선택)
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Instagram API (선택)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret

# 파일 저장소
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_in_production

# 로깅
LOG_LEVEL=info
`

  await fs.writeFile(envPath, defaultEnv, 'utf-8')
  logger.info('✅ .env 파일 생성 완료 - API 키를 설정해주세요')
}

/**
 * 필요한 디렉토리 생성
 */
async function createDirectories(): Promise<void> {
  const dirs = [
    './data',
    './uploads',
    './uploads/videos',
    './uploads/images',
    './uploads/thumbnails',
    './temp'
  ]

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true })
      logger.info(`✅ 디렉토리 생성: ${dir}`)
    } catch (error) {
      logger.warn(`⚠️ 디렉토리 생성 실패: ${dir}`)
    }
  }
}

