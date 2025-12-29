'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 분석 추적 컴포넌트
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지뷰 추적
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pathname,
      });
    }

    // 커스텀 분석
    console.log('Page view:', pathname);
  }, [pathname]);

  return null;
}

