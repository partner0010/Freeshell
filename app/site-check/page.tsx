'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, Loader2, Globe, Shield, Zap, FileText, Lock, Code, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface CheckResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

interface SiteAnalysisResult {
  timestamp: string;
  url: string;
  checks: CheckResult[];
  vulnerabilities: Array<{
    severity: 'high' | 'medium' | 'low';
    type: string;
    description: string;
    exploitation?: string;
    recommendation: string;
  }>;
  modules: Array<{
    name: string;
    detected: boolean;
  }>;
  structure: {
    framework?: string;
    architecture?: string;
    technologies?: string[];
  };
  performance: {
    score?: number;
    issues?: string[];
    optimizations?: string[];
  };
  securityScore: number;
}

export default function SiteCheckPage() {
  const [url, setUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<SiteAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSiteCheck = async () => {
    if (!url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }

    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/site-check/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '검사 실패');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || '검사 중 오류가 발생했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-900/30';
      case 'error':
        return 'border-red-500 bg-red-900/30';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/30';
      default:
        return 'border-gray-600 bg-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-300 bg-red-900/30 border-red-500';
      case 'medium':
        return 'text-yellow-300 bg-yellow-900/30 border-yellow-500';
      case 'low':
        return 'text-blue-300 bg-blue-900/30 border-blue-500';
      default:
        return 'text-gray-300 bg-gray-800 border-gray-600';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              사이트 검사 & 모의해킹
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              웹사이트 URL을 분석하여 사이트 구성, 모듈, 보안 취약점, 모의해킹 시나리오를 검사합니다
            </p>
          </div>

          {/* URL 입력 영역 */}
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                분석할 웹사이트 URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 bg-gray-900 text-white border-2 border-gray-600 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={runSiteCheck}
                  disabled={isChecking || !url.trim()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>검사 중...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>검사 시작</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-xl p-4 mb-8">
              <p className="text-red-300 font-semibold">{error}</p>
            </div>
          )}

          {/* 검사 결과 */}
          {result && (
            <div className="space-y-6">
              {/* 보안 점수 */}
              <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">보안 점수</h2>
                  <div className={`text-5xl font-bold ${getSecurityScoreColor(result.securityScore)}`}>
                    {result.securityScore}/100
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      result.securityScore >= 80 ? 'bg-green-500' :
                      result.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.securityScore}%` }}
                  />
                </div>
              </div>

              {/* 검사 결과 */}
              {result.checks.length > 0 && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    검사 결과
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.checks.map((check, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-2 ${getStatusColor(check.status)} flex items-start gap-3`}
                      >
                        {getStatusIcon(check.status)}
                        <div className="flex-1">
                          <div className="font-semibold mb-1 text-white">{check.name}</div>
                          <div className="text-sm text-gray-300">{check.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 사이트 구조 */}
              {result.structure && Object.keys(result.structure).length > 0 && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Code className="w-6 h-6 text-blue-500" />
                    사이트 구조 분석
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.structure.framework && (
                      <div className="p-4 bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">프레임워크</p>
                        <p className="text-lg font-semibold text-white">{result.structure.framework}</p>
                      </div>
                    )}
                    {result.structure.architecture && (
                      <div className="p-4 bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">아키텍처</p>
                        <p className="text-lg font-semibold text-white">{result.structure.architecture}</p>
                      </div>
                    )}
                    {result.structure.technologies && result.structure.technologies.length > 0 && (
                      <div className="md:col-span-2 p-4 bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">기술 스택</p>
                        <div className="flex flex-wrap gap-2">
                          {result.structure.technologies.map((tech, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 감지된 모듈 */}
              {result.modules.length > 0 && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-purple-500" />
                    감지된 모듈 및 라이브러리
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.modules.map((module, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-900 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-white">{module.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 취약점 및 모의해킹 */}
              {result.vulnerabilities.length > 0 && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-500" />
                    발견된 취약점 및 모의해킹 시나리오 ({result.vulnerabilities.length}개)
                  </h2>
                  <div className="space-y-4">
                    {result.vulnerabilities.map((vuln, index) => (
                      <div
                        key={index}
                        className={`p-6 rounded-xl border-2 ${getSeverityColor(vuln.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/20">
                                {vuln.severity}
                              </span>
                              <span className="font-semibold text-white">{vuln.type}</span>
                            </div>
                            <p className="text-gray-200 mb-2">{vuln.description}</p>
                            {vuln.exploitation && (
                              <div className="mt-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                                <p className="text-sm font-semibold text-red-300 mb-1">모의해킹 방법:</p>
                                <p className="text-sm text-gray-300">{vuln.exploitation}</p>
                              </div>
                            )}
                            <div className="mt-3 p-3 bg-white/10 rounded-lg">
                              <p className="text-sm font-semibold text-white mb-1">권장 조치:</p>
                              <p className="text-sm text-gray-300">{vuln.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 성능 분석 */}
              {result.performance && Object.keys(result.performance).length > 0 && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    성능 분석
                  </h2>
                  {result.performance.score !== undefined && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">성능 점수</span>
                        <span className="text-2xl font-bold text-white">{result.performance.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            result.performance.score >= 80 ? 'bg-green-500' :
                            result.performance.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${result.performance.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {result.performance.issues && result.performance.issues.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-3">성능 문제</h3>
                      <ul className="space-y-2">
                        {result.performance.issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.performance.optimizations && result.performance.optimizations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">최적화 제안</h3>
                      <ul className="space-y-2">
                        {result.performance.optimizations.map((opt, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 리포트 다운로드 */}
              <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
                <button
                  onClick={() => {
                    const report = JSON.stringify(result, null, 2);
                    const blob = new Blob([report], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `site-analysis-${new Date().getTime()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>분석 리포트 다운로드</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
