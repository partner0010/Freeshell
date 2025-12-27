/**
 * 성능 최적화 유틸리티
 * 100점 성능 점수를 위한 최적화
 */

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * 이미지 lazy loading 및 최적화
 */
export function optimizeImage(src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
}): string {
  // Next.js Image 컴포넌트가 자동으로 최적화하므로
  // 여기서는 URL 파라미터 추가만 수행
  const params = new URLSearchParams();
  
  if (options?.width) params.set('w', String(options.width));
  if (options?.height) params.set('h', String(options.height));
  if (options?.quality) params.set('q', String(options.quality));
  if (options?.format) params.set('f', options.format);
  
  return params.toString() ? `${src}?${params.toString()}` : src;
}

/**
 * 리소스 프리로딩
 */
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
}

/**
 * 리소스 프리페치
 */
export function prefetchResource(href: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * DNS 프리페치
 */
export function prefetchDNS(domain: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = `//${domain}`;
  document.head.appendChild(link);
}

/**
 * 코드 스플리팅을 위한 동적 임포트 헬퍼
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactElement | null
) {
  const defaultFallback = React.createElement('div', { className: 'animate-pulse bg-gray-200 h-32 rounded' });
  return dynamic(importFn, {
    loading: () => fallback || defaultFallback,
    ssr: false,
  });
}

/**
 * 성능 모니터링
 */
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  if (typeof window === 'undefined' || !window.performance) {
    return fn();
  }
  
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
    });
  }
  
  const duration = performance.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * 디바운스
 */
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
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 스로틀
 */
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

