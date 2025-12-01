/**
 * 에러 추적 및 로깅 시스템
 */

import { logger } from '../../utils/logger'
import { getPrismaClient } from '../../utils/database'
import { httpRequestErrors } from './metrics'

export interface ErrorInfo {
  message: string
  stack?: string
  code?: string
  statusCode?: number
  path?: string
  method?: string
  userId?: string
  ip?: string
  userAgent?: string
  timestamp: Date
}

/**
 * 에러 추적 서비스
 */
export class ErrorTracker {
  /**
   * 에러 기록
   */
  async trackError(error: Error, context?: {
    path?: string
    method?: string
    userId?: string
    ip?: string
    userAgent?: string
    statusCode?: number
  }): Promise<void> {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
      statusCode: context?.statusCode || 500,
      path: context?.path,
      method: context?.method,
      userId: context?.userId,
      ip: context?.ip,
      userAgent: context?.userAgent,
      timestamp: new Date()
    }

    // 로그 기록
    logger.error('에러 발생:', errorInfo)

    // 메트릭 업데이트
    if (context?.path && context?.method) {
      const errorType = errorInfo.statusCode && errorInfo.statusCode >= 500 
        ? 'server_error' 
        : 'client_error'
      httpRequestErrors.inc({
        method: context.method,
        route: context.path,
        error_type: errorType
      })
    }

    // 데이터베이스에 저장 (선택적)
    try {
      const prisma = getPrismaClient()
      await prisma.securityLog.create({
        data: {
          type: 'error',
          severity: errorInfo.statusCode && errorInfo.statusCode >= 500 ? 'high' : 'medium',
          message: errorInfo.message,
          details: JSON.stringify({
            stack: errorInfo.stack,
            code: errorInfo.code,
            path: errorInfo.path,
            method: errorInfo.method,
            userId: errorInfo.userId,
            ip: errorInfo.ip
          }),
          timestamp: errorInfo.timestamp
        }
      })
    } catch (dbError) {
      // 데이터베이스 저장 실패는 무시 (로그만 기록)
      logger.warn('에러 정보 데이터베이스 저장 실패:', dbError)
    }
  }

  /**
   * 에러 통계 조회
   */
  async getErrorStats(days: number = 7): Promise<{
    total: number
    byType: Record<string, number>
    byPath: Record<string, number>
    recent: ErrorInfo[]
  }> {
    try {
      const prisma = getPrismaClient()
      const dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - days)

      const errors = await prisma.securityLog.findMany({
        where: {
          type: 'error',
          timestamp: {
            gte: dateThreshold
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 100
      })

      const byType: Record<string, number> = {}
      const byPath: Record<string, number> = {}

      errors.forEach(error => {
        const details = JSON.parse(error.details || '{}')
        const errorType = error.severity || 'unknown'
        const path = details.path || 'unknown'

        byType[errorType] = (byType[errorType] || 0) + 1
        byPath[path] = (byPath[path] || 0) + 1
      })

      const recent: ErrorInfo[] = errors.slice(0, 10).map(error => {
        const details = JSON.parse(error.details || '{}')
        return {
          message: error.message,
          stack: details.stack,
          code: details.code,
          statusCode: details.statusCode,
          path: details.path,
          method: details.method,
          userId: details.userId,
          ip: details.ip,
          timestamp: error.timestamp
        }
      })

      return {
        total: errors.length,
        byType,
        byPath,
        recent
      }
    } catch (error) {
      logger.error('에러 통계 조회 실패:', error)
      return {
        total: 0,
        byType: {},
        byPath: {},
        recent: []
      }
    }
  }
}

export const errorTracker = new ErrorTracker()

