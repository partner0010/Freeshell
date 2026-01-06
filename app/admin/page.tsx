'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  FileSignature, 
  Activity, 
  Bug, 
  SearchCheck, 
  Cloud,
  ArrowLeft,
  Shield,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const adminTools = [
  {
    id: 'signature',
    title: '전자결재',
    description: '전자서명 및 문서 승인 관리 시스템',
    href: '/signature',
    icon: FileSignature,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'diagnostics',
    title: '시스템 진단',
    description: 'URL/코드 보안 분석, 취약점 검사, API 키 노출 검사',
    href: '/diagnostics',
    icon: Activity,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'debug',
    title: '디버그 도구',
    description: '코드 분석, 버그 검사, 성능 최적화 제안',
    href: '/debug',
    icon: Bug,
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 'site-check',
    title: '사이트 검사',
    description: '사이트 구성 분석, 모듈 감지, 모의해킹 시나리오',
    href: '/site-check',
    icon: SearchCheck,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'remote-solution',
    title: '원격 솔루션',
    description: '인터넷 전용 원격 접속 (프로그램 설치 불필요)',
    href: '/remote-solution',
    icon: Cloud,
    color: 'from-red-500 to-red-600',
  },
];

interface SystemStatus {
  timestamp: string;
  environment: {
    nodeEnv: string;
    isProduction: boolean;
    platform?: string;
  };
  apiKeys: {
    [key: string]: {
      configured: boolean;
      hasValue: boolean;
      prefix: string;
      valid: boolean;
      message: string;
    };
  };
  services: {
    [key: string]: {
      name: string;
      required: string;
      status: string;
      fallback: string;
      description: string;
    };
  };
}

export default function AdminPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const fetchSystemStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('시스템 상태 로드 실패:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === '✅ 사용 가능' || status === '✅ 항상 사용 가능') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status.includes('❌') || status.includes('오류')) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getApiKeyIcon = (valid: boolean) => {
    return valid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              관리자 페이지
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              시스템 관리 및 진단 도구에 접근할 수 있습니다
            </p>
          </div>

          {/* 관리 도구 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {adminTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {tool.description}
                  </p>

                  <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    접근하기
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center mb-12">
            <Settings className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              관리자 전용 기능
            </h3>
            <p className="text-gray-700 text-sm max-w-2xl mx-auto">
              이 페이지의 모든 도구는 시스템 관리 및 진단을 위한 것입니다. 
              일반 사용자에게는 표시되지 않습니다.
            </p>
          </div>

          {/* 시스템 상태 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">시스템 상태</h2>
                  <p className="text-sm text-gray-600">현재 시스템 상태 및 API 키 확인</p>
                </div>
              </div>
              <button
                onClick={fetchSystemStatus}
                disabled={isLoadingStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>새로고침</span>
              </button>
            </div>

            {isLoadingStatus ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600">시스템 상태를 불러오는 중...</p>
              </div>
            ) : systemStatus ? (
              <div className="space-y-6">
                {/* 환경 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">환경 정보</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Node 환경:</span>
                        <span className="text-blue-700 font-semibold">{systemStatus.environment.nodeEnv}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">프로덕션 모드:</span>
                        <span className={`font-semibold ${systemStatus.environment.isProduction ? 'text-green-700' : 'text-yellow-700'}`}>
                          {systemStatus.environment.isProduction ? '예' : '아니오'}
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">플랫폼:</span>
                        <span className="text-purple-700 font-semibold">{systemStatus.environment.platform || '로컬'}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">확인 시간:</span>
                        <span className="text-gray-600 text-sm">{new Date(systemStatus.timestamp).toLocaleString()}</span>
                      </li>
                    </ul>
                  </div>

                  {/* API 키 상태 */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">API 키 상태</h3>
                    <ul className="space-y-3">
                      {Object.entries(systemStatus.apiKeys).map(([key, status]) => (
                        <li key={key} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                          {getApiKeyIcon(status.valid)}
                          <div className="flex-1">
                            <span className="font-bold text-gray-900 uppercase text-sm">{key}:</span>
                            <span className={`ml-2 text-sm font-medium ${
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

                {/* 서비스 상태 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 서비스 상태</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(systemStatus.services).map(([key, service]) => {
                      const isAvailable = service.status === '✅ 사용 가능' || service.status === '✅ 항상 사용 가능';
                      return (
                        <div key={key} className={`rounded-xl p-5 border-2 ${
                          isAvailable 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(service.status)}
                            <h4 className="font-bold text-gray-900">{service.name}</h4>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{service.description}</p>
                          <p className={`text-sm font-semibold ${
                            isAvailable ? 'text-green-700' : 'text-yellow-700'
                          }`}>
                            {service.status}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 상세 진단 링크 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <Link
                    href="/diagnostics"
                    className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800 transition-colors"
                  >
                    <Activity className="w-5 h-5" />
                    <span>상세 진단 정보 보기</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <p className="text-gray-600">시스템 상태를 불러올 수 없습니다.</p>
                <button
                  onClick={fetchSystemStatus}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
