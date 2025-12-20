'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  Zap,
  Brain,
} from 'lucide-react';
import {
  agentOrchestrator,
  type AgentTask,
  type Agent,
} from '@/lib/core/agent-orchestrator';
import { eventBus } from '@/lib/core/event-bus';
import { freeshellBridge } from '@/lib/integrations/freeshell-bridge';
// GRIP 브릿지 제거됨 - Freeshell 브릿지로 대체

export function UnifiedDashboard() {
  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setTasks(agentOrchestrator.getAllTasks());
    setAgents(agentOrchestrator.getAllAgents());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const prompt = input.trim();
      
      // 자연어 분석하여 작업 타입 결정
      if (/\b(비디오|영상|동영상|이미지|음악|콘텐츠)\b/.test(prompt)) {
        // FREESHELL 콘텐츠 생성
        await eventBus.emit('content.request', {
          type: prompt.includes('비디오') || prompt.includes('영상') ? 'generate-video' : 
                prompt.includes('이미지') ? 'generate-image' :
                prompt.includes('음악') ? 'generate-music' : 'generate-text',
          input: { prompt },
        }, 'unified-dashboard');
      }
      
      if (/\b(웹사이트|사이트|웹|코드)\b/.test(prompt)) {
        // Freeshell 웹 개발
        await eventBus.emit('dev.request', {
          type: 'create-website',
          input: { name: '새 웹사이트', description: prompt },
        }, 'unified-dashboard');
      }
      
      // AI 에이전트 작업 요청
      const result = await agentOrchestrator.requestTask(prompt, 'medium');
      if (result.success) {
        setInput('');
        loadData();
        
        // 이벤트 발생
        await eventBus.emit('agent.task.completed', result, 'unified-dashboard');
      } else {
        alert(`작업 실패: ${result.error}`);
      }
    } catch (error) {
      alert(`오류: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: AgentTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-green-600" size={20} />;
      case 'running':
        return <Clock className="text-blue-600 animate-spin" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status: AgentTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
            <Brain className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">통합 AI 에이전트 플랫폼</h1>
            <p className="text-sm text-gray-500">상상하는 모든 것을 자동으로 제작합니다</p>
          </div>
        </div>

        {/* 자연어 입력 */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: YouTube 비디오 만들고 웹사이트도 만들어줘"
            className="flex-1 px-6 py-4 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
          >
            {isProcessing ? (
              <>
                <Activity className="animate-spin" size={20} />
                처리 중...
              </>
            ) : (
              <>
                <Send size={20} />
                실행
              </>
            )}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 작업 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={24} />
                작업 목록 ({tasks.length})
              </h2>
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  작업이 없습니다. 위에서 작업을 요청해보세요.
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 10).map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 border-2 rounded-xl ${getStatusColor(task.status)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="font-semibold text-gray-800">{task.description}</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-white rounded">
                          {task.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {task.assignedAgent && (
                          <div>에이전트: {agents.find((a) => a.id === task.assignedAgent)?.name || task.assignedAgent}</div>
                        )}
                        {task.completedAt && (
                          <div>
                            완료 시간: {new Date(task.completedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                      {task.output && (
                        <div className="mt-2 p-2 bg-white rounded text-sm">
                          {JSON.stringify(task.output, null, 2)}
                        </div>
                      )}
                      {task.error && (
                        <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                          오류: {task.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 에이전트 상태 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={24} />
              AI 에이전트 ({agents.length})
            </h2>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-4 border-2 rounded-xl ${
                    agent.isAvailable ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="font-semibold text-gray-800 mb-1">{agent.name}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    타입: {agent.type}
                  </div>
                  <div className="text-xs space-y-1">
                    <div>완료: {agent.stats.completed}</div>
                    <div>실패: {agent.stats.failed}</div>
                    <div>평균 시간: {agent.stats.avgTime.toFixed(1)}초</div>
                  </div>
                  {agent.currentTask && (
                    <div className="mt-2 text-xs text-blue-600">
                      작업 중: {tasks.find((t) => t.id === agent.currentTask)?.description || agent.currentTask}
                    </div>
                  )}
                  <div className={`mt-2 text-xs px-2 py-1 rounded inline-block ${
                    agent.isAvailable ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {agent.isAvailable ? '사용 가능' : '작업 중'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

