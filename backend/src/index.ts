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
import { preventSourceExposure, removeDebugHeaders, hideStackTrace } from './middleware/sourceProtection'
import { scheduler } from './services/scheduling/scheduler'
import { advancedSecurity } from './services/security/advancedSecurity'
import { jobQueue } from './services/queue/jobQueue'
import { videoGenerationQueue, videoUploadQueue } from './services/queue/videoQueue'
import { initRedis } from './utils/cache'
import { performanceMiddleware } from './services/performance/performanceOptimizer'
// register는 나중에 import

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
import aiChatRoutes from './routes/aiChat'
import shellAIRoutes from './routes/shellAI'
import adminRoutes from './routes/admin'
import verificationRoutes from './routes/verification'
import userProfileRoutes from './routes/userProfile'
import dashboardRoutes from './routes/dashboard'
import autoInspectionRoutes from './routes/autoInspection'
import advancedAIRoutes from './routes/advancedAI'
import otpRoutes from './routes/otp'
import { initializeEnv, printEnvSummary } from './utils/envValidator'
import { wafMiddleware } from './security/waf'
import { securityHeaders } from './security/headers'
import { autoInspectionScheduler } from './services/scheduler/autoInspectionScheduler'

dotenv.config()

// 환경 변수 초기화 및 검증
if (!initializeEnv()) {
  logger.error('❌ 환경 변수 초기화 실패 - 서버를 시작할 수 없습니다')
  console.error('\n💡 해결 방법:')
  console.error('   1. backend/.env 파일을 확인하세요')
  console.error('   2. 필수 환경 변수를 설정하세요')
  console.error('   3. npm run reset-db를 실행하여 초기화하세요\n')
  process.exit(1)
}

printEnvSummary()

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
    
    // 자동 점검 스케줄러 시작
    autoInspectionScheduler.start()
    logger.info('자동 점검 스케줄러 시작됨')
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

// WAF (Web Application Firewall)
app.use(wafMiddleware)

// 보안 헤더 강화
app.use(securityHeaders)

// CORS 설정 강화
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없으면 (같은 도메인 요청, Postman, curl 등) 허용
    if (!origin) {
      return callback(null, true)
    }
    
    if (allowedOrigins.includes(origin)) {
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

// AI Chat Rate Limiting - 사용량 제한과 별도로 API 레벨 제한
const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 30, // 최대 30회/분 (사용량 제한과 별도)
  message: 'AI 대화 요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 스트리밍 요청은 별도 처리
    return req.query.stream === 'true'
  }
})

const aiChatSearchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 60, // 검색은 더 많이 허용
  message: '검색 요청이 너무 많습니다. 잠시 후 다시 시도하세요.'
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

// 소스 보호 미들웨어 (가장 먼저 실행)
app.use(preventSourceExposure) // 소스 파일 접근 차단
app.use(removeDebugHeaders) // 디버깅 헤더 제거

// 보안 미들웨어
app.use(logRequest) // 요청 로그 기록
app.use(intrusionDetection) // 침입 탐지

// CSRF 보호 (POST, PUT, DELETE 요청에만 적용)
import { csrfProtection } from './middleware/csrf'
// Health 체크와 로그인은 CSRF 제외 (프론트엔드에서 CSRF 토큰 획득 전에 접근 필요)
app.use('/api/', (req, res, next) => {
  if (req.path === '/health' || req.path === '/health/csrf' || req.path.startsWith('/auth/')) {
    return next()
  }
  return csrfProtection(req, res, next)
})

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  next()
})

// Swagger UI 설정 (개발 환경에서만) - ESM 모드에서는 스킵
if (process.env.NODE_ENV !== 'production') {
  try {
    // ESM 모드에서는 dynamic import 사용
    import('swagger-ui-express').then(swaggerUi => {
      import('./config/swagger.js').then(({ swaggerSpec }) => {
        app.use('/api-docs', swaggerUi.default.serve, swaggerUi.default.setup(swaggerSpec, {
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: '올인원 콘텐츠 AI API 문서'
        }))
        
        logger.info('📚 Swagger UI: http://localhost:' + PORT + '/api-docs')
      }).catch(() => logger.warn('Swagger 설정 파일 없음 - 스킵'))
    }).catch(() => logger.warn('Swagger UI 미설치 - 스킵'))
  } catch (error) {
    logger.warn('Swagger UI 설정 실패 - 스킵 (치명적 아님)')
  }
}

// 메트릭 수집 미들웨어
import { metricsMiddleware } from './middleware/metrics'
app.use(metricsMiddleware)

// 메트릭 엔드포인트 (Prometheus)
import { getMetrics, register } from './services/monitoring/metrics'
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    const metrics = await getMetrics()
    res.end(metrics)
  } catch (error) {
    res.status(500).end()
  }
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
// Shell AI 라우트 (최우선)
app.use('/api/shell', shellAIRoutes)

// 관리자 라우트
app.use('/api/admin', adminRoutes)

// 본인 인증 라우트
app.use('/api/verification', verificationRoutes)

// 사용자 프로필 라우트
app.use('/api/user', userProfileRoutes)

// 대시보드 라우트
app.use('/api/dashboard', dashboardRoutes)

// 자동 점검 라우트
app.use('/api/auto-inspection', autoInspectionRoutes)

// 🚀 고급 AI 라우트 (새로운 14개 AI 모델)
app.use('/api/advanced-ai', advancedAIRoutes)

// 🔐 Google OTP 라우트
app.use('/api/otp', otpRoutes)

// AI Chat 라우트에 Rate Limiting 적용
app.use('/api/ai-chat/search', aiChatSearchLimiter)
app.use('/api/ai-chat', aiChatLimiter)
app.use('/api/ai-chat', aiChatRoutes)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`🌐 API available at http://localhost:${PORT}/api`)
})

export default app

