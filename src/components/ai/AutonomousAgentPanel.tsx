'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Play, Loader2, CheckCircle, XCircle, Sparkles, Users, Zap, Globe, Wrench, Code, TrendingUp, Database, Network } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface AutonomousTask {
  id: string;
  goal: string;
  context?: Record<string, any>;
  constraints?: string[];
  status: 'pending' | 'thinking' | 'executing' | 'completed' | 'failed';
  result?: any;
  reasoning?: string;
  steps?: any[];
}

export function AutonomousAgentPanel() {
  const { showToast } = useToast();
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState<AutonomousTask[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    loadTasks();
    connectEventStream();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const connectEventStream = () => {
    const es = new EventSource('/api/realtime/stream');
    
    es.onmessage = (event) => {
      if (event.data.startsWith('data: ')) {
        try {
          const data = JSON.parse(event.data.substring(6));
          handleRealtimeEvent(data);
        } catch (error) {
          // 하트비트 등 무시
        }
      }
    };

    es.onerror = (error) => {
      console.error('EventStream 오류:', error);
      // 재연결 시도
      setTimeout(connectEventStream, 5000);
    };

    setEventSource(es);
  };

  const handleRealtimeEvent = (event: any) => {
    if (event.type === 'task') {
      if (event.action === 'created' || event.action === 'updated') {
        loadTasks();
      } else if (event.action === 'completed' || event.action === 'failed') {
        loadTasks();
        showToast({
          type: event.action === 'completed' ? 'success' : 'error',
          message: event.data.error || '작업이 완료되었습니다.',
        });
      }
    } else if (event.type === 'notification') {
      showToast({
        type: event.data.type || 'info',
        message: event.data.message,
      });
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/ai/autonomous');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
      }
    } catch (error) {
      console.error('작업 로드 실패:', error);
    }
  };

  const createTask = async () => {
    if (!goal.trim()) {
      showToast({ type: 'error', message: '목표를 입력하세요.' });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/ai/autonomous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast({ type: 'success', message: '자율 작업이 생성되었습니다.' });
        setGoal('');
        loadTasks();
      } else {
        const errorData = await response.json();
        showToast({ type: 'error', message: errorData.error || '작업 생성에 실패했습니다.' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: `작업 생성 실패: ${error.message}` });
    } finally {
      setIsCreating(false);
    }
  };

  const executeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/ai/autonomous/${taskId}/execute`, {
        method: 'POST',
      });

      if (response.ok) {
        showToast({ type: 'success', message: '작업이 시작되었습니다.' });
        loadTasks();
      } else {
        const errorData = await response.json();
        showToast({ type: 'error', message: errorData.error || '작업 실행에 실패했습니다.' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: `작업 실행 실패: ${error.message}` });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="text-purple-600" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">자율 AI 에이전트</h2>
            <p className="text-gray-600">AI가 스스로 판단하고 결과를 생성합니다</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              목표
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: '블로그 포스트 10개 작성', '마케팅 전략 수립', '코드 리뷰 및 개선' 등"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>

          <button
            onClick={createTask}
            disabled={isCreating || !goal.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                자율 작업 생성
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">작업 목록</h3>
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            생성된 작업이 없습니다.
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">{task.goal}</h4>
                  {task.reasoning && (
                    <p className="text-sm text-gray-600 mb-2">{task.reasoning}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'failed' ? 'bg-red-100 text-red-700' :
                      task.status === 'executing' || task.status === 'thinking' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status === 'pending' ? '대기' :
                       task.status === 'thinking' ? '사고 중' :
                       task.status === 'executing' ? '실행 중' :
                       task.status === 'completed' ? '완료' : '실패'}
                    </span>
                  </div>
                </div>
                {task.status === 'pending' && (
                  <button
                    onClick={() => executeTask(task.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Play size={16} />
                    실행
                  </button>
                )}
                {(task.status === 'thinking' || task.status === 'executing') && (
                  <Loader2 className="animate-spin text-purple-600" size={20} />
                )}
                {task.status === 'completed' && (
                  <CheckCircle className="text-green-600" size={20} />
                )}
                {task.status === 'failed' && (
                  <XCircle className="text-red-600" size={20} />
                )}
              </div>

              {task.steps && task.steps.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-semibold text-gray-700">실행 단계:</h5>
                  {task.steps.map((step: any, index: number) => (
                    <div key={step.id || index} className="text-sm text-gray-600 pl-4 border-l-2 border-purple-200">
                      <div className="font-medium">{step.action}</div>
                      {step.reasoning && (
                        <div className="text-xs text-gray-500 mt-1">{step.reasoning}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {task.result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">결과:</h5>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

