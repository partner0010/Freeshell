/**
 * Prometheus 메트릭 수집
 */

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'
import { logger } from '../../utils/logger'

// 메트릭 레지스트리 생성
export const register = new Registry()

// 기본 메트릭 수집 (CPU, 메모리 등)
collectDefaultMetrics({ register })

// 커스텀 메트릭 정의
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP 요청 처리 시간 (초)',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
})

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: '총 HTTP 요청 수',
  labelNames: ['method', 'route', 'status']
})

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'HTTP 에러 수',
  labelNames: ['method', 'route', 'error_type']
})

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: '현재 활성 연결 수'
})

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: '데이터베이스 쿼리 실행 시간 (초)',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
})

export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: '캐시 히트 수',
  labelNames: ['cache_type']
})

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: '캐시 미스 수',
  labelNames: ['cache_type']
})

export const contentGenerated = new Counter({
  name: 'content_generated_total',
  help: '생성된 콘텐츠 수',
  labelNames: ['content_type', 'platform']
})

export const contentUploaded = new Counter({
  name: 'content_uploaded_total',
  help: '업로드된 콘텐츠 수',
  labelNames: ['platform', 'status']
})

export const aiApiCalls = new Counter({
  name: 'ai_api_calls_total',
  help: 'AI API 호출 수',
  labelNames: ['provider', 'status']
})

export const aiApiDuration = new Histogram({
  name: 'ai_api_duration_seconds',
  help: 'AI API 호출 시간 (초)',
  labelNames: ['provider'],
  buckets: [1, 2, 5, 10, 30, 60]
})

export const aiApiResponseTime = new Histogram({
  name: 'ai_api_response_time_seconds',
  help: 'AI API 응답 시간 (초)',
  labelNames: ['provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
})

export const aiApiTokens = new Counter({
  name: 'ai_api_tokens_total',
  help: 'AI API 사용 토큰 수',
  labelNames: ['provider', 'type'] // type: 'input' | 'output'
})

export const aiApiErrors = new Counter({
  name: 'ai_api_errors_total',
  help: 'AI API 에러 수',
  labelNames: ['provider', 'error_type']
})

export const scheduledJobsExecuted = new Counter({
  name: 'scheduled_jobs_executed_total',
  help: '실행된 스케줄 작업 수',
  labelNames: ['schedule_id', 'status']
})

export const queueSize = new Gauge({
  name: 'queue_size',
  help: '큐 크기',
  labelNames: ['queue_name']
})

export const queueProcessingDuration = new Histogram({
  name: 'queue_processing_duration_seconds',
  help: '큐 처리 시간 (초)',
  labelNames: ['queue_name', 'job_type'],
  buckets: [1, 5, 10, 30, 60, 300]
})

// 모든 메트릭을 레지스트리에 등록
register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestTotal)
register.registerMetric(httpRequestErrors)
register.registerMetric(activeConnections)
register.registerMetric(databaseQueryDuration)
register.registerMetric(cacheHits)
register.registerMetric(cacheMisses)
register.registerMetric(contentGenerated)
register.registerMetric(contentUploaded)
register.registerMetric(aiApiCalls)
register.registerMetric(aiApiDuration)
register.registerMetric(aiApiTokens)
register.registerMetric(aiApiResponseTime)
register.registerMetric(scheduledJobsExecuted)
register.registerMetric(queueSize)
register.registerMetric(queueProcessingDuration)

logger.info('✅ Prometheus 메트릭 초기화 완료')

/**
 * 메트릭 수집 엔드포인트용 데이터 반환
 */
export async function getMetrics(): Promise<string> {
  return register.metrics()
}

