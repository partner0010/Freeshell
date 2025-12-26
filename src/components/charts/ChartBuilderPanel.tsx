'use client';

import React, { useState } from 'react';
import { BarChart3, Download, Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { chartBuilder, type ChartType, type ChartConfig } from '@/lib/data-visualization/chart-builder';
import { useToast } from '@/components/ui/Toast';

export function ChartBuilderPanel() {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [config, setConfig] = useState<ChartConfig | null>(null);
  const { showToast } = useToast();

  const chartTypes = [
    { value: 'line', label: '라인 차트' },
    { value: 'bar', label: '바 차트' },
    { value: 'pie', label: '파이 차트' },
    { value: 'area', label: '영역 차트' },
    { value: 'scatter', label: '산점도' },
    { value: 'radar', label: '레이더 차트' },
  ];

  const handleGenerate = () => {
    const data = chartBuilder.generateSampleData(chartType);
    const newConfig = chartBuilder.createChart({
      type: chartType,
      title: `${chartTypes.find((t) => t.value === chartType)?.label}`,
      data,
    });
    setConfig(newConfig);
    showToast({ type: 'success', message: '차트가 생성되었습니다' });
  };

  const handleExport = () => {
    if (!config) return;
    const json = chartBuilder.exportChartConfig(config);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', message: '차트 설정이 다운로드되었습니다' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">차트 빌더</h2>
            <p className="text-sm text-gray-500">데이터 시각화 및 차트 생성</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 차트 타입 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>차트 타입 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  차트 유형
                </label>
                <Dropdown
                  options={chartTypes}
                  value={chartType}
                  onChange={(value) => setChartType(value as ChartType)}
                />
              </div>
              <Button variant="primary" onClick={handleGenerate}>
                생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 차트 미리보기 */}
        {config && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{config.title}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download size={16} className="mr-2" />
                  내보내기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="mx-auto mb-2 text-gray-400" size={48} />
                  <p className="text-sm text-gray-500">
                    {config.type} 차트 미리보기
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    (실제 차트 라이브러리 통합 필요)
                  </p>
                </div>
              </div>

              {/* 데이터 표시 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">데이터</h4>
                <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                  <div className="mb-2">Labels: {config.data.labels.join(', ')}</div>
                  <div>
                    Values: {config.data.datasets[0].data.join(', ')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

