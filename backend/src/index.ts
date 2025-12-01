import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { autoSetup } from './utils/autoSetup'
import { connectDatabase } from './utils/database'
import { AutoPatchScheduler } from './services/security/autoPatch'
import { sanitizeLogs } from './middleware/privacy'
import { intrusionDetection, logRequest } from './middleware/security'
import { scheduler } from './services/scheduling/scheduler'
import { advancedSecurity } from './services/security/advancedSecurity'
import { jobQueue } from './services/queue/jobQueue'
import { videoGenerationQueue, videoUploadQueue } from './services/queue/videoQueue'
import { initRedis } from './utils/cache'
import { performanceMiddleware } from './services/performance/performanceOptimizer'

// Routes
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import contentRoutes from './routes/content'
import platformRoutes from './routes/platform'
import uploadRoutes from './routes/upload'
import healthRoutes from './routes/health'
import ebookRoutes from './routes/ebook'
import blogRoutes from './routes/blog'
import revenueRoutes from './routes/revenue'
import automationRoutes from './routes/automation'
import trendsRoutes from './routes/trends'
import securityRoutes from './routes/security'
import diagnosisRoutes from './routes/diagnosis'
import schedulesRoutes from './routes/schedules'
import templatesRoutes from './routes/templates'
import analyticsRoutes from './routes/analytics'
import multiAccountRoutes from './routes/multiAccount'
import notificationsRoutes from './routes/notifications'
import channelRoutes from './routes/channel'
import batchRoutes from './routes/batch'
import optimizationRoutes from './routes/optimization'
import legalRoutes from './routes/legal'
import multilingualRoutes from './routes/multilingual'
import recommendationRoutes from './routes/recommendation'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Auto setup - 서버 환경 자동 감지 및 설정
autoSetup()
  .then(() => connectDatabase())
  .then(() => {
    // Redis 초기화
    initRedis()
    
    // 자동 패치 스케줄러 시작
    if (process.env.NODE_ENV === 'production') {
      const scheduler = new AutoPatchScheduler()
      scheduler.start()
      logger.info('자동 패치 스케줄러 시작됨')
    }
  })
  .catch((error) => {
    logger.error('Auto setup failed:', error)
  })

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// CORS 설정 강화
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없으면 (같은 도메인 요청) 허용
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.warn('차단된 Origin:', origin)
      callback(new Error('CORS 정책에 의해 차단되었습니다'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24시간
}))

// Rate limiting - 더 엄격한 제한
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
})

// 콘텐츠 생성은 더 엄격한 제한
const contentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 1시간에 20회만 생성 가능
  message: '콘텐츠 생성 요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요.',
})

app.use('/api/', generalLimiter)
app.use('/api/content/generate', contentLimiter)

// 성능 최적화 미들웨어
app.use(performanceMiddleware)

// Body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 개인정보 보호 로깅
app.use(sanitizeLogs)

// 보안 미들웨어 (가장 먼저 실행)
app.use(logRequest) // 요청 로그 기록
app.use(intrusionDetection) // 침입 탐지

// CSRF 보호 (POST, PUT, DELETE 요청에만 적용)
import { csrfProtection } from './middleware/csrf'
// Health 체크는 CSRF 제외
app.use('/api/', (req, res, next) => {
  if (req.path === '/health' || req.path === '/health/csrf') {
    return next()
  }
  return csrfProtection(req, res, next)
})

// CSRF 보호 (POST, PUT, DELETE 요청에만 적용)
import { csrfProtection } from './middleware/csrf'
app.use('/api/', csrfProtection)

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  next()
})

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/platform', platformRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/ebook', ebookRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/revenue', revenueRoutes)
app.use('/api/automation', automationRoutes)
app.use('/api/trends', trendsRoutes)
app.use('/api/security', securityRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/diagnosis', diagnosisRoutes)
app.use('/api/schedules', schedulesRoutes)
app.use('/api/templates', templatesRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/accounts', multiAccountRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/channel', channelRoutes)
app.use('/api/batch', batchRoutes)
app.use('/api/optimization', optimizationRoutes)
app.use('/api/legal', legalRoutes)
app.use('/api/multilingual', multilingualRoutes)
app.use('/api/recommendation', recommendationRoutes)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`🌐 API available at http://localhost:${PORT}/api`)
})

export default app

