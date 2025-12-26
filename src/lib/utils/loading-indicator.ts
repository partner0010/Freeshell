/**
 * 전역 로딩 인디케이터
 * 페이지 전체 로딩 상태 표시
 */

class LoadingIndicator {
  private isLoading: boolean = false;
  private message: string = '로딩 중...';
  private listeners: Set<(loading: boolean, message: string) => void> = new Set();

  /**
   * 로딩 시작
   */
  start(message: string = '로딩 중...'): void {
    this.isLoading = true;
    this.message = message;
    this.notifyListeners();
  }

  /**
   * 로딩 종료
   */
  stop(): void {
    this.isLoading = false;
    this.message = '로딩 중...';
    this.notifyListeners();
  }

  /**
   * 리스너 등록
   */
  subscribe(listener: (loading: boolean, message: string) => void): () => void {
    this.listeners.add(listener);
    listener(this.isLoading, this.message); // 즉시 현재 상태 전달

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 리스너에게 알림
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.isLoading, this.message);
    });
  }

  /**
   * 현재 상태 가져오기
   */
  getState(): { isLoading: boolean; message: string } {
    return {
      isLoading: this.isLoading,
      message: this.message,
    };
  }
}

// 싱글톤 인스턴스
export const loadingIndicator = typeof window !== 'undefined' ? new LoadingIndicator() : null;

