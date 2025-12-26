'use client';

import React, { useState } from 'react';
import { GitCompare, Plus, Minus, Edit2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { versionComparator, type VersionDiff, type VersionChange } from '@/lib/version/version-comparison';
import { useToast } from '@/components/ui/Toast';

export function VersionComparisonPanel() {
  const [version1, setVersion1] = useState('');
  const [version2, setVersion2] = useState('');
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const { showToast } = useToast();

  const handleCompare = () => {
    if (!version1.trim() || !version2.trim()) {
      showToast({ type: 'warning', message: '두 버전 모두 입력해주세요' });
      return;
    }

    setIsComparing(true);
    try {
      const result = versionComparator.compareVersions(
        'v1',
        'v2',
        version1,
        version2
      );
      setDiff(result);
      showToast({ type: 'success', message: '비교가 완료되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '비교 중 오류가 발생했습니다' });
    } finally {
      setIsComparing(false);
    }
  };

  const getChangeIcon = (type: VersionChange['type']) => {
    switch (type) {
      case 'added':
        return <Plus size={14} className="text-green-500" />;
      case 'removed':
        return <Minus size={14} className="text-red-500" />;
      case 'modified':
        return <Edit2 size={14} className="text-yellow-500" />;
    }
  };

  const getChangeColor = (type: VersionChange['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'removed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'modified':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const stats = diff ? versionComparator.generateStatistics(diff) : null;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <GitCompare className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">버전 비교</h2>
            <p className="text-sm text-gray-500">변경사항 시각화 및 분석</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 입력 */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>버전 1</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={version1}
                onChange={(e) => setVersion1(e.target.value)}
                placeholder="이전 버전 코드..."
                className="w-full h-48 px-4 py-3 border rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>버전 2</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={version2}
                onChange={(e) => setVersion2(e.target.value)}
                placeholder="새 버전 코드..."
                className="w-full h-48 px-4 py-3 border rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </CardContent>
          </Card>
        </div>

        <Button
          variant="primary"
          onClick={handleCompare}
          disabled={isComparing || !version1.trim() || !version2.trim()}
          className="w-full"
        >
          <GitCompare size={18} className="mr-2" />
          {isComparing ? '비교 중...' : '버전 비교'}
        </Button>

        {/* 통계 */}
        {stats && diff && (
          <Card>
            <CardHeader>
              <CardTitle>변경 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalChanges}</div>
                  <div className="text-sm text-gray-500">전체 변경</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{diff.summary.added}</div>
                  <div className="text-sm text-gray-500">추가</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{diff.summary.removed}</div>
                  <div className="text-sm text-gray-500">삭제</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{diff.summary.modified}</div>
                  <div className="text-sm text-gray-500">수정</div>
                </div>
              </div>

              {/* 비율 차트 */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">추가</span>
                  <span className="text-sm font-semibold">{stats.additionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.additionRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">삭제</span>
                  <span className="text-sm font-semibold">{stats.removalRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${stats.removalRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">수정</span>
                  <span className="text-sm font-semibold">{stats.modificationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${stats.modificationRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 변경사항 목록 */}
        {diff && diff.changes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>변경사항 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                {diff.changes.slice(0, 50).map((change, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg ${getChangeColor(change.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getChangeIcon(change.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={change.type === 'added' ? 'success' : change.type === 'removed' ? 'error' : 'warning'} size="sm">
                            {change.type}
                          </Badge>
                          {change.line && (
                            <span className="text-xs text-gray-500">라인 {change.line}</span>
                          )}
                        </div>
                        {change.oldValue && (
                          <div className="text-xs mb-1">
                            <span className="font-semibold">이전:</span>{' '}
                            <code className="bg-black/10 px-1 rounded">{change.oldValue}</code>
                          </div>
                        )}
                        {change.newValue && (
                          <div className="text-xs">
                            <span className="font-semibold">이후:</span>{' '}
                            <code className="bg-black/10 px-1 rounded">{change.newValue}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {diff.changes.length > 50 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    ... 및 {diff.changes.length - 50}개 더
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

