'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Key, Server, Zap, Info, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="ml-4 text-lg">진단 정보를 불러오는 중...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="text-center text-red-500">
            <XCircle className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">오류 발생</h1>
            <p className="text-lg">{error}</p>
            <button
              onClick={fetchData}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center mx-auto"
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Info className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">진단 정보 없음</h1>
            <p className="text-lg">진단 정보를 불러올 수 없습니다.</p>
            <button
              onClick={fetchData}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center mx-auto"
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8 text-center">AI 서비스 진단 (무료 API만)</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3">
            <Server className="w-7 h-7 text-blue-500" />
            <span>환경 및 API 키 상태</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-3">환경 정보</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li><span className="font-semibold">Node 환경:</span> {data.environment.nodeEnv}</li>
                <li><span className="font-semibold">프로덕션 모드:</span> {data.environment.isProduction ? '예' : '아니오'}</li>
                <li><span className="font-semibold">플랫폼:</span> {data.environment.platform || '로컬'}</li>
                <li><span className="font-semibold">진단 시간:</span> {new Date(data.timestamp).toLocaleString()}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-3">API 키 설정 (무료 API만)</h3>
              <ul className="space-y-3">
                {Object.entries(data.apiKeys).map(([key, status]) => (
                  <li key={key} className="flex items-center space-x-3">
                    {getApiKeyIcon(status.valid)}
                    <div>
                      <span className="font-semibold uppercase">{key}:</span> {status.message}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3">
            <Zap className="w-7 h-7 text-purple-500" />
            <span>AI 서비스 상태</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(data.services).map(([key, service]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(service.status)}
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{service.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  <span className="font-medium">필수:</span> {service.required}
                </p>
                {service.status !== '✅ 사용 가능' && service.status !== '✅ 항상 사용 가능' && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    <span className="font-medium">폴백:</span> {service.fallback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {data.recommendations.critical.length > 0 || data.recommendations.important.length > 0 ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-8 mb-8 border border-red-200 dark:border-red-700">
            <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-7 h-7" />
              <span>권장 사항</span>
            </h2>
            <ul className="space-y-4 text-red-700 dark:text-red-300">
              {data.recommendations.critical.map((rec, index) => (
                <li key={`critical-${index}`} className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">필수: {rec}</p>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                      이 문제를 해결하지 않으면 일부 AI 기능이 제대로 작동하지 않습니다.
                    </p>
                  </div>
                </li>
              ))}
              {data.recommendations.important.map((rec, index) => (
                <li key={`important-${index}`} className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium">중요: {rec}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                      이 문제를 해결하면 더 많은 기능을 활용할 수 있습니다.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-8 mb-8 border border-green-200 dark:border-green-700">
            <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-green-600 dark:text-green-400">
              <CheckCircle className="w-7 h-7" />
              <span>모든 무료 AI 서비스 정상 작동</span>
            </h2>
            <p className="text-green-700 dark:text-green-300">
              모든 무료 AI 서비스가 정상적으로 작동하고 있습니다.
            </p>
          </div>
        )}

        {data.recommendations.optional.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md p-8 mb-8 border border-blue-200 dark:border-blue-700">
            <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-blue-600 dark:text-blue-400">
              <Info className="w-7 h-7" />
              <span>선택 사항</span>
            </h2>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300">
              {data.recommendations.optional.map((rec, index) => (
                <li key={`optional-${index}`} className="flex items-start space-x-3">
                  <Info className="w-5 h-5 flex-shrink-0 mt-1" />
                  <p>{rec}</p>
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
