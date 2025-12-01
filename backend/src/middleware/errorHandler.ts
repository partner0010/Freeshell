import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { errorTracker } from '../services/monitoring/errorTracker'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // 에러 추적
  errorTracker.trackError(err, {
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    statusCode
  }).catch(trackError => {
    logger.warn('에러 추적 실패:', trackError)
  })

  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })

  // 프로덕션에서 스택 트레이스 및 상세 정보 숨김
  const errorResponse: any = {
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? '내부 서버 오류가 발생했습니다' 
        : message
    }
  }
  
  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack
    errorResponse.error.details = {
      path: req.path,
      method: req.method
    }
  }
  
  res.status(statusCode).json(errorResponse)
}

