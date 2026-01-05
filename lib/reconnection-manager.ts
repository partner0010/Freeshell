/**
 * 자동 재연결 관리자
 * 연결이 끊어졌을 때 자동으로 재연결 시도
 */

export class ReconnectionManager {
  private maxRetries: number = 5;
  private retryDelay: number = 3000; // 3초
  private currentRetries: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private onReconnectCallback?: () => Promise<void>;
  private onReconnectSuccessCallback?: () => void;
  private onReconnectFailedCallback?: () => void;

  constructor(config?: {
    maxRetries?: number;
    retryDelay?: number;
  }) {
    if (config?.maxRetries) this.maxRetries = config.maxRetries;
    if (config?.retryDelay) this.retryDelay = config.retryDelay;
  }

  /**
   * 재연결 시도
   */
  async attemptReconnect(): Promise<boolean> {
    if (this.currentRetries >= this.maxRetries) {
      if (this.onReconnectFailedCallback) {
        this.onReconnectFailedCallback();
      }
      return false;
    }

    this.currentRetries++;

    try {
      if (this.onReconnectCallback) {
        await this.onReconnectCallback();
        
        // 재연결 성공
        this.currentRetries = 0;
        if (this.onReconnectSuccessCallback) {
          this.onReconnectSuccessCallback();
        }
        return true;
      }
    } catch (error) {
      console.error(`재연결 시도 ${this.currentRetries} 실패:`, error);
      
      // 다음 재시도 예약
      if (this.currentRetries < this.maxRetries) {
        this.scheduleReconnect();
      } else {
        if (this.onReconnectFailedCallback) {
          this.onReconnectFailedCallback();
        }
      }
    }

    return false;
  }

  /**
   * 재연결 예약
   */
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.attemptReconnect();
    }, this.retryDelay);
  }

  /**
   * 재연결 콜백 설정
   */
  onReconnect(callback: () => Promise<void>) {
    this.onReconnectCallback = callback;
  }

  /**
   * 재연결 성공 콜백 설정
   */
  onReconnectSuccess(callback: () => void) {
    this.onReconnectSuccessCallback = callback;
  }

  /**
   * 재연결 실패 콜백 설정
   */
  onReconnectFailed(callback: () => void) {
    this.onReconnectFailedCallback = callback;
  }

  /**
   * 재연결 리셋
   */
  reset() {
    this.currentRetries = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 재연결 중지
   */
  stop() {
    this.reset();
  }

  /**
   * 현재 재시도 횟수
   */
  getCurrentRetries(): number {
    return this.currentRetries;
  }
}

