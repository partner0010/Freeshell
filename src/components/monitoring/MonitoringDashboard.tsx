'use client';

import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, TrendingUp, Clock, Server } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { errorTracker } from '@/lib/monitoring/error-tracking';
import { performanceBenchmark } from '@/lib/monitoring/performance-benchmark';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function MonitoringDashboard() {
  const [errorStats, setErrorStats] = useState(errorTracker.getErrorStats());
  const [recentErrors, setRecentErrors] = useState(errorTracker.getErrors(10));
  const [performanceReports, setPerformanceReports] = useState(performanceBenchmark.getReports());
  const [activeTab, setActiveTab] = useState<'errors' | 'performance'>('errors');
  const { showToast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setErrorStats(errorTracker.getErrorStats());
      setRecentErrors(errorTracker.getErrors(10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRunBenchmark = async () => {
    try {
      const { benchmark } = await performanceBenchmark.measureFunction(
        'sample-operation',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'done';
        },
        10
      );

      const report = performanceBenchmark.createReport('Benchmark Test', [benchmark]);
      setPerformanceReports(performanceBenchmark.getReports());
      showToast({ type: 'success', message: `벤치마크 완료: ${benchmark.duration.toFixed(2)}ms` });
    } catch (error) {
      showToast({ type: 'error', message: '벤치마크 실행 중 오류 발생' });
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      error: 'bg-orange-100 text-orange-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const tabs = [
    { id: 'errors', label: '에러 모니터링' },
    { id: 'performance', label: '성능 모니터링' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">모니터링 대시보드</h2>
            <p className="text-sm text-gray-500">에러 트래킹 및 성능 모니터링</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'errors' ? (
          <>
            {/* 에러 통계 */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">전체 에러</p>
                      <p className="text-2xl font-bold">{errorStats.total}</p>
                    </div>
                    <AlertCircle className="text-gray-400" size={24} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Critical</p>
                      <p className="text-2xl font-bold text-red-600">{errorStats.bySeverity.critical}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Error</p>
                      <p className="text-2xl font-bold text-orange-600">{errorStats.bySeverity.error}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Error</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">미해결</p>
                      <p className="text-2xl font-bold text-yellow-600">{errorStats.unresolved}</p>
                    </div>
                    <Clock className="text-yellow-400" size={24} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 최근 에러 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 에러</CardTitle>
              </CardHeader>
              <CardContent>
                {recentErrors.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    에러가 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentErrors.map((error) => (
                      <div key={error.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                            <span className="font-medium">{error.message}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {error.url && (
                          <p className="text-xs text-gray-500 mb-1">URL: {error.url}</p>
                        )}
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer">스택 트레이스</summary>
                            <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-auto">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 성능 벤치마크 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>성능 벤치마크</CardTitle>
                  <button
                    onClick={handleRunBenchmark}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                  >
                    <TrendingUp size={16} className="inline mr-2" />
                    벤치마크 실행
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {performanceReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    벤치마크 리포트가 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {performanceReports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{report.name}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(report.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">평균</p>
                            <p className="font-bold text-lg">{report.averageDuration.toFixed(2)}ms</p>
                          </div>
                          <div>
                            <p className="text-gray-600">최소</p>
                            <p className="font-bold text-lg text-green-600">{report.minDuration.toFixed(2)}ms</p>
                          </div>
                          <div>
                            <p className="text-gray-600">최대</p>
                            <p className="font-bold text-lg text-red-600">{report.maxDuration.toFixed(2)}ms</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

