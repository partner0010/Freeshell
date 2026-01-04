'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Key, Server, Zap, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    openai: APIKeyStatus;
    anthropic: APIKeyStatus;
    google: APIKeyStatus;
  };
  services: {
    search: ServiceStatus;
    spark: ServiceStatus;
    translate: ServiceStatus;
    imageGeneration: ServiceStatus;
    research: ServiceStatus;
    aiModels: ServiceStatus;
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

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error('상태 확인 실패');
      }
      const statusData = await response.json();
      setData(statusData);
    } catch (err) {
      setError('상태 정보를 가져올 수 없습니다.');
      console.error('Diagnostics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status.includes('❌')) return <XCircle className="w-5 h-5 text-red-500" />;
    if (status.includes('⚠️')) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status.includes('✅')) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (status.includes('❌')) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (status.includes('⚠️')) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    return 'border-gray-300 dark:border-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                <Server className="w-10 h-10 text-primary" />
                AI 서비스 진단
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                현재 AI 서비스 연결 상태와 필요한 설정을 확인합니다.
              </p>
            </div>
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>

          {isLoading && !data && (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">상태를 확인하는 중...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {data && (
            <>
              {/* 환경 정보 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" />
                  환경 정보
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">환경</div>
                    <div className="font-semibold">{data.environment.nodeEnv}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">플랫폼</div>
                    <div className="font-semibold">{data.environment.platform || '로컬/기타'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">확인 시간</div>
                    <div className="font-semibold text-sm">
                      {new Date(data.timestamp).toLocaleString('ko-KR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* API 키 상태 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Key className="w-6 h-6 text-primary" />
                  API 키 상태
                </h2>
                <div className="space-y-4">
                  {Object.entries(data.apiKeys).map(([key, status]) => (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 ${getStatusColor(status.message)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(status.message)}
                          <div>
                            <div className="font-semibold uppercase">{key}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {status.prefix}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{status.message}</div>
                          {status.configured && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {status.valid ? '유효한 형식' : '형식 확인 필요'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 서비스 상태 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h2 className="text-2xl font-bold mb-4">서비스 상태</h2>
                <div className="space-y-4">
                  {Object.entries(data.services).map(([key, service]) => (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 ${getStatusColor(service.status)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(service.status)}
                            <h3 className="font-semibold">{service.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {service.description}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <div>필수: {service.required}</div>
                            <div>폴백: {service.fallback}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{service.status}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 권장사항 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4">권장사항</h2>
                
                {data.recommendations.critical.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                      🔴 중요 (즉시 조치 필요)
                    </h3>
                    <ul className="space-y-2">
                      {data.recommendations.critical.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-red-700 dark:text-red-400">
                          <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.recommendations.important.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                      🟡 중요 (권장)
                    </h3>
                    <ul className="space-y-2">
                      {data.recommendations.important.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-yellow-700 dark:text-yellow-400">
                          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.recommendations.optional.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      🔵 선택사항
                    </h3>
                    <ul className="space-y-2">
                      {data.recommendations.optional.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-blue-700 dark:text-blue-400">
                          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.recommendations.critical.length === 0 &&
                  data.recommendations.important.length === 0 &&
                  data.recommendations.optional.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p>모든 설정이 완료되었습니다! 🎉</p>
                    </div>
                  )}
              </div>

              {/* 설정 가이드 */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
                  📖 설정 가이드
                </h3>
                <div className="space-y-4 text-blue-800 dark:text-blue-200">
                  <div>
                    <h4 className="font-semibold mb-2">Netlify 환경 변수 설정:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Netlify 대시보드 접속: https://app.netlify.com</li>
                      <li>사이트 선택 (freeshell.co.kr)</li>
                      <li>Site settings → Environment variables</li>
                      <li>Add a variable 클릭</li>
                      <li>Key: OPENAI_API_KEY, Value: sk-your-key-here</li>
                      <li>Save 클릭</li>
                      <li>Deploys 탭 → Trigger deploy</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">로컬 개발 환경:</h4>
                    <p className="text-sm">
                      프로젝트 루트에 <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">.env.local</code> 파일을 생성하고
                      <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">OPENAI_API_KEY=sk-your-key-here</code>를 추가하세요.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

