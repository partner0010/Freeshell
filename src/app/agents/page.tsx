'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Play, CheckCircle, XCircle, Loader2, Zap, Search, Image, Code, Clock, Calendar, Workflow, Repeat, Settings, BarChart3, FileText, Cloud } from 'lucide-react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { agentManager, type Agent, type AgentTask } from '@/lib/ai/agents';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { AdBanner } from '@/components/ads/AdBanner';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [activeTab, setActiveTab] = useState<'agents' | 'workflows' | 'scheduled' | 'history'>('agents');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);

  useEffect(() => {
    loadAgents();
    loadTasks();
  }, []);

  const loadAgents = () => {
    const allAgents = agentManager.getAllAgents();
    setAgents(allAgents);
  };

  const loadTasks = () => {
    const allTasks = agentManager.getAllTasks();
    setTasks(allTasks);
  };

  const handleCreateTask = async () => {
    if (!selectedAgent || !taskInput.trim()) {
      alert('에이전트를 선택하고 작업 내용을 입력하세요.');
      return;
    }

    try {
      const task = agentManager.createTask({
        agentId: selectedAgent.id,
        type: 'generate',
        input: { prompt: taskInput },
      });

      setTasks([...tasks, task]);
      const currentInput = taskInput;
      setTaskInput('');

      // 작업 실행
      try {
        await agentManager.executeTask(task.id);
        loadTasks();
        // 성공 메시지 (선택사항)
        console.log('작업이 성공적으로 실행되었습니다.');
      } catch (error: any) {
        console.error('작업 실행 오류:', error);
        alert(`작업 실행 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`);
        loadTasks(); // 상태 업데이트를 위해 다시 로드
      }
    } catch (error: any) {
      console.error('작업 생성 오류:', error);
      alert(`작업 생성 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      case 'processing':
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
      default:
        return <Loader2 className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <GlobalHeader />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Bot className="text-purple-600" size={32} />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
              AI 에이전트
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            자동화된 AI 에이전트로 복잡한 작업을 자동으로 처리하세요
          </p>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 border-b border-gray-200 mb-8">
          {[
            { id: 'agents', label: '에이전트', icon: Bot },
            { id: 'workflows', label: '워크플로우', icon: Workflow },
            { id: 'scheduled', label: '스케줄', icon: Calendar },
            { id: 'history', label: '히스토리', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className="inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 워크플로우 탭 */}
        {activeTab === 'workflows' && (
          <div className="space-y-6 mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">워크플로우 자동화</h2>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <Workflow size={18} />
                  새 워크플로우
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: '일일 리포트 생성', steps: 3, status: 'active', icon: FileText },
                  { name: '콘텐츠 자동 생성', steps: 5, status: 'active', icon: Sparkles },
                  { name: '데이터 백업', steps: 2, status: 'paused', icon: Cloud },
                ].map((workflow, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <workflow.icon className="text-purple-600" size={24} />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{workflow.name}</h3>
                        <p className="text-sm text-gray-600">{workflow.steps}단계</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        workflow.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {workflow.status === 'active' ? '활성' : '일시정지'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                        실행
                      </button>
                      <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                        편집
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 스케줄 탭 */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6 mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">예약된 작업</h2>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <Calendar size={18} />
                  새 스케줄
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: '매일 오전 9시 리포트 생성', agent: '리포트 에이전트', nextRun: '2025-01-16 09:00', frequency: 'daily' },
                  { name: '주간 데이터 분석', agent: '분석 에이전트', nextRun: '2025-01-20 00:00', frequency: 'weekly' },
                  { name: '월간 백업', agent: '백업 에이전트', nextRun: '2025-02-01 00:00', frequency: 'monthly' },
                ].map((schedule, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="text-purple-600" size={20} />
                          <h3 className="font-bold text-gray-900">{schedule.name}</h3>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>에이전트: {schedule.agent}</p>
                          <p>다음 실행: {schedule.nextRun}</p>
                          <p>빈도: {schedule.frequency === 'daily' ? '매일' : schedule.frequency === 'weekly' ? '매주' : '매월'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          활성
                        </button>
                        <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                          편집
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 에이전트 탭 */}
        {activeTab === 'agents' && (
          <>
            {/* 에이전트 목록 */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all cursor-pointer ${
                selectedAgent?.id === agent.id
                  ? 'border-purple-500 shadow-xl'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bot className="text-white" size={24} />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    agent.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : agent.status === 'idle'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {agent.status === 'active' ? '활성' : agent.status === 'idle' ? '대기' : '오류'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 작업 생성 */}
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedAgent.name}로 작업 생성
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  작업 입력
                </label>
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="에이전트에게 수행할 작업을 입력하세요..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none min-h-[120px]"
                />
              </div>
              <button
                onClick={handleCreateTask}
                disabled={!taskInput.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play size={20} />
                작업 실행
              </button>
            </div>
          </motion.div>
        )}
          </>
        )}

        {/* 히스토리 탭 */}
        {activeTab === 'history' && (
          <>
            {/* 작업 목록 */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">작업 히스토리</h2>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="text-gray-400 mx-auto mb-4" size={64} />
              <p className="text-gray-600">아직 생성된 작업이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => {
                const agent = agents.find((a) => a.id === task.agentId);
                return (
                  <div
                    key={task.id}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="font-semibold text-gray-900">
                            {agent?.name || '알 수 없음'}
                          </h3>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {task.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {typeof task.input === 'string'
                            ? task.input
                            : JSON.stringify(task.input)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {task.createdAt.toLocaleString('ko-KR')}
                      </div>
                    </div>
                    {task.output && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">
                          {typeof task.output === 'string'
                            ? task.output
                            : JSON.stringify(task.output, null, 2)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
          </>
        )}

        {/* 광고 배너 */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <AdBanner position="inline" />
        </div>
      </div>
    </div>
  );
}

