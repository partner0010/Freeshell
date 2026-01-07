'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, Search, Lightbulb, CheckCircle, XCircle, 
  Clock, Zap, TrendingUp, AlertCircle, Loader2,
  Play, Pause, RefreshCw
} from 'lucide-react';
import { AIProcessTracker, AIProcessStep } from '@/lib/ai-process-tracker';

interface AIProcessViewerProps {
  processId?: string;
  query?: string;
}

export default function AIProcessViewer({ processId, query }: AIProcessViewerProps) {
  const [process, setProcess] = useState<AIProcessTracker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (processId) {
      fetchProcess();
      if (autoRefresh) {
        const interval = setInterval(fetchProcess, 500); // 0.5초마다 업데이트
        return () => clearInterval(interval);
      }
    }
  }, [processId, autoRefresh]);

  const fetchProcess = async () => {
    if (!processId) return;
    
    try {
      const response = await fetch(`/api/ai-process?id=${processId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.process) {
          setProcess(data.process);
        }
      }
    } catch (error) {
      console.error('처리 과정 조회 오류:', error);
    }
  };

  const getStageIcon = (stage: string) => {
    const iconClass = "w-5 h-5";
    switch (stage) {
      case 'thinking':
        return <Brain className={`${iconClass} text-blue-500 animate-pulse`} />;
      case 'researching':
        return <Search className={`${iconClass} text-green-500 animate-bounce`} />;
      case 'analyzing':
        return <Lightbulb className={`${iconClass} text-yellow-500 animate-pulse`} />;
      case 'synthesizing':
        return <TrendingUp className={`${iconClass} text-purple-500 animate-pulse`} />;
      case 'generating':
        return <Zap className={`${iconClass} text-orange-500 animate-pulse`} />;
      case 'validating':
        return <CheckCircle className={`${iconClass} text-indigo-500`} />;
      case 'finalizing':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      default:
        return <Clock className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStageName = (stage: string) => {
    const names: Record<string, string> = {
      thinking: '사고 과정',
      researching: '데이터 수집',
      analyzing: '분석',
      synthesizing: '종합',
      generating: '생성',
      validating: '검증',
      finalizing: '최종화',
    };
    return names[stage] || stage;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (!process) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">처리 과정을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">AI 처리 과정 추적</h2>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{autoRefresh ? '자동 새로고침' : '일시정지'}</span>
          </button>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">질문:</span>
            <p className="text-lg font-semibold text-gray-900">{process.query}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>처리 시간: {process.totalDuration || (Date.now() - process.startTime)}ms</span>
            <span>단계: {process.currentStep}/{process.steps.length}</span>
            <span>API 호출: {process.apiCalls.length}회</span>
          </div>
        </div>
      </div>

      {/* 단계별 진행 상황 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">처리 단계</h3>
        <div className="space-y-4">
          {process.steps.map((step, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all transform ${
                  step.status === 'processing' 
                    ? 'shadow-lg scale-105 border-2' 
                    : step.status === 'completed'
                    ? 'shadow-sm'
                    : ''
                } ${getStatusColor(step.status)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStageIcon(step.stage)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">단계 {step.step}</span>
                        <span className="text-sm opacity-75">({getStageName(step.stage)})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {step.status === 'processing' && (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-blue-600 font-semibold">처리 중...</span>
                          </>
                        )}
                        {step.status === 'completed' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {step.duration && (
                              <span className="text-green-600">{step.duration}ms</span>
                            )}
                          </>
                        )}
                        {step.status === 'failed' && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-2">{step.description}</p>
                    {step.details && (
                      <div className="mt-2 p-3 bg-white/70 rounded-lg border border-white/50">
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{step.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>

      {/* 사고 과정 - 시각적 강화 */}
      {process.thinkingProcess.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
            AI 사고 과정 (실시간)
          </h3>
          <div className="space-y-4">
            {process.thinkingProcess.map((thinking, index) => (
              <div 
                key={index} 
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-300 rounded-lg p-4 shadow-md transform transition-all hover:scale-105"
                style={{
                  animation: `fadeIn 0.5s ease-in ${index * 0.1}s both`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 mb-2 text-base">{thinking.thought}</p>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{thinking.reasoning}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${thinking.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-blue-600 min-w-[60px]">
                        {Math.round(thinking.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* API 호출 내역 */}
      {process.apiCalls.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">API 호출 내역</h3>
          <div className="space-y-2">
            {process.apiCalls.map((call, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  call.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {call.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{call.api}</p>
                    {call.error && (
                      <p className="text-xs text-red-600 mt-1">{call.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {call.responseTime}ms
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최종 응답 */}
      {process.finalResponse && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">최종 응답</h3>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
              {process.finalResponse}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

