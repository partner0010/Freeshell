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
import AutoLearningPanel from '@/components/AutoLearningPanel';
import AdminStatusWidget from '@/components/AdminStatusWidget';

const adminTools = [
  {
    id: 'status',
    title: '솔루션 상태',
    description: '전체 시스템 상태 모니터링 및 점검',
    href: '/admin/status',
    icon: Activity,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'settings',
    title: '시스템 설정',
    description: 'SNS API, 광고/배너/팝업 관리',
    href: '/admin/settings',
    icon: Settings,
    color: 'from-indigo-500 to-indigo-600',
  },
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
  {
    id: 'plugins',
    title: '플러그인 관리',
    description: '확장 기능 설치 및 관리',
    href: '/admin/plugins',
    icon: Settings,
    color: 'from-pink-500 to-pink-600',
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

interface AIDiagnostics {
  timestamp: string;
  overall: {
    status: string;
    healthScore: number;
    criticalIssues: number;
    warnings: number;
    workingServices: number;
    totalServices: number;
  };
  services: {
    [key: string]: {
      name: string;
      provider: string;
      required: boolean;
      apiKey: {
        configured: boolean;
        hasValue: boolean;
        length: number;
        prefix: string;
        valid: boolean;
        issues: string[];
      };
      test?: {
        performed: boolean;
        success: boolean;
        responseTime: number;
        error: string | null;
        details: any;
      };
      status: string;
      issues: string[];
      solutions: string[];
    };
  };
  recommendations: {
    critical: string[];
    important: string[];
    optional: string[];
  };
  environment: {
    nodeEnv: string;
    isProduction: boolean;
    platform: string;
  };
}

export default function AdminPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [aiDiagnostics, setAiDiagnostics] = useState<AIDiagnostics | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'detailed'>('detailed');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);

  const fetchSystemStatus = async () => {
    setIsLoadingStatus(true);
    setStatusError(null);
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
        setStatusError(null);
      } else {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('시스템 상태 로드 실패:', response.status, response.statusText, errorMessage);
        setStatusError(errorMessage);
        setSystemStatus(null);
      }
    } catch (error: any) {
      console.error('시스템 상태 로드 실패:', error);
      setStatusError(error.message || '네트워크 오류가 발생했습니다.');
      setSystemStatus(null);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const fetchAIDiagnostics = async () => {
    setIsLoadingDiagnostics(true);
    setDiagnosticsError(null);
    try {
      const response = await fetch('/api/ai-diagnostics');
      if (response.ok) {
        const data = await response.json();
        setAiDiagnostics(data);
        setDiagnosticsError(null);
      } else {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('AI 진단 로드 실패:', response.status, response.statusText, errorMessage);
        setDiagnosticsError(errorMessage);
        setAiDiagnostics(null);
      }
    } catch (error: any) {
      console.error('AI 진단 로드 실패:', error);
      setDiagnosticsError(error.message || '네트워크 오류가 발생했습니다.');
      setAiDiagnostics(null);
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    fetchAIDiagnostics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'not_configured':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">정상</span>;
      case 'error':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">오류</span>;
      case 'warning':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">경고</span>;
      case 'not_configured':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">미설정</span>;
      default:
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">확인 중</span>;
    }
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

          {/* 상태 위젯 */}
          <div className="mb-8">
            <AdminStatusWidget />
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

          {/* AI 상태 진단 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI 상태 진단</h2>
                  <p className="text-sm text-gray-600">상세한 AI 서비스 진단 및 문제 해결 가이드</p>
                </div>
              </div>
              <button
                onClick={fetchAIDiagnostics}
                disabled={isLoadingDiagnostics}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingDiagnostics ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>진단 실행</span>
              </button>
            </div>

            {isLoadingDiagnostics ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-gray-600">AI 진단을 실행하는 중...</p>
              </div>
            ) : aiDiagnostics ? (
              <div className="space-y-6">
                {/* 전체 상태 요약 */}
                <div className={`rounded-xl p-6 border-2 ${getStatusColor(aiDiagnostics.overall.status)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">전체 AI 서비스 상태</h3>
                      <p className="text-sm opacity-80">
                        {aiDiagnostics.overall.workingServices} / {aiDiagnostics.overall.totalServices} 서비스 정상 작동
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold mb-1">{aiDiagnostics.overall.healthScore}%</div>
                      <div className="text-sm opacity-80">건강 점수</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    {getStatusBadge(aiDiagnostics.overall.status)}
                    {aiDiagnostics.overall.criticalIssues > 0 && (
                      <span className="text-sm font-semibold text-red-700">
                        ⚠️ {aiDiagnostics.overall.criticalIssues}개 중요 문제
                      </span>
                    )}
                    {aiDiagnostics.overall.warnings > 0 && (
                      <span className="text-sm font-semibold text-yellow-700">
                        ⚠️ {aiDiagnostics.overall.warnings}개 경고
                      </span>
                    )}
                  </div>
                </div>

                {/* 각 AI 서비스 상세 진단 */}
                {Object.entries(aiDiagnostics.services).map(([key, service]) => (
                  <div key={key} className={`rounded-xl p-6 border-2 ${getStatusColor(service.status)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold">{service.name}</h4>
                          {service.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">필수</span>
                          )}
                          {getStatusBadge(service.status)}
                        </div>
                        <p className="text-sm opacity-80 mb-3">Provider: {service.provider}</p>
                      </div>
                    </div>

                    {/* API 키 정보 */}
                    {service.apiKey && (
                      <div className="bg-white/50 rounded-lg p-4 mb-4">
                        <h5 className="font-semibold mb-2 text-sm">API 키 정보</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">설정 여부:</span>
                            <span className={`ml-2 font-semibold ${service.apiKey?.configured ? 'text-green-700' : 'text-red-700'}`}>
                              {service.apiKey?.configured ? '✅ 설정됨' : '❌ 미설정'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">길이:</span>
                            <span className="ml-2 font-semibold">{service.apiKey?.length || 0}자</span>
                          </div>
                          <div>
                            <span className="text-gray-600">접두사:</span>
                            <span className="ml-2 font-mono text-xs">{service.apiKey?.prefix || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">유효성:</span>
                            <span className={`ml-2 font-semibold ${service.apiKey?.valid ? 'text-green-700' : 'text-red-700'}`}>
                              {service.apiKey?.valid ? '✅ 유효' : '❌ 무효'}
                            </span>
                          </div>
                        </div>
                        {(service.apiKey?.issues?.length || 0) > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm font-semibold text-red-700 mb-1">API 키 문제:</p>
                            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                              {(service.apiKey?.issues || []).map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* API 테스트 결과 */}
                    {service.test && (
                      <div className="bg-white/50 rounded-lg p-4 mb-4">
                        <h5 className="font-semibold mb-2 text-sm">API 테스트 결과</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">테스트 수행:</span>
                            <span className={`ml-2 font-semibold ${service.test.performed ? 'text-green-700' : 'text-gray-700'}`}>
                              {service.test.performed ? '✅ 완료' : '❌ 미수행'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">성공 여부:</span>
                            <span className={`ml-2 font-semibold ${service.test.success ? 'text-green-700' : 'text-red-700'}`}>
                              {service.test.success ? '✅ 성공' : '❌ 실패'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">응답 시간:</span>
                            <span className="ml-2 font-semibold">{service.test.responseTime}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-600">실제 호출:</span>
                            <span className={`ml-2 font-semibold ${service.test.details.realAPICall ? 'text-green-700' : 'text-red-700'}`}>
                              {service.test.details.realAPICall ? '✅ 예' : '❌ 아니오'}
                            </span>
                          </div>
                        </div>
                        {service.test.error && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <p className="text-sm font-semibold text-red-700 mb-1">에러 메시지:</p>
                            <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">{service.test.error}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 문제점 */}
                    {(service.issues?.length || 0) > 0 && (
                      <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
                        <h5 className="font-semibold text-red-700 mb-2 text-sm">🔍 발견된 문제</h5>
                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                          {(service.issues || []).map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 해결 방법 */}
                    {(service.solutions?.length || 0) > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-2 text-sm">💡 조치 방법</h5>
                        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
                          {(service.solutions || []).map((solution, idx) => (
                            <li key={idx} className="pl-2">{solution}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}

                {/* 권장사항 */}
                {((aiDiagnostics.recommendations?.critical?.length || 0) > 0 || 
                  (aiDiagnostics.recommendations?.important?.length || 0) > 0 || 
                  (aiDiagnostics.recommendations?.optional?.length || 0) > 0) && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">📋 권장사항</h3>
                    {(aiDiagnostics.recommendations?.critical?.length || 0) > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-red-700 mb-2">🚨 중요 (즉시 조치 필요)</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {(aiDiagnostics.recommendations.critical || []).map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(aiDiagnostics.recommendations?.important?.length || 0) > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-yellow-700 mb-2">⚠️ 중요 (조치 권장)</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {(aiDiagnostics.recommendations.important || []).map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(aiDiagnostics.recommendations?.optional?.length || 0) > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2">ℹ️ 선택사항</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {(aiDiagnostics.recommendations.optional || []).map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">AI 진단 정보를 불러올 수 없습니다.</p>
                {diagnosticsError && (
                  <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 inline-block">
                    오류: {diagnosticsError}
                  </p>
                )}
                <button
                  onClick={fetchAIDiagnostics}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>

          {/* 자동 학습 시스템 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <AutoLearningPanel />
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

                {/* API 연결 테스트 */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔌 API 연결 테스트</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    실제 API 호출을 테스트하여 연결 상태를 확인합니다.
                  </p>
                  <Link
                    href="/api/ai/test-connection"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    <Server className="w-4 h-4" />
                    <span>API 연결 테스트 실행</span>
                  </Link>
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
                <p className="text-gray-600 mb-2">시스템 상태를 불러올 수 없습니다.</p>
                {statusError && (
                  <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 inline-block">
                    오류: {statusError}
                  </p>
                )}
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
