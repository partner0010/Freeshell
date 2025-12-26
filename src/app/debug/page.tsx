/**
 * 디버깅 솔루션 페이지
 * 외부 디버깅 도구 통합
 */

'use client';

import { useState, useEffect } from 'react';
import { Bug, Play, Square, Code, AlertCircle, CheckCircle, Loader2, FileCode, Terminal, Activity, Zap, TrendingUp, Clock, BarChart3, RefreshCw } from 'lucide-react';

interface DebugSession {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
  breakpoints: Array<{ file: string; line: number }>;
  logs: Array<{ level: 'info' | 'warning' | 'error'; message: string; timestamp: Date }>;
}

export default function DebugPage() {
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
  });
  const [realtimeLogs, setRealtimeLogs] = useState<Array<{ level: 'info' | 'warning' | 'error'; message: string; timestamp: Date }>>([]);
  const [activeTab, setActiveTab] = useState<'tools' | 'sessions' | 'analysis' | 'performance' | 'logs'>('tools');

  const handleStartSession = () => {
    const session: DebugSession = {
      id: `session-${Date.now()}`,
      name: `디버깅 세션 ${sessions.length + 1}`,
      status: 'running',
      breakpoints: [],
      logs: [],
    };
    setSessions([...sessions, session]);
    setActiveSession(session.id);
  };

  const handleStopSession = (id: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, status: 'stopped' } : s));
    if (activeSession === id) {
      setActiveSession(null);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/debug/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`분석 완료!\n\n오류: ${data.errors.length}개\n경고: ${data.warnings.length}개\n제안: ${data.suggestions.length}개`);
      }
    } catch (error) {
      console.error('코드 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 성능 모니터링
  useEffect(() => {
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const memory = (performance as any).memory;
        
        setPerformanceMetrics({
          loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
          renderTime: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
          memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0,
          networkRequests: performance.getEntriesByType('resource').length,
        });
      }
    };

    measurePerformance();
    const interval = setInterval(measurePerformance, 5000);
    return () => clearInterval(interval);
  }, []);

  // 실시간 로그 수집
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog.apply(console, args);
      setRealtimeLogs(prev => [...prev.slice(-99), {
        level: 'info',
        message: args.join(' '),
        timestamp: new Date(),
      }]);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      setRealtimeLogs(prev => [...prev.slice(-99), {
        level: 'error',
        message: args.join(' '),
        timestamp: new Date(),
      }]);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      setRealtimeLogs(prev => [...prev.slice(-99), {
        level: 'warning',
        message: args.join(' '),
        timestamp: new Date(),
      }]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Bug className="text-orange-600" size={32} />
                디버깅 솔루션
              </h1>
              <p className="text-gray-600">
                다양한 디버깅 도구를 통합한 종합 디버깅 플랫폼
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPerformanceMetrics({
                  loadTime: 0,
                  renderTime: 0,
                  memoryUsage: 0,
                  networkRequests: 0,
                })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <RefreshCw size={16} />
                리셋
              </button>
            </div>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { id: 'tools', label: '도구', icon: Bug },
              { id: 'sessions', label: '세션', icon: Play },
              { id: 'analysis', label: '코드 분석', icon: Code },
              { id: 'performance', label: '성능', icon: Activity },
              { id: 'logs', label: '실시간 로그', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className="inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 성능 모니터링 탭 */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '로딩 시간', value: `${performanceMetrics.loadTime}ms`, icon: Clock, color: 'blue' },
                { label: '렌더링 시간', value: `${performanceMetrics.renderTime}ms`, icon: Zap, color: 'purple' },
                { label: '메모리 사용', value: `${performanceMetrics.memoryUsage}MB`, icon: BarChart3, color: 'green' },
                { label: '네트워크 요청', value: `${performanceMetrics.networkRequests}개`, icon: TrendingUp, color: 'orange' },
              ].map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                        <Icon className={`text-${metric.color}-600`} size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 실시간 로그 탭 */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">실시간 로그</h3>
              <button
                onClick={() => setRealtimeLogs([])}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                로그 지우기
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {realtimeLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">로그가 없습니다.</p>
              ) : (
                realtimeLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm ${
                      log.level === 'error' ? 'bg-red-50 text-red-900' :
                      log.level === 'warning' ? 'bg-yellow-50 text-yellow-900' :
                      'bg-gray-50 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.level.toUpperCase()}</span>
                      <span className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-mono text-xs">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 디버깅 도구 탭 */}
        {activeTab === 'tools' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { name: 'Chrome DevTools', desc: '브라우저 내장 디버깅 도구', icon: Code },
            { name: 'VS Code Debugger', desc: '통합 개발 환경 디버거', icon: FileCode },
            { name: 'React DevTools', desc: 'React 컴포넌트 디버깅', icon: Code },
            { name: 'Network Monitor', desc: '네트워크 요청 분석', icon: Terminal },
            { name: 'Performance Profiler', desc: '성능 프로파일링', icon: Loader2 },
            { name: 'Error Tracker', desc: '에러 추적 및 로깅', icon: AlertCircle },
          ].map((tool, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <tool.icon className="text-orange-600" size={20} />
                </div>
                <h3 className="font-bold text-gray-900">{tool.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{tool.desc}</p>
              <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
                사용하기
              </button>
            </div>
          ))}
        </div>

        )}
        {/* 디버깅 세션 탭 */}
        {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">디버깅 세션</h2>
            <button
              onClick={handleStartSession}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Play size={18} />
              새 세션 시작
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bug className="mx-auto mb-4 text-gray-400" size={48} />
              <p>디버깅 세션이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.name}</h3>
                      <p className="text-sm text-gray-600">
                        상태: {session.status === 'running' ? '실행 중' : '중지됨'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStopSession(session.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <Square size={16} />
                      중지
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        )}
        {/* 코드 분석 탭 */}
        {activeTab === 'analysis' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">코드 분석</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="분석할 코드를 입력하세요..."
            rows={10}
            className="w-full px-4 py-3 border rounded-lg font-mono text-sm mb-4"
          />
          <button
            onClick={handleAnalyzeCode}
            disabled={!code.trim() || isAnalyzing}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                분석 중...
              </>
            ) : (
              <>
                <Bug size={18} />
                코드 분석
              </>
            )}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
