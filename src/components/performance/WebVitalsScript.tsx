/**
 * Web Vitals 스크립트
 * 클라이언트 사이드에서 Web Vitals 수집
 */

'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/performance/web-vitals';

export function WebVitalsScript() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}

