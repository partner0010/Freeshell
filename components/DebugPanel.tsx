/**
 * 디버깅 패널 컴포넌트
 * 콘솔 로그 및 브레이크포인트 관리
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Bug, Play, Pause, Square, Trash2, Filter, X } from 'lucide-react';

interface LogEntry {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  data?: any;
}

interface Breakpoint {
  id: string;
  line: number;
  file: string;
  enabled: boolean;
  condition?: string;
}

interface WatchedVariable {
  id: string;
  name: string;
  value: any;
  type: string;
}

export default function DebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [watchedVariables, setWatchedVariables] = useState<WatchedVariable[]>([]);
  const [callStack, setCallStack] = useState<Array<{ function: string; file: string; line: number }>>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all');
  const [activeTab, setActiveTab] = useState<'logs' | 'breakpoints' | 'variables' | 'stack'>('logs');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 콘솔 오버라이드
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args.join(' '), args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args.join(' '), args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args.join(' '), args);
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog('info', args.join(' '), args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    setLogs(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date(),
        data,
      },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleBreakpoint = (line: number, file: string) => {
    setBreakpoints(prev => {
      const existing = prev.find(bp => bp.line === line && bp.file === file);
      if (existing) {
        return prev.filter(bp => bp.id !== existing.id);
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          line,
          file,
          enabled: true,
        },
      ];
    });
  };

  const addWatchedVariable = (name: string) => {
    if (!name.trim()) return;
    setWatchedVariables(prev => {
      // 이미 존재하는 변수인지 확인
      if (prev.some(v => v.name === name)) return prev;
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: name.trim(),
          value: undefined,
          type: 'undefined',
        },
      ];
    });
  };

  const removeWatchedVariable = (id: string) => {
    setWatchedVariables(prev => prev.filter(v => v.id !== id));
  };

  const filteredLogs = logs.filter(log => filter === 'all' || log.type === filter);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">디버깅 패널</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded transition-colors ${
              isPaused ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={isPaused ? '재개' : '일시정지'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={clearLogs}
            className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="로그 지우기"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="p-2 border-b border-gray-200 flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        {(['all', 'log', 'error', 'warn', 'info'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === type
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'logs' && (
          <div className="space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                로그가 없습니다
              </div>
            ) : (
              filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-2 rounded border text-xs ${getLogColor(log.type)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{log.type.toUpperCase()}</span>
                <span className="text-gray-500">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="font-mono text-xs break-all">{log.message}</div>
              {log.data && log.data.length > 1 && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-gray-500">
                    데이터 보기
                  </summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        )}

        {activeTab === 'breakpoints' && (
          <div className="space-y-2">
            {breakpoints.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                브레이크포인트가 없습니다
              </div>
            ) : (
              breakpoints.map(bp => (
                <div
                  key={bp.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                >
                  <div>
                    <span className="font-medium">{bp.file}:{bp.line}</span>
                    {bp.condition && (
                      <span className="text-gray-500 ml-2">조건: {bp.condition}</span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleBreakpoint(bp.line, bp.file)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Square className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'variables' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="변수 이름 입력..."
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addWatchedVariable(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            {watchedVariables.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                감시 변수가 없습니다
              </div>
            ) : (
              watchedVariables.map(v => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                >
                  <div>
                    <span className="font-medium">{v.name}</span>
                    <span className="text-gray-500 ml-2">= {String(v.value)}</span>
                    <span className="text-gray-400 ml-2">({v.type})</span>
                  </div>
                  <button
                    onClick={() => removeWatchedVariable(v.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stack' && (
          <div className="space-y-2">
            {callStack.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                호출 스택이 비어있습니다
              </div>
            ) : (
              callStack.map((frame, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-gray-50 rounded text-xs"
                >
                  <div className="font-medium">{frame.function}</div>
                  <div className="text-gray-500">{frame.file}:{frame.line}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 브레이크포인트 */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">브레이크포인트</h4>
        {breakpoints.length === 0 ? (
          <p className="text-xs text-gray-500">브레이크포인트가 없습니다</p>
        ) : (
          <div className="space-y-1">
            {breakpoints.map(bp => (
              <div
                key={bp.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
              >
                <span>
                  {bp.file}:{bp.line}
                </span>
                <button
                  onClick={() => toggleBreakpoint(bp.line, bp.file)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Square className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
