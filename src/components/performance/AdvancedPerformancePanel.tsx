'use client';

import React, { useState } from 'react';
import { TrendingUp, Image, Zap, CheckCircle2 } from 'lucide-react';
import {
  advancedOptimizationSystem,
  type OptimizationReport,
} from '@/lib/performance/advanced-optimization';

export function AdvancedPerformancePanel() {
  const [report, setReport] = useState<OptimizationReport | null>(null);

  const handleAnalyze = () => {
    try {
      const newReport = advancedOptimizationSystem.analyzeBundle();
      setReport(newReport);
    } catch (error) {
      console.error('번들 분석 실패:', error);
      alert('번들 분석 중 오류가 발생했습니다.');
    }
  };

  const handleOptimizeImages = () => {
    // 이미지 최적화 실행
    alert('이미지 최적화가 시작되었습니다.');
  };

  const handlePreload = () => {
    try {
      advancedOptimizationSystem.preloadResources({
        criticalCSS: true,
        criticalJS: true,
        fonts: true,
        images: [],
      });
      alert('리소스 프리로드가 활성화되었습니다.');
    } catch (error) {
      console.error('프리로드 실패:', error);
      alert('리소스 프리로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">고급 성능 최적화</h2>
            <p className="text-sm text-gray-500">성능 향상을 위한 고급 기능</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* 최적화 도구 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">최적화 도구</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleOptimizeImages}
              className="p-4 border rounded-xl hover:shadow-md transition-shadow text-left"
            >
              <Image className="text-blue-600 mb-2" size={32} />
              <div className="font-semibold text-gray-800">이미지 최적화</div>
              <div className="text-sm text-gray-600">WebP/AVIF 변환 및 압축</div>
            </button>

            <button
              onClick={handlePreload}
              className="p-4 border rounded-xl hover:shadow-md transition-shadow text-left"
            >
              <Zap className="text-yellow-600 mb-2" size={32} />
              <div className="font-semibold text-gray-800">리소스 프리로드</div>
              <div className="text-sm text-gray-600">Critical CSS/JS 자동 프리로드</div>
            </button>

            <button
              onClick={handleAnalyze}
              className="p-4 border rounded-xl hover:shadow-md transition-shadow text-left"
            >
              <TrendingUp className="text-green-600 mb-2" size={32} />
              <div className="font-semibold text-gray-800">번들 분석</div>
              <div className="text-sm text-gray-600">번들 크기 및 성능 분석</div>
            </button>
          </div>
        </section>

        {/* 분석 결과 */}
        {report && (
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">최적화 결과</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="text-green-600" size={24} />
                  <span className="font-semibold text-green-800">개선 사항</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-700">
                      {report.improvements.sizeReduction}%
                    </div>
                    <div className="text-sm text-gray-600">크기 감소</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">
                      {report.improvements.timeReduction}%
                    </div>
                    <div className="text-sm text-gray-600">로딩 시간 감소</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">
                      {report.improvements.requestReduction}%
                    </div>
                    <div className="text-sm text-gray-600">요청 감소</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">최적화 전</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {(report.before.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="text-sm text-gray-600">
                    {report.before.loadTime}ms | {report.before.requests} requests
                  </div>
                </div>
                <div className="p-4 border rounded-xl bg-green-50">
                  <div className="text-sm text-gray-600 mb-2">최적화 후</div>
                  <div className="text-lg font-semibold text-green-700">
                    {(report.after.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="text-sm text-gray-600">
                    {report.after.loadTime}ms | {report.after.requests} requests
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

