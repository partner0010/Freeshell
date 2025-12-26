/**
 * 번들 분석 유틸리티
 * 프로덕션 빌드에서 번들 크기 분석
 */

export interface BundleInfo {
  name: string;
  size: number;
  gzippedSize?: number;
}

/**
 * 번들 정보 수집 (개발용)
 */
export function analyzeBundle(): BundleInfo[] {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return [];
  }

  const bundles: BundleInfo[] = [];

  // Performance API를 사용하여 리소스 로딩 정보 수집
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach((resource) => {
      if (resource.name.includes('_next/static')) {
        bundles.push({
          name: resource.name,
          size: resource.transferSize || 0,
        });
      }
    });
  }

  return bundles;
}

/**
 * 번들 크기 경고 (개발 환경)
 */
export function checkBundleSize() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  const bundles = analyzeBundle();
  const largeBundles = bundles.filter(b => b.size > 500 * 1024); // 500KB 이상

  if (largeBundles.length > 0) {
    console.warn('[Bundle Analyzer] 큰 번들 파일 발견:', largeBundles);
    console.warn('코드 분할을 고려하세요.');
  }
}

