'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Key, Server, Zap, Info, Loader2, Globe, Code, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface APIKeyStatus {
  configured: boolean;
  hasValue: boolean;
  prefix: string;
  valid: boolean;
  message: string;
}

interface ServiceStatus {
  name: string;
  required: string;
  status: string;
  fallback: string;
  description: string;
}

interface DiagnosticsData {
  timestamp: string;
  environment: {
    nodeEnv: string;
    isProduction: boolean;
    platform?: string;
  };
  apiKeys: {
    google: APIKeyStatus;
    pexels: APIKeyStatus;
    unsplash: APIKeyStatus;
    pixabay: APIKeyStatus;
  };
  services: {
    search: ServiceStatus;
    spark: ServiceStatus;
    translate: ServiceStatus;
    research: ServiceStatus;
    webSearch: ServiceStatus;
    imageSearch: ServiceStatus;
  };
  recommendations: {
    critical: string[];
    important: string[];
    optional: string[];
  };
}

export default function DiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: DiagnosticsData = await response.json();
      setData(result);
    } catch (e: any) {
      setError(`진단 정보를 가져오는 데 실패했습니다: ${e.message}`);
      console.error('Failed to fetch diagnostics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runApiTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/test-api');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setTestResult(result);
    } catch (e: any) {
      setTestResult({
        error: `API 테스트 실패: ${e.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === '✅ 사용 가능' || status === '✅ 항상 사용 가능') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status.includes('❌') || status.includes('오류')) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getApiKeyIcon = (valid: boolean) => {
    return valid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 text-gray-900 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-800">진단 정보를 불러오는 중...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 text-gray-900 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="text-center bg-red-50 rounded-lg p-8 border-2 border-red-300 max-w-md">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h1 className="text-2xl font-bold mb-4 text-red-800">오류 발생</h1>
            <p className="text-lg font-medium text-red-700 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mx-auto font-semibold"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              다시 시도
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 text-gray-900 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="text-center bg-yellow-50 rounded-lg p-8 border-2 border-yellow-300 max-w-md">
            <Info className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
            <h1 className="text-2xl font-bold mb-4 text-yellow-800">진단 정보 없음</h1>
            <p className="text-lg font-medium text-yellow-700 mb-6">진단 정보를 불러올 수 없습니다.</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center mx-auto font-semibold"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              다시 시도
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        {/* 빠른 액션 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/diagnostics/analyze"
            className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 hover:border-blue-400 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  보안 분석 도구
                </h3>
                <p className="text-sm text-gray-600">URL 또는 코드 보안 분석</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              웹사이트 URL이나 코드를 분석하여 보안 취약점, API 키 노출, 코드 품질을 검사합니다.
            </p>
          </Link>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">시스템 상태</h3>
                <p className="text-sm text-gray-600">현재 시스템 상태 확인</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              API 키 상태 및 서비스 가용성을 확인합니다.
            </p>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI 서비스 진단 (무료 API만)
        </h1>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-gray-900">
            <Server className="w-7 h-7 text-blue-600" />
            <span>환경 및 API 키 상태</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">환경 정보</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Node 환경:</span>
                  <span className="text-blue-700 font-medium">{data.environment.nodeEnv}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">프로덕션 모드:</span>
                  <span className={`font-medium ${data.environment.isProduction ? 'text-green-700' : 'text-yellow-700'}`}>
                    {data.environment.isProduction ? '예' : '아니오'}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">플랫폼:</span>
                  <span className="text-purple-700 font-medium">{data.environment.platform || '로컬'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">진단 시간:</span>
                  <span className="text-gray-700 font-medium">{new Date(data.timestamp).toLocaleString()}</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">API 키 설정 (무료 API만)</h3>
              <ul className="space-y-3">
                {Object.entries(data.apiKeys).map(([key, status]) => (
                  <li key={key} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    {getApiKeyIcon(status.valid)}
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 uppercase">{key}:</span>
                      <span className={`ml-2 font-medium ${
                        status.valid 
                          ? 'text-green-700' 
                          : status.configured 
                            ? 'text-yellow-700' 
                            : 'text-red-700'
                      }`}>
                        {status.message}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-gray-900">
            <Zap className="w-7 h-7 text-purple-600" />
            <span>AI 서비스 상태</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(data.services).map(([key, service]) => {
              const isAvailable = service.status === '✅ 사용 가능' || service.status === '✅ 항상 사용 가능';
              return (
                <div key={key} className={`rounded-lg p-5 border-2 ${
                  isAvailable 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(service.status)}
                    <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 font-medium">{service.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs">
                      <span className="font-bold text-gray-800">필수:</span>
                      <span className={`ml-2 font-medium ${
                        service.required === '없음 (완전 무료)' 
                          ? 'text-green-700' 
                          : 'text-blue-700'
                      }`}>
                        {service.required}
                      </span>
                    </p>
                    {!isAvailable && (
                      <p className="text-xs">
                        <span className="font-bold text-gray-800">폴백:</span>
                        <span className="ml-2 text-yellow-700 font-medium">{service.fallback}</span>
                      </p>
                    )}
                    <p className={`text-sm font-semibold mt-2 ${
                      isAvailable ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {service.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 실제 API 테스트 섹션 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-gray-900">
            <Zap className="w-7 h-7 text-blue-600" />
            <span>실제 API 동작 테스트</span>
          </h2>
          <p className="text-gray-700 mb-4 font-medium">
            실제로 Google Gemini API가 작동하는지 테스트합니다. 이 테스트는 실제 API를 호출하여 응답을 확인합니다.
          </p>
          <button
            onClick={runApiTest}
            disabled={isTesting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>테스트 중...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                <span>API 테스트 실행</span>
              </>
            )}
          </button>

          {testResult && (
            <div className="mt-6 space-y-4">
              {testResult.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-semibold">{testResult.error}</p>
                </div>
              ) : (
                <>
                  <div className={`p-4 rounded-lg border-2 ${
                    testResult.summary.criticalService.includes('✅')
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      {testResult.summary.criticalService}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <span className="text-sm text-gray-600">총 테스트:</span>
                        <span className="ml-2 font-bold text-gray-900">{testResult.summary.totalTests}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">성공:</span>
                        <span className="ml-2 font-bold text-green-700">{testResult.summary.successfulTests}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">실제 API 호출:</span>
                        <span className="ml-2 font-bold text-blue-700">{testResult.summary.realApiCalls}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">API 키 설정:</span>
                        <span className="ml-2 font-bold text-purple-700">{testResult.summary.hasApiKeys}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">테스트 결과 상세:</h4>
                    {testResult.testResults.map((test: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          test.success && test.realApiCall
                            ? 'bg-green-50 border-green-200'
                            : test.hasApiKey
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-900">{test.service}</h5>
                          <div className="flex items-center gap-2">
                            {test.success && test.realApiCall ? (
                              <span className="text-green-600 font-semibold">✅ 실제 API 작동</span>
                            ) : test.hasApiKey ? (
                              <span className="text-yellow-600 font-semibold">⚠️ API 키 있음</span>
                            ) : (
                              <span className="text-red-600 font-semibold">❌ API 키 없음</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-semibold text-gray-700">API 키:</span>
                            <span className="ml-2 text-gray-600">{test.apiKeyPrefix}</span>
                          </p>
                          {test.realApiCall && (
                            <p>
                              <span className="font-semibold text-gray-700">응답 시간:</span>
                              <span className="ml-2 text-blue-600">{test.responseTime}ms</span>
                            </p>
                          )}
                          {test.error && (
                            <p className="text-red-600 font-medium">{test.error}</p>
                          )}
                          {test.response && (
                            <p className="text-gray-600 mt-2">
                              <span className="font-semibold">응답:</span> {test.response}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {testResult.recommendations && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">권장 사항:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                        {(testResult.recommendations.ifGoogleWorks || []).map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                        {(testResult.recommendations.ifGoogleFails || []).map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {data.recommendations.critical.length > 0 || data.recommendations.important.length > 0 ? (
          <div className="bg-red-50 rounded-lg shadow-md p-8 mb-8 border-2 border-red-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3 text-red-700">
              <AlertCircle className="w-7 h-7" />
              <span>권장 사항</span>
            </h2>
            <ul className="space-y-4">
              {data.recommendations.critical.map((rec, index) => (
                <li key={`critical-${index}`} className="flex items-start space-x-3 p-4 bg-red-100 rounded-lg border border-red-300">
                  <XCircle className="w-6 h-6 flex-shrink-0 mt-1 text-red-600" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900 mb-2">필수: {rec}</p>
                    <p className="text-sm font-medium text-red-700">
                      이 문제를 해결하지 않으면 일부 AI 기능이 제대로 작동하지 않습니다.
                    </p>
                  </div>
                </li>
              ))}
              {data.recommendations.important.map((rec, index) => (
                <li key={`important-${index}`} className="flex items-start space-x-3 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-bold text-yellow-900 mb-2">중요: {rec}</p>
                    <p className="text-sm font-medium text-yellow-800">
                      이 문제를 해결하면 더 많은 기능을 활용할 수 있습니다.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg shadow-md p-8 mb-8 border-2 border-green-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3 text-green-700">
              <CheckCircle className="w-7 h-7" />
              <span>모든 무료 AI 서비스 정상 작동</span>
            </h2>
            <p className="text-green-800 font-semibold text-lg">
              모든 무료 AI 서비스가 정상적으로 작동하고 있습니다.
            </p>
          </div>
        )}

        {data.recommendations.optional.length > 0 && (
          <div className="bg-blue-50 rounded-lg shadow-md p-8 mb-8 border-2 border-blue-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3 text-blue-700">
              <Info className="w-7 h-7" />
              <span>선택 사항</span>
            </h2>
            <ul className="space-y-3">
              {data.recommendations.optional.map((rec, index) => (
                <li key={`optional-${index}`} className="flex items-start space-x-3 p-3 bg-blue-100 rounded-lg border border-blue-300">
                  <Info className="w-5 h-5 flex-shrink-0 mt-1 text-blue-600" />
                  <p className="text-blue-900 font-medium">{rec}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={fetchData}
            className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-lg font-semibold flex items-center justify-center mx-auto"
          >
            <RefreshCw className="w-6 h-6 mr-3" />
            <span>상태 새로고침</span>
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
