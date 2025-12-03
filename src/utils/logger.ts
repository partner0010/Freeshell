/**
 * 프론트엔드 로깅 시스템
 * 프로덕션에서는 민감한 정보를 제외하고 로깅
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  error?: any
  context?: Record<string, any>
  timestamp: Date
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 100 // 최대 저장 로그 수
  private isDevelopment = import.meta.env.DEV

  /**
   * 로그 기록
   */
  private log(level: LogLevel, message: string, error?: any, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      error: error ? this.sanitizeError(error) : undefined,
      context: this.sanitizeContext(context),
      timestamp: new Date()
    }

    // 메모리에 저장 (최근 100개만)
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 개발 환경에서만 콘솔 출력
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
      if (error) {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, error, context)
      } else {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context)
      }
    }

    // 프로덕션에서 에러는 서버로 전송 (선택적)
    if (level === 'error' && !this.isDevelopment) {
      this.sendErrorToServer(entry).catch(() => {
        // 서버 전송 실패는 무시
      })
    }
  }

  /**
   * 에러 정보 정제 (민감한 정보 제거)
   */
  private sanitizeError(error: any): any {
    if (!error) return error

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      }
    }

    if (typeof error === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(error)) {
        // 민감한 정보 제거
        if (['password', 'token', 'apiKey', 'secret', 'authorization'].includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]'
        } else {
          sanitized[key] = value
        }
      }
      return sanitized
    }

    return error
  }

  /**
   * 컨텍스트 정보 정제
   */
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined

    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(context)) {
      // 민감한 정보 제거
      if (['password', 'token', 'apiKey', 'secret', 'authorization'].includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  /**
   * 에러를 서버로 전송 (프로덕션)
   */
  private async sendErrorToServer(entry: LogEntry): Promise<void> {
    try {
      // API 엔드포인트가 있다면 전송
      // 현재는 구현하지 않음 (필요시 추가)
      // await fetch('/api/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })
    } catch (error) {
      // 전송 실패는 무시
    }
  }

  /**
   * Debug 로그
   */
  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log('debug', message, undefined, context)
    }
  }

  /**
   * Info 로그
   */
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, undefined, context)
  }

  /**
   * Warning 로그
   */
  warn(message: string, error?: any, context?: Record<string, any>) {
    this.log('warn', message, error, context)
  }

  /**
   * Error 로그
   */
  error(message: string, error?: any, context?: Record<string, any>) {
    this.log('error', message, error, context)
  }

  /**
   * 로그 조회 (최근 N개)
   */
  getLogs(limit: number = 50): LogEntry[] {
    return this.logs.slice(-limit)
  }

  /**
   * 로그 초기화
   */
  clear() {
    this.logs = []
  }

  /**
   * 에러 로그만 조회
   */
  getErrors(limit: number = 20): LogEntry[] {
    return this.logs.filter(log => log.level === 'error').slice(-limit)
  }
}

export const logger = new Logger()

// 전역 에러 핸들러
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('전역 에러 발생', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('처리되지 않은 Promise 거부', event.reason, {
      type: 'unhandledrejection'
    })
  })
}

