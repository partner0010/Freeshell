import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { errorTracker } from '../services/monitoring/errorTracker'
import { ErrorMessageProvider } from '../utils/errorMessages'

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

  // 구체적인 에러 정보 추출
  let errorDetails: any = {
    message: process.env.NODE_ENV === 'production' 
      ? '내부 서버 오류가 발생했습니다' 
      : message,
    code: (err as any).code || 'INTERNAL_ERROR'
  }

  // 에러 타입별 구체적인 정보 제공
  if ((err as any).code?.startsWith('AI_')) {
    errorDetails = ErrorMessageProvider.getAIError('AI', err)
  } else if ((err as any).code?.startsWith('DB_')) {
    errorDetails = ErrorMessageProvider.getDatabaseError(err)
  } else if ((err as any).code?.startsWith('AUTH_')) {
    errorDetails = ErrorMessageProvider.getAuthError(err)
  } else if ((err as any).code?.startsWith('VALIDATION_')) {
    errorDetails = ErrorMessageProvider.getValidationError(err)
  } else if (err.message?.includes('AI') || err.message?.includes('API')) {
    errorDetails = ErrorMessageProvider.getAIError('AI', err)
  } else if (err.message?.includes('데이터베이스') || err.message?.includes('database')) {
    errorDetails = ErrorMessageProvider.getDatabaseError(err)
  }

  // 프로덕션에서 스택 트레이스 및 상세 정보 숨김
  const errorResponse: any = {
    success: false,
    error: {
      message: errorDetails.message,
      code: errorDetails.code
    }
  }

  // 복구 가능한 에러인 경우 제안 포함
  if (errorDetails.recoverable && errorDetails.suggestions) {
    errorResponse.error.suggestions = errorDetails.suggestions
  }
  
  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack
    errorResponse.error.details = {
      path: req.path,
      method: req.method,
      originalMessage: message
    }
  }
  
  res.status(statusCode).json(errorResponse)
}

