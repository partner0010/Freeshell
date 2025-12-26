/**
 * Web Vitals 모니터링
 * Core Web Vitals 및 성능 지표 추적
 */

export interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

/**
 * Web Vitals 수집 및 전송
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric);
  }

  // 프로덕션에서는 API로 전송
  if (process.env.NODE_ENV === 'production') {
    // 비동기로 전송 (블로킹 방지)
    if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
      const data = JSON.stringify(metric);
      navigator.sendBeacon('/api/analytics/web-vitals', data);
    } else {
      // sendBeacon이 없는 경우 fetch 사용
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true,
      }).catch(() => {
        // 에러는 무시 (성능 모니터링은 비중요)
      });
    }
  }
}

/**
 * Web Vitals 초기화
 * web-vitals 패키지가 설치되어 있지 않아도 빌드가 성공하도록 처리
 */
export function initWebVitals() {
  if (typeof window === 'undefined') {
    return;
  }

  // 클라이언트 사이드에서만 실행
  // web-vitals 패키지가 없어도 빌드가 성공하도록 try-catch로 처리
  try {
    // 동적 import를 사용하여 런타임에만 로드
    // 빌드 타임에는 이 코드가 실행되지 않으므로 webpack이 모듈을 찾지 않음
    const loadWebVitals = () => {
      // eval을 사용하여 동적 import를 완전히 런타임으로 지연
      const importWebVitals = new Function('return import("web-vitals")');
      
      importWebVitals()
        .then((webVitals: any) => {
          const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = webVitals;
          
          if (onCLS) onCLS(reportWebVitals);
          if (onFID) onFID(reportWebVitals);
          if (onFCP) onFCP(reportWebVitals);
          if (onLCP) onLCP(reportWebVitals);
          if (onTTFB) onTTFB(reportWebVitals);
          if (onINP) onINP(reportWebVitals);
        })
        .catch(() => {
          // web-vitals 패키지가 없는 경우 무시
          // 개발 환경에서만 경고 출력
          if (process.env.NODE_ENV === 'development') {
            console.warn('Web Vitals 패키지가 설치되지 않았습니다. 성능 모니터링이 비활성화됩니다.');
          }
        });
    };
    
    // 다음 틱에서 실행하여 빌드 타임에 분석되지 않도록 함
    setTimeout(loadWebVitals, 0);
  } catch (error) {
    // 빌드 타임 에러 방지
    if (process.env.NODE_ENV === 'development') {
      console.warn('Web Vitals 초기화 실패:', error);
    }
  }
}

