'use client';

import React, { useState } from 'react';
import { Shield, Play, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { enhancedPenetrationTester, type PenetrationTestResult, type SecurityVulnerability } from '@/lib/security/penetration-testing-enhanced';
import { useToast } from '@/components/ui/Toast';

export function EnhancedPenetrationTestPanel() {
  const [testResults, setTestResults] = useState<PenetrationTestResult[]>([]);
  const [currentResult, setCurrentResult] = useState<PenetrationTestResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [codeToScan, setCodeToScan] = useState('');
  const { showToast } = useToast();

  const handleFullScan = async () => {
    setIsScanning(true);
    try {
      const result = await enhancedPenetrationTester.performFullScan(codeToScan || 'sample code');
      setTestResults([...testResults, result]);
      setCurrentResult(result);
      
      if (result.status === 'passed') {
        showToast({ type: 'success', message: `보안 스캔 통과! 점수: ${result.score}/100` });
      } else if (result.status === 'warning') {
        showToast({ type: 'warning', message: `경고 발견. 점수: ${result.score}/100` });
      } else {
        showToast({ type: 'error', message: `심각한 취약점 발견. 점수: ${result.score}/100` });
      }
    } catch (error) {
      showToast({ type: 'error', message: '보안 스캔 중 오류가 발생했습니다' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleQuickScan = async () => {
    setIsScanning(true);
    try {
      // 빠른 스캔 (일부 검사만)
      const xssIssues = await enhancedPenetrationTester.testXSS(codeToScan || 'sample code');
      const authIssues = await enhancedPenetrationTester.testAuthentication(codeToScan || 'sample code');
      
      const allIssues = [...xssIssues, ...authIssues];
      const score = allIssues.length === 0 ? 100 : Math.max(0, 100 - allIssues.length * 15);
      
      const result: PenetrationTestResult = {
        id: `quick-${Date.now()}`,
        testName: 'Quick Security Scan',
        status: score >= 80 ? 'passed' : score >= 60 ? 'warning' : 'failed',
        vulnerabilities: allIssues,
        score,
        timestamp: new Date(),
        duration: 0.5,
      };

      setTestResults([...testResults, result]);
      setCurrentResult(result);
      showToast({ type: 'success', message: `빠른 스캔 완료. 점수: ${result.score}/100` });
    } catch (error) {
      showToast({ type: 'error', message: '빠른 스캔 중 오류가 발생했습니다' });
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: SecurityVulnerability['severity']) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">강화된 모의해킹 & 보안 스캔</h2>
            <p className="text-sm text-gray-500">OWASP Top 10 기반 취약점 검사</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>보안 스캔 실행</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <textarea
                value={codeToScan}
                onChange={(e) => setCodeToScan(e.target.value)}
                placeholder="검사할 코드를 입력하세요 (빈 값이면 샘플 코드로 검사됩니다)..."
                className="w-full p-3 border rounded-lg min-h-[150px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleQuickScan} disabled={isScanning}>
                  <Play size={18} className="mr-2" />
                  빠른 스캔
                </Button>
                <Button variant="primary" onClick={handleFullScan} disabled={isScanning}>
                  <Shield size={18} className="mr-2" />
                  {isScanning ? '스캔 중...' : '전체 스캔'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OWASP Top 10 체크리스트 */}
        <Card>
          <CardHeader>
            <CardTitle>OWASP Top 10 체크리스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(enhancedPenetrationTester.getOWASPChecklist()).map(([item, checked]) => (
                <div key={item} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {checked ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 스캔 결과 */}
        {currentResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{currentResult.testName}</CardTitle>
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${getScoreColor(currentResult.score)}`}>
                    {currentResult.score}/100
                  </div>
                  {currentResult.status === 'passed' ? (
                    <Badge variant="success">
                      <CheckCircle size={14} className="mr-1" />
                      통과
                    </Badge>
                  ) : currentResult.status === 'warning' ? (
                    <Badge variant="warning">
                      <AlertTriangle size={14} className="mr-1" />
                      경고
                    </Badge>
                  ) : (
                    <Badge variant="error">
                      <XCircle size={14} className="mr-1" />
                      실패
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                검사 시간: {new Date(currentResult.timestamp).toLocaleString()} · 
                소요 시간: {currentResult.duration.toFixed(2)}초 · 
                취약점: {currentResult.vulnerabilities.length}개
              </div>
            </CardHeader>
            <CardContent>
              {currentResult.vulnerabilities.length === 0 ? (
                <div className="text-center py-8 text-green-600">
                  <CheckCircle size={48} className="mx-auto mb-2" />
                  <p className="font-semibold">취약점이 발견되지 않았습니다!</p>
                  <p className="text-sm text-gray-500 mt-1">코드가 보안 모범 사례를 따르고 있습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-orange-500" size={20} />
                    <h4 className="font-semibold text-gray-800">
                      발견된 취약점 ({currentResult.vulnerabilities.length}개)
                    </h4>
                  </div>
                  {currentResult.vulnerabilities.map((vuln) => (
                    <div
                      key={vuln.id}
                      className={`border-2 rounded-lg p-4 ${getSeverityColor(vuln.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(vuln.severity)}>
                            {vuln.severity.toUpperCase()}
                          </Badge>
                          <span className="font-semibold">{vuln.title}</span>
                        </div>
                        {vuln.cvss && (
                          <Badge variant="outline">CVSS: {vuln.cvss}</Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{vuln.description}</p>
                      {vuln.affectedComponent && (
                        <p className="text-xs mb-2">
                          <strong>영향 컴포넌트:</strong> {vuln.affectedComponent}
                        </p>
                      )}
                      {vuln.cwe && (
                        <p className="text-xs mb-2">
                          <strong>CWE:</strong> {vuln.cwe}
                        </p>
                      )}
                      <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-blue-800 mb-1">💡 권장 사항</p>
                        <p className="text-sm text-blue-700">{vuln.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 이전 스캔 결과 목록 */}
        {testResults.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>이전 스캔 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResults.slice(0, -1).reverse().map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => setCurrentResult(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{result.testName}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getScoreColor(result.score)}`}>
                          {result.score}
                        </span>
                        <Badge variant={result.status === 'passed' ? 'success' : result.status === 'warning' ? 'warning' : 'error'}>
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

