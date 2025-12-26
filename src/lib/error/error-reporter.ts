/**
 * 에러 리포팅 시스템
 * 클라이언트 사이드 에러 수집 및 전송
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorReporter {
  private sessionId: string;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 전역 에러 핸들러 설정
   */
  private setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') {
      return;
    }

    // JavaScript 에러
    window.addEventListener('error', (event) => {
      this.report({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high',
      });
    });

    // Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.report({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'medium',
      });
    });
  }

  /**
   * 에러 리포팅
   */
  report(error: Partial<ErrorReport>): void {
    const report: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      componentStack: error.componentStack,
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      timestamp: error.timestamp || Date.now(),
      sessionId: this.sessionId,
      severity: error.severity || 'medium',
    };

    // 큐에 추가
    this.errorQueue.push(report);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Reporter]', report);
    }

    // 프로덕션에서는 서버로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToServer(report);
    }
  }

  /**
   * 서버로 에러 전송
   */
  private async sendToServer(report: ErrorReport): Promise<void> {
    try {
      // sendBeacon 사용 (페이지 언로드 시에도 전송 가능)
      if ('sendBeacon' in navigator) {
        const data = JSON.stringify(report);
        navigator.sendBeacon('/api/analytics/errors', data);
      } else {
        // fallback: fetch 사용
        await fetch('/api/analytics/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
          keepalive: true,
        });
      }
    } catch (error) {
      // 에러 전송 실패는 무시 (무한 루프 방지)
      console.error('Failed to send error report:', error);
    }
  }

  /**
   * 큐에 있는 모든 에러 전송
   */
  flush(): void {
    this.errorQueue.forEach(report => this.sendToServer(report));
    this.errorQueue = [];
  }

  /**
   * 세션 ID 가져오기
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// 싱글톤 인스턴스
export const errorReporter = typeof window !== 'undefined' ? new ErrorReporter() : null;

// 페이지 언로드 시 큐 플러시
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    errorReporter?.flush();
  });
}

