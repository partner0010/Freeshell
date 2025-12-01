/**
 * 메트릭 수집 미들웨어
 */

import { Request, Response, NextFunction } from 'express'
import { 
  httpRequestDuration, 
  httpRequestTotal, 
  httpRequestErrors,
  activeConnections
} from '../services/monitoring/metrics'

/**
 * HTTP 요청 메트릭 수집
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now()
  const route = req.route?.path || req.path
  const method = req.method

  // 활성 연결 수 증가
  activeConnections.inc()

  // 응답 완료 시 메트릭 기록
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000 // 초 단위
    const status = res.statusCode.toString()

    // 요청 지속 시간 기록
    httpRequestDuration.observe(
      { method, route, status },
      duration
    )

    // 요청 수 증가
    httpRequestTotal.inc({ method, route, status })

    // 에러 카운트
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error'
      httpRequestErrors.inc({ method, route, error_type: errorType })
    }

    // 활성 연결 수 감소
    activeConnections.dec()
  })

  next()
}

