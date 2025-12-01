/**
 * 백엔드 소스 보호 미들웨어
 * 디버깅 방지 및 코드 분석 방지
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/**
 * 소스 코드 노출 방지
 */
export function preventSourceExposure(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 소스 파일 접근 차단
  const path = req.path.toLowerCase()
  
  // 소스 파일 확장자 차단
  const blockedExtensions = [
    '.ts', '.tsx', '.jsx', '.map',
    '.json', '.env', '.config',
    '.log', '.md', '.txt'
  ]
  
  const isBlocked = blockedExtensions.some(ext => path.endsWith(ext))
  
  if (isBlocked && process.env.NODE_ENV === 'production') {
    logger.warn('소스 파일 접근 시도 차단:', { ip: req.ip, path: req.path })
    return res.status(403).json({
      success: false,
      error: '접근이 거부되었습니다'
    })
  }
  
  next()
}

/**
 * 디버깅 헤더 제거
 */
export function removeDebugHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 프로덕션에서 디버깅 정보 제거
  if (process.env.NODE_ENV === 'production') {
    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')
  }
  
  next()
}

/**
 * 스택 트레이스 숨김
 */
export function hideStackTrace(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 프로덕션에서 상세 에러 정보 숨김
  if (process.env.NODE_ENV === 'production') {
    const originalError = err.message
    
    // 민감한 정보 제거
    const sanitizedError = originalError
      .replace(/at\s+.*/g, '') // 스택 트레이스 제거
      .replace(/file:\/\/.*/g, '') // 파일 경로 제거
      .replace(/\/.*\//g, '') // 경로 정보 제거
    
    err.message = sanitizedError || '내부 서버 오류'
  }
  
  next(err)
}

