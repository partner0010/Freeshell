'use client';

import React, { useState } from 'react';
import { TestTube, Plus, Play, Pause, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { abTester, type ABTest, type ABTestVariant } from '@/lib/ab-testing/ab-tester';
import { useToast } from '@/components/ui/Toast';

export function ABTestingPanel() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testName, setTestName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setTests(abTester.getAllTests());
  }, []);

  const handleCreateTest = () => {
    if (!testName.trim()) {
      showToast({ type: 'warning', message: '테스트 이름을 입력해주세요' });
      return;
    }

    const test = abTester.createTest(testName);
    setTests([...tests, test]);
    setSelectedTest(test);
    setTestName('');
    showToast({ type: 'success', message: 'A/B 테스트가 생성되었습니다' });
  };

  const handleAddVariant = () => {
    if (!selectedTest) return;

    abTester.addVariant(selectedTest.id, {
      name: `변형 ${selectedTest.variants.length + 1}`,
      description: '새 변형',
      changes: {},
      traffic: 50,
    });

    setTests(abTester.getAllTests());
    setSelectedTest(abTester.getTest(selectedTest.id) || null);
    showToast({ type: 'success', message: '변형이 추가되었습니다' });
  };

  const handleStartTest = () => {
    if (!selectedTest) return;

    abTester.startTest(selectedTest.id);
    setTests(abTester.getAllTests());
    setSelectedTest(abTester.getTest(selectedTest.id) || null);
    showToast({ type: 'success', message: '테스트가 시작되었습니다' });
  };

  const handlePauseTest = () => {
    if (!selectedTest) return;

    abTester.pauseTest(selectedTest.id);
    setTests(abTester.getAllTests());
    setSelectedTest(abTester.getTest(selectedTest.id) || null);
    showToast({ type: 'success', message: '테스트가 정지되었습니다' });
  };

  const stats = selectedTest ? abTester.calculateStats(selectedTest) : {};

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <TestTube className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">A/B 테스트</h2>
            <p className="text-sm text-gray-500">변형 테스트 및 전환율 분석</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 테스트 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 A/B 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="테스트 이름"
                className="flex-1"
              />
              <Button variant="primary" onClick={handleCreateTest}>
                <Plus size={18} className="mr-2" />
                생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 테스트 목록 */}
        {tests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>A/B 테스트 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTest?.id === test.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{test.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          변형: {test.variants.length}개
                        </p>
                      </div>
                      <Badge variant="outline">{test.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 테스트 상세 */}
        {selectedTest && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedTest.name}</CardTitle>
                  <div className="flex gap-2">
                    {selectedTest.status === 'draft' || selectedTest.status === 'paused' ? (
                      <Button variant="primary" size="sm" onClick={handleStartTest}>
                        <Play size={14} className="mr-1" />
                        시작
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={handlePauseTest}>
                        <Pause size={14} className="mr-1" />
                        정지
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" onClick={handleAddVariant}>
                    <Plus size={14} className="mr-1" />
                    변형 추가
                  </Button>
                  {selectedTest.variants.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      변형이 없습니다
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTest.variants.map((variant) => {
                        const variantStats = stats[variant.id] || {};
                        return (
                          <div key={variant.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">{variant.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{variant.description}</p>
                              </div>
                              <Badge variant="outline">트래픽: {variant.traffic}%</Badge>
                            </div>
                            {selectedTest.status === 'running' && variantStats.visitors && (
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500">방문자:</span>
                                  <span className="ml-2 font-semibold">{variantStats.visitors}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">전환:</span>
                                  <span className="ml-2 font-semibold">{variantStats.conversions}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">전환율:</span>
                                  <span className="ml-2 font-semibold text-green-600">
                                    {variantStats.conversionRate}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

