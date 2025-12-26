/**
 * 메모리 관리 유틸리티
 * 메모리 누수 방지 및 성능 모니터링
 */

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * 메모리 사용량 모니터링
 */
export function getMemoryUsage(): MemoryInfo | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  const memory = (performance as any).memory;
  if (!memory) {
    return null;
  }

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}

/**
 * 메모리 누수 감지
 */
export function checkMemoryLeak(threshold: number = 0.8): boolean {
  const memory = getMemoryUsage();
  if (!memory) {
    return false;
  }

  const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
  return usageRatio > threshold;
}

/**
 * 메모리 정리 (가비지 컬렉션 힌트)
 */
export function suggestGarbageCollection(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // GC 힌트 (브라우저가 무시할 수 있음)
  if ('gc' in window && typeof (window as any).gc === 'function') {
    (window as any).gc();
  }
}

/**
 * 이벤트 리스너 정리 헬퍼
 */
export class EventListenerManager {
  private listeners: Array<{
    target: EventTarget;
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = [];

  /**
   * 이벤트 리스너 추가
   */
  add(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options);
    this.listeners.push({ target, event, handler, options });
  }

  /**
   * 모든 이벤트 리스너 제거
   */
  cleanup(): void {
    this.listeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    this.listeners = [];
  }
}

/**
 * React useEffect cleanup 헬퍼
 */
export function useEventListenerCleanup() {
  const manager = new EventListenerManager();

  return {
    add: manager.add.bind(manager),
    cleanup: () => {
      manager.cleanup();
    },
  };
}

/**
 * 메모리 모니터링 시작
 */
export function startMemoryMonitoring(interval: number = 30000): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const checkInterval = setInterval(() => {
    const memory = getMemoryUsage();
    if (memory) {
      const usageMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Memory] 사용량: ${usageMB}MB / ${limitMB}MB`);
      }

      // 메모리 누수 감지
      if (checkMemoryLeak()) {
        console.warn('[Memory] 메모리 사용량이 높습니다. 페이지를 새로고침하는 것을 권장합니다.');
      }
    }
  }, interval);

  return () => clearInterval(checkInterval);
}

