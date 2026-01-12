/**
 * 성능 모니터링 컴포넌트
 * 페이지 로딩 시간 및 리소스 사용량 표시
 */
'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, HardDrive } from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  networkRequests: number;
  totalSize: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      const firstPaint = paint.find(p => p.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      // Time to Interactive (TTI) 추정
      const timeToInteractive = navigation.domInteractive - navigation.fetchStart;

      // 메모리 사용량 (Chrome만 지원)
      const memory = (performance as any).memory;

      // 네트워크 요청
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const networkRequests = resources.length;
      const totalSize = resources.reduce((sum, r) => {
        const size = (r as any).transferSize || 0;
        return sum + size;
      }, 0);

      setMetrics({
        pageLoadTime: Math.round(pageLoadTime),
        domContentLoaded: Math.round(domContentLoaded),
        firstPaint: Math.round(firstPaint),
        firstContentfulPaint: Math.round(firstContentfulPaint),
        timeToInteractive: Math.round(timeToInteractive),
        memoryUsage: memory ? {
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        } : undefined,
        networkRequests,
        totalSize: Math.round(totalSize / 1024), // KB
      });
    };

    // 페이지 로드 완료 후 측정
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  if (!metrics) return null;

  const getPerformanceRating = (time: number, type: 'load' | 'paint' | 'tti') => {
    let threshold: number;
    if (type === 'load') threshold = 3000;
    else if (type === 'paint') threshold = 1800;
    else threshold = 3800;

    if (time < threshold * 0.5) return { color: 'text-green-600', label: '우수' };
    if (time < threshold) return { color: 'text-yellow-600', label: '양호' };
    return { color: 'text-red-600', label: '개선 필요' };
  };

  const loadRating = getPerformanceRating(metrics.pageLoadTime, 'load');
  const paintRating = getPerformanceRating(metrics.firstContentfulPaint, 'paint');
  const ttiRating = getPerformanceRating(metrics.timeToInteractive, 'tti');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          title="성능 모니터 열기"
        >
          <Activity className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border-2 border-purple-200 p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">성능 모니터</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* 페이지 로드 시간 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">페이지 로드</span>
                </div>
                <span className={`text-sm font-bold ${loadRating.color}`}>
                  {loadRating.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.pageLoadTime}ms
              </div>
            </div>

            {/* First Contentful Paint */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">FCP</span>
                </div>
                <span className={`text-sm font-bold ${paintRating.color}`}>
                  {paintRating.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.firstContentfulPaint}ms
              </div>
            </div>

            {/* Time to Interactive */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">TTI</span>
                <span className={`text-sm font-bold ${ttiRating.color}`}>
                  {ttiRating.label}
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {metrics.timeToInteractive}ms
              </div>
            </div>

            {/* 메모리 사용량 */}
            {metrics.memoryUsage && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">메모리</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>사용:</span>
                    <span className="font-semibold">{metrics.memoryUsage.usedJSHeapSize}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>전체:</span>
                    <span className="font-semibold">{metrics.memoryUsage.totalJSHeapSize}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>한도:</span>
                    <span className="font-semibold">{metrics.memoryUsage.jsHeapSizeLimit}MB</span>
                  </div>
                </div>
              </div>
            )}

            {/* 네트워크 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">네트워크</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>요청:</span>
                  <span className="font-semibold">{metrics.networkRequests}개</span>
                </div>
                <div className="flex justify-between">
                  <span>크기:</span>
                  <span className="font-semibold">{metrics.totalSize}KB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
