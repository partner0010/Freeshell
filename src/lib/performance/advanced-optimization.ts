/**
 * 고급 성능 최적화
 * Advanced Performance Optimization
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * 이미지 최적화 옵션
 */
export interface ImageOptimizationOptions {
  quality?: number; // 1-100
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'empty';
  loading?: 'lazy' | 'eager';
}

/**
 * 이미지 URL 최적화 (Next.js Image 최적화 URL 생성)
 */
export function optimizeImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { quality = 75, format = 'webp', width, height } = options;

  // Next.js Image 최적화 URL 생성
  if (src.startsWith('/') || src.startsWith('http')) {
    const params = new URLSearchParams();
    if (quality) params.set('q', quality.toString());
    if (format) params.set('f', format);
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());

    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}${params.toString()}`;
  }

  return src;
}

/**
 * 리소스 힌트 생성 (preconnect, prefetch, preload)
 */
export function useResourceHints(resources: Array<{
  href: string;
  as?: string;
  type?: 'preconnect' | 'prefetch' | 'preload' | 'dns-prefetch';
}>) {
  useEffect(() => {
    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = resource.type || 'prefetch';
      link.href = resource.href;
      if (resource.as) link.as = resource.as;
      if (resource.type === 'preconnect') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });

    return () => {
      resources.forEach((resource) => {
        const links = document.querySelectorAll(
          `link[href="${resource.href}"]`
        );
        links.forEach((link) => link.remove());
      });
    };
  }, [resources]);
}

/**
 * 가상 스크롤링 최적화 (대용량 리스트용)
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo<T[]>(
    () => items.slice(visibleRange.start, visibleRange.end),
    [items, visibleRange.start, visibleRange.end]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

/**
 * 웹 워커를 사용한 무거운 작업 분리
 */
export function useWebWorker<T, R>(
  workerScript: string,
  onMessage?: (result: R) => void
) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    workerRef.current = new Worker(url);

    if (onMessage) {
      workerRef.current.onmessage = (e) => onMessage(e.data);
    }

    return () => {
      workerRef.current?.terminate();
      URL.revokeObjectURL(url);
    };
  }, [workerScript, onMessage]);

  const postMessage = useCallback((data: T) => {
    workerRef.current?.postMessage(data);
  }, []);

  return { postMessage };
}

/**
 * 디바운스된 상태 업데이트
 */
export function useDebouncedState<T>(
  initialState: T,
  delay: number = 300
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(initialState);
  const [debouncedState, setDebouncedState] = React.useState<T>(initialState);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedState(state);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, delay]);

  return [state, debouncedState, setState];
}

/**
 * 인터섹션 옵저버를 사용한 레이지 로딩
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { 
    ref: ref as React.RefObject<HTMLElement>, 
    isIntersecting 
  };
}

/**
 * 번들 분석 및 최적화 추천
 */
export function analyzeBundleSize(modules: Record<string, number>): {
  largest: Array<{ name: string; size: number }>;
  recommendations: string[];
} {
  const entries = Object.entries(modules)
    .map(([name, size]) => ({ name, size }))
    .sort((a, b) => b.size - a.size);

  const largest = entries.slice(0, 10);
  const recommendations: string[] = [];

  largest.forEach((module) => {
    if (module.size > 100 * 1024) {
      recommendations.push(
        `${module.name}가 크기(${Math.round(module.size / 1024)}KB)가 큽니다. 코드 스플리팅을 고려하세요.`
      );
    }
  });

  return { largest, recommendations };
}

/**
 * 최적화 리포트 타입
 */
export interface OptimizationReport {
  improvements: {
    sizeReduction: number;
    timeReduction: number;
    score: number;
  };
  recommendations: string[];
}

/**
 * 고급 최적화 시스템
 */
export const advancedOptimizationSystem = {
  analyzeBundle(): OptimizationReport {
    // 실제로는 웹팩 번들 분석 결과를 사용해야 하지만,
    // 여기서는 더미 데이터를 반환합니다.
    return {
      improvements: {
        sizeReduction: 15,
        timeReduction: 20,
        score: 85,
      },
      recommendations: [
        '이미지 최적화를 통해 15% 크기 감소 가능',
        '코드 스플리팅으로 초기 로딩 시간 20% 개선',
        'Critical CSS 추출로 렌더링 성능 향상',
      ],
    };
  },

  preloadResources(options: {
    criticalCSS?: boolean;
    criticalJS?: boolean;
    fonts?: boolean;
    images?: string[];
  }): void {
    // 리소스 프리로드 로직
    if (options.criticalCSS) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = '/critical.css';
      document.head.appendChild(link);
    }

    if (options.criticalJS) {
      const script = document.createElement('script');
      script.rel = 'preload';
      script.as = 'script';
      script.href = '/critical.js';
      document.head.appendChild(script);
    }

    if (options.fonts) {
      // 폰트 프리로드
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.type = 'font/woff2';
      fontLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontLink);
    }

    options.images?.forEach((imageUrl) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      document.head.appendChild(link);
    });
  },
};
