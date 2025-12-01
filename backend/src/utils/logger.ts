import winston from 'winston'
import path from 'path'

const logDir = './logs'

// 로그 디렉토리 생성 (없는 경우)
import fs from 'fs'
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'all-in-one-content-ai' },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
})

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

