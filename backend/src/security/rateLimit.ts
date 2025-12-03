import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const limitStore: RateLimitStore = {}

export interface RateLimitOptions {
  windowMs: number // 시간 윈도우 (밀리초)
  maxRequests: number // 최대 요청 수
  message?: string // 제한 시 메시지
  skipSuccessfulRequests?: boolean // 성공한 요청은 카운트하지 않음
  keyGenerator?: (req: Request) => string // 키 생성 함수
}

/**
 * Rate Limiting 미들웨어 생성
 */
export function createRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    keyGenerator = (req: Request) => req.ip || 'anonymous'
  } = options

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req)
    const now = Date.now()

    // 저장소에 키가 없거나 리셋 시간이 지났으면 초기화
    if (!limitStore[key] || limitStore[key].resetTime < now) {
      limitStore[key] = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    // 요청 수 증가
    limitStore[key].count++

    // 제한 확인
    if (limitStore[key].count > maxRequests) {
      const remainingTime = Math.ceil((limitStore[key].resetTime - now) / 1000)
      
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        count: limitStore[key].count,
        remainingTime
      })

      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: remainingTime
      })
    }

    // 응답 헤더 설정
    res.setHeader('X-RateLimit-Limit', maxRequests.toString())
    res.setHeader('X-RateLimit-Remaining', (maxRequests - limitStore[key].count).toString())
    res.setHeader('X-RateLimit-Reset', new Date(limitStore[key].resetTime).toISOString())

    next()
  }
}

/**
 * 일반 API용 Rate Limit (분당 60회)
 */
export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1분
  maxRequests: 60,
  message: 'API 요청 한도를 초과했습니다. 1분 후 다시 시도해주세요.'
})

/**
 * 인증 API용 Rate Limit (분당 5회)
 */
export const authRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1분
  maxRequests: 5,
  message: '로그인 시도 횟수를 초과했습니다. 1분 후 다시 시도해주세요.'
})

/**
 * 엄격한 Rate Limit (분당 10회)
 */
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1분
  maxRequests: 10,
  message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
})

/**
 * AI API용 Rate Limit (분당 20회)
 */
export const aiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1분
  maxRequests: 20,
  message: 'AI API 요청 한도를 초과했습니다. 1분 후 다시 시도해주세요.'
})

// 만료된 엔트리 정리 (10분마다)
setInterval(() => {
  const now = Date.now()
  Object.keys(limitStore).forEach(key => {
    if (limitStore[key].resetTime < now) {
      delete limitStore[key]
    }
  })
}, 10 * 60 * 1000)

