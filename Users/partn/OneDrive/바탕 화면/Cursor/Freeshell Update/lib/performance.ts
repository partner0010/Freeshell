// 성능 모니터링 및 최적화

export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();

  static startMeasure(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-start`);
    }
  }

  static endMeasure(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        this.metrics.set(name, measure.duration);
        return measure.duration;
      }
    }
    return 0;
  }

  static getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  static reportWebVitals(metric: any) {
    // Web Vitals 리포트
    console.log(metric);
    
    // 실제로는 분석 서비스로 전송
    // analytics.track('web-vital', metric);
  }
}

// 이미지 지연 로딩
export function lazyLoadImages() {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// 리소스 프리로딩
export function preloadResource(url: string, as: string = 'fetch') {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

// 코드 스플리팅 헬퍼
export function loadComponent(componentPath: string) {
  return import(componentPath);
}

