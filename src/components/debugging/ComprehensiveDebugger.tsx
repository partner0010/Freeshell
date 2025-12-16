'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileCode,
  Network,
  Code2,
  Zap,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Filter,
  Search,
} from 'lucide-react';
import {
  breakpointManager,
  consoleLogger,
  networkDebugger,
  debugSessionManager,
  type Breakpoint,
  type ConsoleLog,
  type DebugSession,
  aiFixBug,
} from '@/lib/debugging/debugger-core';

export function ComprehensiveDebugger() {
  const [activeTab, setActiveTab] = useState<'console' | 'breakpoints' | 'network' | 'ai-debug' | 'sessions'>('console');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [networkRequests, setNetworkRequests] = useState<any[]>([]);
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<{ level?: ConsoleLog['level']; search?: string }>({});
  const [codeInput, setCodeInput] = useState('');
  const [errorInput, setErrorInput] = useState('');
  const [aiFixing, setAiFixing] = useState(false);
  const [fixedCode, setFixedCode] = useState<{ code: string; explanation: string; confidence: number } | null>(null);

  useEffect(() => {
    // 콘솔 로그 구독
    const unsubscribe = consoleLogger.subscribe((log) => {
      setLogs((prev) => [...prev, log]);
    });

    // 초기 데이터 로드
    loadBreakpoints();
    loadNetworkRequests();
    loadSessions();

    // 네트워크 요청 업데이트 (주기적)
    const interval = setInterval(() => {
      setNetworkRequests(networkDebugger.getRequests());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadBreakpoints = () => {
    setBreakpoints(breakpointManager.getAllBreakpoints());
  };

  const loadNetworkRequests = () => {
    setNetworkRequests(networkDebugger.getRequests());
  };

  const loadSessions = () => {
    setSessions(debugSessionManager.getAllSessions());
  };

  const handleStartSession = () => {
    const sessionId = debugSessionManager.createSession(`세션 ${new Date().toLocaleTimeString()}`);
    setSelectedSession(sessionId);
    setIsRunning(true);
    loadSessions();
  };

  const handleStopSession = () => {
    if (selectedSession) {
      debugSessionManager.stopSession(selectedSession);
      setIsRunning(false);
      loadSessions();
    }
  };

  const handleAddBreakpoint = () => {
    // 실제로는 코드 에디터에서 위치 선택
    const file = prompt('파일 경로를 입력하세요:', 'src/components/Example.tsx');
    const line = prompt('라인 번호를 입력하세요:', '10');
    if (file && line) {
      breakpointManager.addBreakpoint(file, parseInt(line));
      loadBreakpoints();
    }
  };

  const handleRemoveBreakpoint = (id: string) => {
    breakpointManager.removeBreakpoint(id);
    loadBreakpoints();
  };

  const handleToggleBreakpoint = (id: string) => {
    breakpointManager.toggleBreakpoint(id);
    loadBreakpoints();
  };

  const handleAIFix = async () => {
    if (!codeInput || !errorInput) {
      alert('코드와 에러 메시지를 입력하세요');
      return;
    }

    setAiFixing(true);
    try {
      const result = await aiFixBug(codeInput, errorInput, 'React 컴포넌트');
      setFixedCode({
        code: result.fixedCode,
        explanation: result.explanation,
        confidence: result.confidence,
      });
    } catch (error) {
      alert(`AI 수정 실패: ${error}`);
    } finally {
      setAiFixing(false);
    }
  };

  const getLogIcon = (level: ConsoleLog['level']) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="text-red-600" size={16} />;
      case 'warn':
        return <AlertTriangle className="text-yellow-600" size={16} />;
      case 'info':
        return <Info className="text-blue-600" size={16} />;
      default:
        return <CheckCircle2 className="text-green-600" size={16} />;
    }
  };

  const filteredLogs = consoleLogger.getLogs(logFilter);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
              <Bug className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">종합 디버깅 시스템</h2>
              <p className="text-sm text-gray-500">AI 기반 실시간 디버깅 및 버그 수정</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                onClick={handleStartSession}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Play size={16} />
                세션 시작
              </button>
            ) : (
              <button
                onClick={handleStopSession}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Square size={16} />
                중지
              </button>
            )}
            <button
              onClick={() => {
                consoleLogger.clear();
                setLogs([]);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              초기화
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'console', label: '콘솔', icon: FileCode },
            { id: 'breakpoints', label: '브레이크포인트', icon: Pause },
            { id: 'network', label: '네트워크', icon: Network },
            { id: 'ai-debug', label: 'AI 디버깅', icon: Zap },
            { id: 'sessions', label: '세션', icon: Save },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'console' && (
          <div className="space-y-4">
            {/* 필터 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="로그 검색..."
                  value={logFilter.search || ''}
                  onChange={(e) => setLogFilter({ ...logFilter, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <select
                value={logFilter.level || 'all'}
                onChange={(e) =>
                  setLogFilter({
                    ...logFilter,
                    level: e.target.value === 'all' ? undefined : (e.target.value as ConsoleLog['level']),
                  })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="all">모든 레벨</option>
                <option value="error">에러</option>
                <option value="warn">경고</option>
                <option value="info">정보</option>
                <option value="log">로그</option>
              </select>
            </div>

            {/* 로그 목록 */}
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  로그가 없습니다
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border ${
                      log.level === 'error'
                        ? 'bg-red-50 border-red-200'
                        : log.level === 'warn'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getLogIcon(log.level)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">{log.message}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {log.file && (
                          <div className="text-xs text-gray-500 font-mono">
                            {log.file}:{log.line}
                          </div>
                        )}
                        {log.data && log.data.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer">데이터 보기</summary>
                            <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'breakpoints' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">브레이크포인트</h3>
              <button
                onClick={handleAddBreakpoint}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
              >
                <Pause size={16} />
                추가
              </button>
            </div>
            <div className="space-y-2">
              {breakpoints.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  브레이크포인트가 없습니다
                </div>
              ) : (
                breakpoints.map((bp) => (
                  <div
                    key={bp.id}
                    className="p-4 bg-white border rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{bp.file}</div>
                      <div className="text-sm text-gray-500">
                        라인 {bp.line} • 히트: {bp.hitCount}회
                      </div>
                      {bp.condition && (
                        <div className="text-xs text-gray-400 mt-1">조건: {bp.condition}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBreakpoint(bp.id)}
                        className={`p-2 rounded ${
                          bp.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {bp.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => handleRemoveBreakpoint(bp.id)}
                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">네트워크 요청</h3>
            <div className="space-y-2">
              {networkRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  네트워크 요청이 없습니다
                </div>
              ) : (
                networkRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 border rounded-lg ${
                      req.status && req.status >= 400
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            req.method === 'GET'
                              ? 'bg-blue-100 text-blue-700'
                              : req.method === 'POST'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {req.method}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{req.url}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {req.status && (
                          <span
                            className={
                              req.status >= 400 ? 'text-red-600 font-medium' : 'text-green-600'
                            }
                          >
                            {req.status}
                          </span>
                        )}
                        {req.duration && <span>{req.duration}ms</span>}
                      </div>
                    </div>
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">상세 정보</summary>
                      <div className="mt-2 space-y-2">
                        {req.body && (
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">요청 본문</div>
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(req.body, null, 2)}
                            </pre>
                          </div>
                        )}
                        {req.response && (
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">응답</div>
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(req.response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai-debug' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">AI 기반 버그 수정</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  무료 AI API를 활용하여 코드의 버그를 자동으로 분석하고 수정 제안을 받을 수 있습니다.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">에러 메시지</label>
                <textarea
                  value={errorInput}
                  onChange={(e) => setErrorInput(e.target.value)}
                  placeholder="발생한 에러 메시지를 입력하세요..."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">코드</label>
                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="디버깅할 코드를 입력하세요..."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 font-mono text-sm"
                  rows={10}
                />
              </div>

              <button
                onClick={handleAIFix}
                disabled={aiFixing || !codeInput || !errorInput}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {aiFixing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    AI가 분석 중...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    AI로 버그 수정하기
                  </>
                )}
              </button>

              {fixedCode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-green-800">수정된 코드</h4>
                    <span className="text-xs text-green-600">
                      신뢰도: {(fixedCode.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <pre className="text-sm bg-white p-3 rounded border overflow-x-auto mb-3">
                    {fixedCode.code}
                  </pre>
                  <div className="text-sm text-green-700">{fixedCode.explanation}</div>
                  <div className="flex gap-2 mt-3">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      수정 적용
                    </button>
                    <button
                      onClick={() => {
                        setFixedCode(null);
                        setCodeInput('');
                        setErrorInput('');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      초기화
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">디버깅 세션</h3>
            </div>
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  디버깅 세션이 없습니다
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 border rounded-lg ${
                      selectedSession === session.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{session.name}</div>
                        <div className="text-sm text-gray-500">
                          시작: {new Date(session.startTime).toLocaleString()} • 상태: {session.status}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          브레이크포인트: {session.breakpoints.length} • 로그: {session.logs.length}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSession(session.id)}
                          className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                        >
                          선택
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

