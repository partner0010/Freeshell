'use client';

import { useState } from 'react';
import { Bug, Code, Upload, Download, Zap, AlertTriangle, CheckCircle, XCircle, Loader2, FileCode, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminAccessGuard from '@/components/AdminAccessGuard';

interface DebugResult {
  timestamp: string;
  type: string;
  issues: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    fix: string;
    occurrences?: number;
  }>;
  optimizations: Array<{
    type: string;
    description: string;
    fix: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  suggestions: Array<{
    type: string;
    description: string;
  }>;
  codeQuality: {
    score: number;
    maintainability: string;
    complexity: string;
    readability: string;
  };
}

function DebugContent() {
  const [code, setCode] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  const runAnalysis = async () => {
    if (!code.trim()) {
      setError('코드를 입력하거나 파일을 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/debug/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 실패');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Bug className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              디버그 도구 & 코드 분석
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              코드를 분석하여 버그, 성능 문제, 최적화 기회를 찾아드립니다
            </p>
          </div>

          {/* 코드 입력 영역 */}
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                분석할 코드
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="코드를 붙여넣거나 파일을 업로드하세요..."
                rows={15}
                className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <Upload className="w-5 h-5 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">파일 업로드</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json"
                  className="hidden"
                />
              </label>
              {uploadedFile && (
                <span className="text-sm text-gray-400">
                  {uploadedFile.name}
                </span>
              )}
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing || !code.trim()}
                className="ml-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>분석 중...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>분석 시작</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-xl p-4 mb-8">
              <p className="text-red-300 font-semibold">{error}</p>
            </div>
          )}

          {/* 분석 결과 */}
          {result && (
            <div className="space-y-6">
              {/* 코드 품질 점수 */}
              <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">코드 품질 점수</h2>
                  <div className={`text-5xl font-bold ${getQualityColor(result.codeQuality.score)}`}>
                    {result.codeQuality.score}/100
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      result.codeQuality.score >= 80 ? 'bg-green-500' :
                      result.codeQuality.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.codeQuality.score}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">유지보수성</p>
                    <p className="text-lg font-semibold text-white capitalize">{result.codeQuality.maintainability}</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">복잡도</p>
                    <p className="text-lg font-semibold text-white capitalize">{result.codeQuality.complexity}</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">가독성</p>
                    <p className="text-lg font-semibold text-white capitalize">{result.codeQuality.readability}</p>
                  </div>
                </div>
              </div>

              {/* 발견된 문제 */}
              {result.issues.length > 0 && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    발견된 문제 ({result.issues.length}개)
                  </h2>
                  <div className="space-y-4">
                    {result.issues.map((issue, index) => (
                      <div
                        key={index}
                        className={`p-6 rounded-xl border-2 ${getSeverityColor(issue.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/20">
                                {issue.severity}
                              </span>
                              <span className="font-semibold text-white">{issue.type}</span>
                              {issue.occurrences && (
                                <span className="text-sm text-gray-400">({issue.occurrences}회 발견)</span>
                              )}
                            </div>
                            <p className="text-gray-200 mb-2">{issue.description}</p>
                            <div className="mt-3 p-3 bg-white/10 rounded-lg">
                              <p className="text-sm font-semibold text-white mb-1">수정 방법:</p>
                              <p className="text-sm text-gray-300">{issue.fix}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 최적화 제안 */}
              {result.optimizations.length > 0 && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    성능 최적화 제안 ({result.optimizations.length}개)
                  </h2>
                  <div className="space-y-4">
                    {result.optimizations.map((opt, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-gray-600 bg-gray-900"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-semibold text-white">{opt.type}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            opt.impact === 'high' ? 'bg-red-500/20 text-red-300' :
                            opt.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {opt.impact} impact
                          </span>
                        </div>
                        <p className="text-gray-300 mb-2">{opt.description}</p>
                        <div className="mt-2 p-2 bg-gray-800 rounded">
                          <p className="text-sm text-gray-400">{opt.fix}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 제안 사항 */}
              {result.suggestions.length > 0 && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    개선 제안 ({result.suggestions.length}개)
                  </h2>
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-gray-600 bg-gray-900"
                      >
                        <p className="font-semibold text-white mb-1">{suggestion.type}</p>
                        <p className="text-gray-300">{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
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
                    a.download = `debug-analysis-${new Date().getTime()}.json`;
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

export default function DebugPage() {
  return (
    <AdminAccessGuard
      toolId="debugTools"
      toolName="디버그 도구"
      requiredPlan="pro"
    >
      <DebugContent />
    </AdminAccessGuard>
  );
}
