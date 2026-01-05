'use client';

import { useState } from 'react';
import { Activity, Globe, FileCode, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Download, Upload, Zap, Lock, Code, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AnalysisResult {
  type: 'url' | 'code';
  target: string;
  checks: Array<{
    name: string;
    status: 'success' | 'error' | 'warning';
    message: string;
  }>;
  vulnerabilities: Array<{
    severity: 'high' | 'medium' | 'low';
    type: string;
    description: string;
    recommendation?: string;
  }>;
  recommendations: Array<{
    type: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  securityScore: number;
  timestamp: string;
}

export default function SecurityAnalyzePage() {
  const [analysisType, setAnalysisType] = useState<'url' | 'code'>('url');
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
    if (analysisType === 'url' && !url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }
    if (analysisType === 'code' && !code.trim()) {
      setError('코드를 입력하거나 파일을 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/security/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: analysisType,
          target: analysisType === 'url' ? url : undefined,
          code: analysisType === 'code' ? code : undefined,
        }),
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

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              보안 분석 도구
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              URL 또는 코드를 분석하여 보안 취약점, API 키 노출, 코드 품질, 최적화 기회를 찾아드립니다
            </p>
          </div>

          {/* 분석 타입 선택 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setAnalysisType('url')}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                  analysisType === 'url'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span>URL 분석</span>
              </button>
              <button
                onClick={() => setAnalysisType('code')}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                  analysisType === 'code'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Code className="w-5 h-5" />
                <span>코드 분석</span>
              </button>
            </div>

            {/* URL 입력 */}
            {analysisType === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    분석할 웹사이트 URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
                    />
                    <button
                      onClick={runAnalysis}
                      disabled={isAnalyzing || !url.trim()}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              </div>
            )}

            {/* 코드 입력 */}
            {analysisType === 'code' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    분석할 코드
                  </label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="코드를 붙여넣거나 파일을 업로드하세요..."
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-sm text-gray-900"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">파일 업로드</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json"
                      className="hidden"
                    />
                  </label>
                  {uploadedFile && (
                    <span className="text-sm text-gray-600">
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
            )}
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {/* 분석 결과 */}
          {result && (
            <div className="space-y-6">
              {/* 보안 점수 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">보안 점수</h2>
                  <div className={`text-5xl font-bold ${getSecurityScoreColor(result.securityScore)}`}>
                    {result.securityScore}/100
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
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
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    검사 결과
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.checks.map((check, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-2 ${
                          check.status === 'success'
                            ? 'bg-green-50 border-green-200'
                            : check.status === 'error'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {check.status === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : check.status === 'error' ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          )}
                          <h3 className="font-semibold text-gray-900">{check.name}</h3>
                        </div>
                        <p className="text-sm text-gray-700">{check.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 취약점 */}
              {result.vulnerabilities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-600" />
                    발견된 취약점 ({result.vulnerabilities.length}개)
                  </h2>
                  <div className="space-y-4">
                    {result.vulnerabilities.map((vuln, index) => (
                      <div
                        key={index}
                        className={`p-6 rounded-xl border-2 ${getSeverityColor(vuln.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase">
                                {vuln.severity}
                              </span>
                              <span className="font-semibold text-gray-900">{vuln.type}</span>
                            </div>
                            <p className="text-gray-700 mb-2">{vuln.description}</p>
                            {vuln.recommendation && (
                              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-900 mb-1">권장 조치:</p>
                                <p className="text-sm text-gray-700">{vuln.recommendation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 최적화 제안 */}
              {result.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    최적화 제안 ({result.recommendations.length}개)
                  </h2>
                  <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-semibold text-gray-900">{rec.type}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            rec.impact === 'high' ? 'bg-red-100 text-red-700' :
                            rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {rec.impact} impact
                          </span>
                        </div>
                        <p className="text-gray-700">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 리포트 다운로드 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <button
                  onClick={() => {
                    const report = JSON.stringify(result, null, 2);
                    const blob = new Blob([report], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `security-analysis-${new Date().getTime()}.json`;
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

