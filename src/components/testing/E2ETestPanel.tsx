'use client';

import React, { useState } from 'react';
import { TestTube, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { e2eTestRunner, type E2ETest } from '@/lib/testing/e2e-test-runner';
import { useToast } from '@/components/ui/Toast';

export function E2ETestPanel() {
  const [tests, setTests] = useState<E2ETest[]>([]);
  const [selectedTest, setSelectedTest] = useState<E2ETest | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    // 샘플 테스트 생성
    const sampleTest = e2eTestRunner.createTest('로그인 플로우 테스트', [
      { action: 'navigate', target: '/login', expected: 'Login page loaded' },
      { action: 'fill', target: '#email', value: 'test@example.com', expected: 'Email field filled' },
      { action: 'fill', target: '#password', value: 'password123', expected: 'Password field filled' },
      { action: 'click', target: '#login-button', expected: 'Login button clicked' },
      { action: 'wait', target: 'navigation', expected: 'Redirected to dashboard' },
    ]);
    setTests([sampleTest]);
  }, []);

  const handleRunTest = async (testId: string) => {
    setIsRunning(true);
    try {
      const result = await e2eTestRunner.runTest(testId);
      setTests(e2eTestRunner.getAllTests());
      setSelectedTest(result);
      
      if (result.status === 'passed') {
        showToast({ type: 'success', message: '테스트 통과!' });
      } else {
        showToast({ type: 'error', message: '테스트 실패' });
      }
    } catch (error) {
      showToast({ type: 'error', message: '테스트 실행 중 오류 발생' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsRunning(true);
    try {
      const results = await e2eTestRunner.runAllTests();
      setTests(results);
      const passedCount = results.filter(r => r.status === 'passed').length;
      showToast({ type: 'success', message: `${passedCount}/${results.length} 테스트 통과` });
    } catch (error) {
      showToast({ type: 'error', message: '테스트 실행 중 오류 발생' });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: E2ETest['status']) => {
    const colors = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
      skipped: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status];
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <TestTube className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">E2E 테스트</h2>
            <p className="text-sm text-gray-500">End-to-End 테스트 실행 및 관리</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>테스트 목록</CardTitle>
              <Button variant="primary" onClick={handleRunAllTests} disabled={isRunning}>
                <Play size={18} className="mr-2" />
                {isRunning ? '실행 중...' : '전체 실행'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                테스트가 없습니다
              </div>
            ) : (
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{test.name}</h4>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                        {test.description && (
                          <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>스텝: {test.steps.length}개</span>
                          {test.duration && (
                            <span>소요 시간: {test.duration.toFixed(2)}초</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunTest(test.id);
                        }}
                        disabled={isRunning}
                      >
                        <Play size={14} className="mr-1" />
                        실행
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTest && (
          <Card>
            <CardHeader>
              <CardTitle>테스트 상세: {selectedTest.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedTest.steps.map((step, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Step {index + 1}</span>
                        <Badge className={getStatusColor(step.status)} size="sm">
                          {step.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Action:</strong> {step.action}</p>
                      {step.target && <p><strong>Target:</strong> {step.target}</p>}
                      {step.value && <p><strong>Value:</strong> {step.value}</p>}
                      {step.expected && (
                        <p><strong>Expected:</strong> <span className="text-green-600">{step.expected}</span></p>
                      )}
                      {step.actual && (
                        <p><strong>Actual:</strong> <span className={step.status === 'passed' ? 'text-green-600' : 'text-red-600'}>{step.actual}</span></p>
                      )}
                    </div>
                  </div>
                ))}
                {selectedTest.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">에러:</p>
                    <p className="text-sm text-red-600">{selectedTest.error}</p>
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

