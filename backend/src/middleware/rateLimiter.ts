/**
 * 강화된 Rate Limiting
 */

import rateLimit from 'express-rate-limit'

// Shell AI 제한 (중요!)
export const shellAILimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 1분에 10번
  message: {
    success: false,
    error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 콘텐츠 생성 제한
export const contentGenerationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 1분에 5번
  message: {
    success: false,
    error: '콘텐츠 생성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
})

// 일반 API 제한
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 1분에 30번
  message: {
    success: false,
    error: 'API 호출이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
})

// 로그인 제한 (Brute Force 방어)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분에 5번
  message: {
    success: false,
    error: '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.',
  },
})

