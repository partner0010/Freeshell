/**
 * 테스트 러너 컴포넌트
 * 자동 생성된 테스트 실행 및 결과 표시
 */
'use client';

import { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileCode,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { generateTests, runTests, calculateCoverage, type TestSuite } from '@/lib/testing/auto-test';
import EnhancedButton from './EnhancedButton';
import EnhancedCard from './EnhancedCard';

interface TestRunnerProps {
  files: Array<{ name: string; type: string; content: string }>;
}

export default function TestRunner({ files }: TestRunnerProps) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [coverage, setCoverage] = useState<number | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const suites = generateTests(files);
      setTestSuites(suites);
      
      // 커버리지 계산
      const totalCoverage = suites.reduce((sum, suite) => {
        const file = files.find(f => f.name === suite.name.replace(' 테스트', ''));
        if (file) {
          return sum + calculateCoverage(file.content, suite.tests);
        }
        return sum;
      }, 0) / suites.length;
      
      setCoverage(totalCoverage);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRun = async () => {
    setIsRunning(true);
    const allTests = testSuites.flatMap(suite => suite.tests);
    const updatedTests = await runTests(allTests);
    
    // 테스트 결과 업데이트
    const updatedSuites = testSuites.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => {
        const updated = updatedTests.find(t => t.id === test.id);
        return updated || test;
      }),
    }));
    
    setTestSuites(updatedSuites);
    setIsRunning(false);
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
  const passedTests = testSuites.reduce(
    (sum, suite) => sum + suite.tests.filter(t => t.status === 'passed').length,
    0
  );
  const failedTests = testSuites.reduce(
    (sum, suite) => sum + suite.tests.filter(t => t.status === 'failed').length,
    0
  );

  return (
    <div className="w-full bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">테스트 자동화</h3>
          </div>
          <div className="flex items-center gap-2">
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              loading={isGenerating}
              icon={RefreshCw}
            >
              생성
            </EnhancedButton>
            <EnhancedButton
              variant="gradient"
              size="sm"
              onClick={handleRun}
              loading={isRunning}
              disabled={testSuites.length === 0}
              icon={Play}
            >
              실행
            </EnhancedButton>
          </div>
        </div>

        {/* 통계 */}
        {testSuites.length > 0 && (
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900">{totalTests}</div>
              <div className="text-gray-600">전체</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-700">{passedTests}</div>
              <div className="text-green-600">통과</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-semibold text-red-700">{failedTests}</div>
              <div className="text-red-600">실패</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-700">{coverage?.toFixed(0) || 0}%</div>
              <div className="text-blue-600">커버리지</div>
            </div>
          </div>
        )}
      </div>

      {/* 테스트 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {testSuites.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">테스트를 생성하세요</p>
            <p className="text-xs text-gray-400 mt-1">코드를 분석하여 자동으로 테스트를 생성합니다</p>
          </div>
        ) : (
          testSuites.map(suite => (
            <EnhancedCard key={suite.id} className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">{suite.name}</h4>
              <div className="space-y-2">
                {suite.tests.map(test => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {test.status === 'running' ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : test.status === 'passed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : test.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                      )}
                      <span className="text-sm text-gray-700 flex-1">{test.name}</span>
                    </div>
                    {test.result && (
                      <span className={`text-xs font-medium ${
                        test.result.passed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {test.result.duration.toFixed(0)}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </EnhancedCard>
          ))
        )}
      </div>
    </div>
  );
}
