/**
 * 성능 최적화 유틸리티
 * 코드 스플리팅, 레이지 로딩, 메모리 최적화 등
 */

// 동적 import 헬퍼
export async function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> {
  try {
    const loadedModule = await importFn();
    return loadedModule.default;
  } catch (error) {
    console.error('Lazy load failed:', error);
    if (fallback) return fallback;
    throw error;
  }
}

// 이미지 레이지 로딩
export function lazyLoadImage(src: string, placeholder?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    if (placeholder) {
      img.src = placeholder;
    }

    img.onload = () => resolve(src);
    img.onerror = reject;
    
    // Intersection Observer로 필요할 때 로드
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    // placeholder 이미지가 있으면 관찰 시작
    if (placeholder && img.complete) {
      observer.observe(img);
    } else {
      img.src = src;
    }

    resolve(src);
  });
}

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// 스로틀 함수
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 메모리 사용량 모니터링
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  return { used: 0, total: 0, percentage: 0 };
}

// 메모리 누수 감지
export function detectMemoryLeaks(
  initialMemory: number,
  currentMemory: number,
  threshold: number = 50 // MB
): boolean {
  const diff = (currentMemory - initialMemory) / (1024 * 1024); // MB
  return diff > threshold;
}

// 가비지 컬렉션 강제 실행 (개발 환경에서만)
export function forceGarbageCollection(): void {
  if (typeof (window as any).gc === 'function') {
    (window as any).gc();
  }
}

// 컴포넌트 프리로딩
export function preloadComponent(componentPath: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = componentPath;
  document.head.appendChild(link);
}

// 리소스 힌트 추가
export function addResourceHints(resources: Array<{ href: string; as: string; rel: string }>): void {
  resources.forEach(({ href, as, rel }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (as) link.setAttribute('as', as);
    document.head.appendChild(link);
  });
}

// 코드 스플리팅 포인트 생성
export function createSplitPoint<T>(loadFn: () => Promise<T>): {
  load: () => Promise<T>;
  preload: () => void;
} {
  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return {
    load: async () => {
      if (cached) return cached;
      if (loading) return loading;

      loading = loadFn().then((module) => {
        cached = module;
        loading = null;
        return module;
      });

      return loading;
    },
    preload: () => {
      if (!cached && !loading) {
        loading = loadFn().then((module) => {
          cached = module;
          loading = null;
          return module;
        });
      }
    },
  };
}

// 빈 함수 (최적화용)
export const noop = () => {};

// 성능 측정
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${name}-start`);
    const result = fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    return result;
  }
  return fn();
}

// 애니메이션 프레임 최적화
export function requestAnimationFramePromise(): Promise<number> {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

// 배치 업데이트
export class BatchUpdater {
  private updates: Array<() => void> = [];
  private scheduled = false;

  add(update: () => void): void {
    this.updates.push(update);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush(): void {
    const updates = this.updates.slice();
    this.updates = [];
    this.scheduled = false;

    updates.forEach((update) => update());
  }
}

