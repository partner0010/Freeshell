'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Play, CheckCircle, XCircle, Loader2, Zap, Search, Image, Code, Clock, Calendar, Workflow as WorkflowIcon, Repeat, Settings, BarChart3, FileText, Cloud, Video, Music, BookOpen, Mic, Type, FileEdit, Sparkles, Brain, Download, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { agentManager, type Agent, type AgentTask } from '@/lib/ai/agents';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { AdBanner } from '@/components/ads/AdBanner';
import { useToast } from '@/components/ui/Toast';
import { workflowManager, type Workflow } from '@/lib/automation/workflow-manager';
import { WorkflowCreateModal } from '@/components/agents/WorkflowCreateModal';
import { WorkflowEditModal } from '@/components/agents/WorkflowEditModal';
import { ScheduleCreateModal } from '@/components/agents/ScheduleCreateModal';
import { contentScheduler, type ScheduleConfig } from '@/lib/scheduling/scheduler';
// 자율AI와 학습시스템은 관리자 전용으로 이동 (일반 사용자에게는 불필요)
import { getCSRFToken } from '@/lib/utils/csrf-client';

export default function AgentsPage() {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskInput, setTaskInput] = useState('');
        const [activeTab, setActiveTab] = useState<'create' | 'agents' | 'workflows' | 'scheduled' | 'history'>('create');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadAgents();
    loadTasks();
    loadWorkflows();
    loadScheduledTasks();
    
    // URL 쿼리 파라미터에서 탭 확인
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['create', 'autonomous', 'agents', 'workflows', 'scheduled', 'history'].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  // 작업 실행 중 상태 업데이트를 위한 주기적 새로고침
  useEffect(() => {
    if (isExecuting) {
      const interval = setInterval(() => {
        loadTasks();
      }, 1000); // 1초마다 업데이트
      return () => clearInterval(interval);
    }
  }, [isExecuting]);

  // 스케줄 자동 체크 및 실행 (1분마다)
  useEffect(() => {
    const checkSchedules = async () => {
      try {
        const response = await fetch('/api/schedule/execute');
        if (response.ok) {
          const data = await response.json();
          if (data.executed > 0) {
            showToast({
              type: 'success',
              message: `${data.executed}개의 스케줄이 자동 실행되었습니다.`,
            });
            loadScheduledTasks();
            loadTasks(); // 히스토리 업데이트
          }
        }
      } catch (error) {
        // 조용히 실패 (로그만 출력)
        if (process.env.NODE_ENV === 'development') {
          console.debug('스케줄 자동 체크 실패:', error);
        }
      }
    };

    // 초기 체크
    checkSchedules();

    // 1분마다 체크
    const interval = setInterval(checkSchedules, 60000);
    return () => clearInterval(interval);
  }, [showToast]);

  // 워크플로우/스케줄 목록 자동 새로고침 (5분마다)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadWorkflows();
      loadScheduledTasks();
    }, 300000); // 5분마다

    return () => clearInterval(refreshInterval);
  }, []);

  const loadAgents = () => {
    const allAgents = agentManager.getAllAgents();
    setAgents(allAgents);
  };

  const loadTasks = () => {
    const allTasks = agentManager.getAllTasks();
    // 최신 작업이 먼저 오도록 정렬
    const sortedTasks = [...allTasks].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    setTasks(sortedTasks);
  };

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        const workflows = data.data || [];
        if (workflows.length > 0) {
          setWorkflows(workflows);
          return;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('워크플로우 로드 실패:', error);
      }
    }

    // 폴백: 로컬 워크플로우 매니저 사용
    if (typeof window !== 'undefined' && workflowManager) {
      const allWorkflows = workflowManager.getAllWorkflows();
      setWorkflows(allWorkflows.length > 0 ? allWorkflows : [
        {
          id: 'workflow-1',
          name: '일일 리포트 생성',
          description: '매일 자동으로 리포트를 생성합니다',
          steps: [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 5,
        },
        {
          id: 'workflow-2',
          name: '콘텐츠 자동 생성',
          description: '주제에 따라 콘텐츠를 자동 생성합니다',
          steps: [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 12,
        },
        {
          id: 'workflow-3',
          name: '데이터 백업',
          description: '정기적으로 데이터를 백업합니다',
          steps: [],
          status: 'paused',
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 3,
        },
      ]);
    } else {
      // 기본 워크플로우 예시
      setWorkflows([
        {
          id: 'workflow-1',
          name: '일일 리포트 생성',
          description: '매일 자동으로 리포트를 생성합니다',
          steps: [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 5,
        },
        {
          id: 'workflow-2',
          name: '콘텐츠 자동 생성',
          description: '주제에 따라 콘텐츠를 자동 생성합니다',
          steps: [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 12,
        },
        {
          id: 'workflow-3',
          name: '데이터 백업',
          description: '정기적으로 데이터를 백업합니다',
          steps: [],
          status: 'paused',
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 3,
        },
      ]);
    }
  };

  const loadScheduledTasks = async () => {
    try {
      const response = await fetch('/api/schedule');
      if (response.ok) {
        const data = await response.json();
        const schedules = data.data || [];
        if (schedules.length > 0) {
          setScheduledTasks(schedules.map((job: any) => ({
            id: job.id,
            name: `${job.config.topic} - ${job.config.contentType}`,
            agent: job.config.contentType,
            nextRun: new Date(job.nextRun).toLocaleString('ko-KR'),
            frequency: job.config.frequency,
            status: job.status,
          })));
        } else {
          // 기본 스케줄 예시
          setScheduledTasks([
            {
              id: 'schedule-1',
              name: '매일 오전 9시 리포트 생성',
              agent: '리포트 에이전트',
              nextRun: '2025-01-16 09:00',
              frequency: 'daily',
              status: 'active',
            },
            {
              id: 'schedule-2',
              name: '주간 데이터 분석',
              agent: '분석 에이전트',
              nextRun: '2025-01-20 00:00',
              frequency: 'weekly',
              status: 'active',
            },
            {
              id: 'schedule-3',
              name: '월간 백업',
              agent: '백업 에이전트',
              nextRun: '2025-02-01 00:00',
              frequency: 'monthly',
              status: 'active',
            },
          ]);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('스케줄 로드 실패:', error);
      }
      // 기본 스케줄 예시
      setScheduledTasks([
        {
          id: 'schedule-1',
          name: '매일 오전 9시 리포트 생성',
          agent: '리포트 에이전트',
          nextRun: '2025-01-16 09:00',
          frequency: 'daily',
          status: 'active',
        },
        {
          id: 'schedule-2',
          name: '주간 데이터 분석',
          agent: '분석 에이전트',
          nextRun: '2025-01-20 00:00',
          frequency: 'weekly',
          status: 'active',
        },
        {
          id: 'schedule-3',
          name: '월간 백업',
          agent: '백업 에이전트',
          nextRun: '2025-02-01 00:00',
          frequency: 'monthly',
          status: 'active',
        },
      ]);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedAgent || !taskInput.trim()) {
      showToast({
        type: 'warning',
        message: '에이전트를 선택하고 작업 내용을 입력하세요.',
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          task: taskInput,
          type: 'generate',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast({
          type: 'success',
          message: '작업이 성공적으로 실행되었습니다!',
        });
        setTaskInput('');
        setActiveTab('history');
        loadTasks();
        setIsExecuting(false);
      } else {
        const errorData = await response.json();
        showToast({
          type: 'error',
          message: errorData.error || '작업 실행에 실패했습니다.',
        });
        setIsExecuting(false);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('작업 실행 오류:', error);
      }
      showToast({
        type: 'error',
        message: `작업 실행 실패: ${error.message}`,
      });
      setIsExecuting(false);
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Bot className="text-purple-600 w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900">
              AI 에이전트
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            자동화된 AI 에이전트로 복잡한 작업을 자동으로 처리하세요
          </p>
        </div>

        {/* 탭 메뉴 - 반응형 디자인 개선 */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'create', label: '콘텐츠 생성', icon: Sparkles },
            { id: 'agents', label: '에이전트', icon: Bot },
            { id: 'workflows', label: '워크플로우', icon: WorkflowIcon },
            { id: 'scheduled', label: '스케줄', icon: Calendar },
            { id: 'history', label: '히스토리', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] inline mr-1 sm:mr-2" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* 콘텐츠 생성 탭 */}
        {activeTab === 'create' && (
          <div className="space-y-6 mb-12">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">콘텐츠 생성</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">원하는 콘텐츠 타입을 선택하고 생성하세요</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { 
                    id: 'video', 
                    name: '영상 생성', 
                    icon: Video, 
                    color: 'from-red-500 to-pink-500',
                    description: 'AI로 영상 콘텐츠 생성'
                  },
                  { 
                    id: 'image', 
                    name: '이미지 생성', 
                    icon: Image, 
                    color: 'from-purple-500 to-indigo-500',
                    description: 'AI로 이미지 생성'
                  },
                  { 
                    id: 'text', 
                    name: '텍스트 생성', 
                    icon: Type, 
                    color: 'from-blue-500 to-cyan-500',
                    description: 'AI로 텍스트 콘텐츠 생성'
                  },
                  { 
                    id: 'code', 
                    name: '코드 생성', 
                    icon: Code, 
                    color: 'from-green-500 to-emerald-500',
                    description: 'AI로 코드 생성'
                  },
                  { 
                    id: 'audio', 
                    name: '음성 생성', 
                    icon: Mic, 
                    color: 'from-orange-500 to-red-500',
                    description: 'AI로 음성 생성'
                  },
                  { 
                    id: 'music', 
                    name: '노래 생성', 
                    icon: Music, 
                    color: 'from-pink-500 to-rose-500',
                    description: 'AI로 음악 생성'
                  },
                  { 
                    id: 'ebook', 
                    name: '전자책 생성', 
                    icon: BookOpen, 
                    color: 'from-indigo-500 to-purple-500',
                    description: 'AI로 전자책 생성'
                  },
                  { 
                    id: 'blog', 
                    name: '블로그 포스팅', 
                    icon: FileEdit, 
                    color: 'from-teal-500 to-green-500',
                    description: 'AI로 블로그 포스팅 생성'
                  },
                ].map((contentType) => {
                  const Icon = contentType.icon;
                  return (
                    <motion.button
                      key={contentType.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedContentType(contentType.id)}
                      className={`p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border-2 transition-all ${
                        selectedContentType === contentType.id
                          ? 'border-purple-500 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br ${contentType.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 mx-auto`}>
                        <Icon className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 text-center text-xs sm:text-sm md:text-base">{contentType.name}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center">{contentType.description}</p>
                    </motion.button>
                  );
                })}
              </div>

              {/* 선택된 콘텐츠 타입에 대한 생성 폼 */}
              {selectedContentType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border-2 border-purple-200"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {selectedContentType === 'video' && '영상 생성'}
                    {selectedContentType === 'image' && '이미지 생성'}
                    {selectedContentType === 'text' && '텍스트 생성'}
                    {selectedContentType === 'code' && '코드 생성'}
                    {selectedContentType === 'audio' && '음성 생성'}
                    {selectedContentType === 'music' && '노래 생성'}
                    {selectedContentType === 'ebook' && '전자책 생성'}
                    {selectedContentType === 'blog' && '블로그 포스팅 생성'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {selectedContentType === 'video' && '영상 주제 또는 스크립트'}
                        {selectedContentType === 'image' && '이미지 설명'}
                        {selectedContentType === 'text' && '텍스트 주제'}
                        {selectedContentType === 'code' && '코드 요구사항'}
                        {selectedContentType === 'audio' && '음성 텍스트'}
                        {selectedContentType === 'music' && '노래 주제 또는 스타일'}
                        {selectedContentType === 'ebook' && '전자책 주제'}
                        {selectedContentType === 'blog' && '블로그 포스팅 주제'}
                      </label>
                      <textarea
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        placeholder={
                          selectedContentType === 'video' ? '예: "고양이의 일상 생활에 대한 3분 영상"'
                          : selectedContentType === 'image' ? '예: "태양이 지는 해변의 풍경"'
                          : selectedContentType === 'text' ? '예: "AI의 미래에 대한 기사"'
                          : selectedContentType === 'code' ? '예: "React로 Todo 앱 만들기"'
                          : selectedContentType === 'audio' ? '예: "안녕하세요, 오늘 날씨가 좋네요"'
                          : selectedContentType === 'music' ? '예: "신나는 팝송 스타일의 노래"'
                          : selectedContentType === 'ebook' ? '예: "초보자를 위한 프로그래밍 가이드"'
                          : '예: "최신 AI 트렌드에 대한 블로그 포스팅"'
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none min-h-[120px]"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (!taskInput.trim()) {
                            showToast({
                              type: 'warning',
                              message: '내용을 입력하세요.',
                            });
                            return;
                          }
                          
                          setIsExecuting(true);
                          
                          try {
                            // 콘텐츠 타입에 맞는 에이전트 찾기 또는 생성
                            let agent = agents.find(a => 
                              (selectedContentType === 'video' && a.capabilities.includes('video-generation')) ||
                              (selectedContentType === 'image' && a.capabilities.includes('image-generation')) ||
                              (selectedContentType === 'text' && a.capabilities.includes('text-generation')) ||
                              (selectedContentType === 'code' && a.capabilities.includes('code-generation')) ||
                              (selectedContentType === 'audio' && a.capabilities.includes('audio-generation')) ||
                              (selectedContentType === 'music' && a.capabilities.includes('music-generation')) ||
                              (selectedContentType === 'ebook' && a.capabilities.includes('ebook-generation')) ||
                              (selectedContentType === 'blog' && a.capabilities.includes('blog-generation'))
                            );
                            
                            if (!agent) {
                              // 기본 콘텐츠 생성 에이전트 사용
                              agent = agents.find(a => a.id === 'content-agent') || agents[0];
                            }
                            
                            if (!agent) {
                              showToast({
                                type: 'warning',
                                message: '사용 가능한 에이전트가 없습니다.',
                              });
                              setIsExecuting(false);
                              return;
                            }
                            
                            // 콘텐츠 생성 API 직접 호출
                            const contentTypeMap: Record<string, string> = {
                              'video': 'short-video',
                              'image': 'image',
                              'text': 'blog',
                              'code': 'code',
                              'audio': 'audio',
                              'music': 'music',
                              'ebook': 'ebook',
                              'blog': 'blog',
                            };

                            const apiContentType = contentTypeMap[selectedContentType] || selectedContentType;
                            
                            // CSRF 토큰 가져오기
                            const csrfToken = getCSRFToken();
                            
                            const headers: HeadersInit = { 
                              'Content-Type': 'application/json',
                            };
                            
                            if (csrfToken) {
                              headers['X-CSRF-Token'] = csrfToken;
                            }
                            
                            const response = await fetch('/api/content/generate', {
                              method: 'POST',
                              headers,
                              credentials: 'include', // 쿠키 포함
                              body: JSON.stringify({
                                contentType: apiContentType,
                                topic: taskInput,
                                options: {},
                              }),
                            });

                            if (response.ok) {
                              const data = await response.json();
                              // 생성된 콘텐츠 저장
                              setGeneratedContent({
                                ...data.data,
                                contentType: apiContentType,
                                topic: taskInput,
                                createdAt: new Date(),
                              });
                              showToast({
                                type: 'success',
                                message: '콘텐츠가 성공적으로 생성되었습니다.',
                              });
                              setTaskInput('');
                              setSelectedContentType(null);
                              setShowPreview(true);
                              loadTasks();
                              setIsExecuting(false);
                            } else {
                              const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
                              if (process.env.NODE_ENV === 'development') {
                                console.error('콘텐츠 생성 오류:', errorData);
                              }
                              showToast({
                                type: 'error',
                                message: errorData.error || errorData.message || '콘텐츠 생성에 실패했습니다.',
                              });
                              setIsExecuting(false);
                            }
                          } catch (error: any) {
                            if (process.env.NODE_ENV === 'development') {
                              console.error('작업 생성 오류:', error);
                            }
                            showToast({
                              type: 'error',
                              message: `작업 생성 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`,
                            });
                            setIsExecuting(false);
                          }
                        }}
                        disabled={!taskInput.trim() || isExecuting}
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isExecuting ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            생성 중...
                          </>
                        ) : (
                          <>
                            <Sparkles size={20} />
                            생성하기
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContentType(null);
                          setTaskInput('');
                        }}
                        className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 생성된 콘텐츠 미리보기 */}
            {showPreview && generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-purple-200"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    생성된 콘텐츠 미리보기
                  </h3>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setGeneratedContent(null);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="미리보기 닫기"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* 콘텐츠 타입별 미리보기 */}
                  {generatedContent.type === 'blog' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{generatedContent.title || generatedContent.post?.title}</h4>
                        <p className="text-sm text-gray-600 mb-4">{generatedContent.excerpt || generatedContent.post?.excerpt}</p>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: generatedContent.content || generatedContent.post?.content || '' }} />
                      </div>
                      {generatedContent.keywords && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">키워드:</p>
                          <div className="flex flex-wrap gap-2">
                            {generatedContent.keywords.map((keyword: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {generatedContent.type === 'ebook' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900">{generatedContent.title || generatedContent.ebook?.title}</h4>
                      {generatedContent.coverUrl && (
                        <img src={generatedContent.coverUrl} alt="표지" className="w-full max-w-xs mx-auto rounded-lg shadow-lg" />
                      )}
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: generatedContent.content || generatedContent.ebook?.content || '' }} />
                    </div>
                  )}

                  {generatedContent.type === 'shortform' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900">숏폼 콘텐츠</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{generatedContent.script || generatedContent.content?.description}</p>
                      </div>
                      {generatedContent.hashtags && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">해시태그:</p>
                          <div className="flex flex-wrap gap-2">
                            {generatedContent.hashtags.map((tag: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {generatedContent.type === 'music' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900">{generatedContent.title || generatedContent.track?.title}</h4>
                      <p className="text-gray-600">장르: {generatedContent.genre || generatedContent.track?.genre}</p>
                      <p className="text-gray-600">분위기: {generatedContent.mood || generatedContent.track?.mood}</p>
                      {generatedContent.url && (
                        <audio controls className="w-full">
                          <source src={generatedContent.url} type="audio/mpeg" />
                          브라우저가 오디오 태그를 지원하지 않습니다.
                        </audio>
                      )}
                    </div>
                  )}

                  {/* 다운로드 버튼 */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        let content = '';
                        let filename = '';

                        if (generatedContent.type === 'blog') {
                          content = `# ${generatedContent.title || generatedContent.post?.title}\n\n${generatedContent.excerpt || generatedContent.post?.excerpt}\n\n${generatedContent.content || generatedContent.post?.content || ''}`;
                          filename = `${generatedContent.title || 'blog-post'}.md`;
                        } else if (generatedContent.type === 'ebook') {
                          content = `# ${generatedContent.title || generatedContent.ebook?.title}\n\n${generatedContent.content || generatedContent.ebook?.content || ''}`;
                          filename = `${generatedContent.title || 'ebook'}.md`;
                        } else if (generatedContent.type === 'shortform') {
                          content = `${generatedContent.script || generatedContent.content?.description || ''}\n\n해시태그: ${generatedContent.hashtags?.join(' ') || ''}`;
                          filename = 'shortform-content.md';
                        } else if (generatedContent.type === 'music') {
                          content = JSON.stringify(generatedContent, null, 2);
                          filename = `${generatedContent.title || 'music'}.json`;
                        } else {
                          content = JSON.stringify(generatedContent, null, 2);
                          filename = 'content.json';
                        }

                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        a.click();
                        URL.revokeObjectURL(url);

                        showToast({
                          type: 'success',
                          message: '콘텐츠가 다운로드되었습니다.',
                        });
                      }}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      다운로드
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        setGeneratedContent(null);
                        setSelectedContentType(null);
                      }}
                      className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* 워크플로우 탭 */}
        {activeTab === 'workflows' && (
          <div className="space-y-6 mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">워크플로우 자동화</h2>
                <button
                  onClick={() => setIsCreatingWorkflow(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <WorkflowIcon size={18} />
                  새 워크플로우
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {workflows.map((workflow) => {
                  const iconMap: Record<string, any> = {
                    '일일 리포트 생성': FileText,
                    '콘텐츠 자동 생성': Sparkles,
                    '데이터 백업': Cloud,
                  };
                  const Icon = iconMap[workflow.name] || FileText;
                  
                  return (
                    <div key={workflow.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="text-purple-600" size={24} />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{workflow.name}</h3>
                          <p className="text-sm text-gray-600">{workflow.steps?.length || 0}단계 • {workflow.runCount || 0}회 실행</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          workflow.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {workflow.status === 'active' ? '활성' : '일시정지'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              setIsExecuting(true);
                              const response = await fetch(`/api/workflows/${workflow.id}/run`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                showToast({
                                  type: 'success',
                                  message: data.message || '워크플로우가 실행되었습니다.',
                                });
                                loadWorkflows();
                                loadTasks(); // 히스토리 업데이트
                              } else {
                                const data = await response.json();
                                showToast({
                                  type: 'error',
                                  message: data.error || '워크플로우 실행에 실패했습니다.',
                                });
                              }
                            } catch (error: any) {
                              showToast({
                                type: 'error',
                                message: `실행 실패: ${error.message}`,
                              });
                            } finally {
                              setIsExecuting(false);
                            }
                          }}
                          disabled={workflow.status !== 'active' || isExecuting}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isExecuting ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              실행 중...
                            </>
                          ) : (
                            '실행'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingWorkflow(workflow);
                            setIsEditingWorkflow(true);
                          }}
                          className="px-3 py-2 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 text-sm"
                        >
                          편집
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/workflows/${workflow.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  status: workflow.status === 'active' ? 'paused' : 'active',
                                }),
                              });
                              
                              if (response.ok) {
                                showToast({
                                  type: 'success',
                                  message: workflow.status === 'active' ? '워크플로우가 일시정지되었습니다.' : '워크플로우가 활성화되었습니다.',
                                });
                                loadWorkflows();
                              } else {
                                const data = await response.json();
                                showToast({
                                  type: 'error',
                                  message: data.error || '워크플로우 상태 변경에 실패했습니다.',
                                });
                              }
                            } catch (error: any) {
                              showToast({
                                type: 'error',
                                message: `상태 변경 실패: ${error.message}`,
                              });
                            }
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          {workflow.status === 'active' ? '일시정지' : '활성화'}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                <button
                  onClick={() => setIsCreatingSchedule(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Calendar size={18} />
                  새 스케줄
                </button>
              </div>
              <div className="space-y-4">
                {scheduledTasks.map((schedule) => (
                  <div key={schedule.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
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
                          {schedule.status && (
                            <p className={`text-xs ${schedule.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                              상태: {schedule.status === 'active' ? '활성' : '일시정지'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              setIsExecuting(true);
                              const response = await fetch('/api/schedule/execute', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ scheduleId: schedule.id }),
                              });
                              if (response.ok) {
                                const data = await response.json();
                                showToast({
                                  type: 'success',
                                  message: data.message || '스케줄이 실행되었습니다.',
                                });
                                loadScheduledTasks();
                                loadTasks(); // 히스토리 업데이트
                              } else {
                                const errorData = await response.json();
                                showToast({
                                  type: 'error',
                                  message: errorData.error || '스케줄 실행에 실패했습니다.',
                                });
                              }
                            } catch (error: any) {
                              showToast({
                                type: 'error',
                                message: `스케줄 실행 실패: ${error.message}`,
                              });
                            } finally {
                              setIsExecuting(false);
                            }
                          }}
                          disabled={schedule.status !== 'active' || isExecuting}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isExecuting ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              실행 중...
                            </>
                          ) : (
                            '실행'
                          )}
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/schedule/${schedule.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  status: schedule.status === 'active' ? 'paused' : 'active',
                                }),
                              });
                              if (response.ok) {
                                showToast({
                                  type: 'success',
                                  message: schedule.status === 'active' ? '스케줄이 일시정지되었습니다.' : '스케줄이 활성화되었습니다.',
                                });
                                loadScheduledTasks();
                              }
                            } catch (error: any) {
                              showToast({
                                type: 'error',
                                message: `스케줄 업데이트 실패: ${error.message}`,
                              });
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            schedule.status === 'active'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {schedule.status === 'active' ? '일시정지' : '활성화'}
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/schedule/${schedule.id}`, {
                                method: 'DELETE',
                              });
                              if (response.ok) {
                                showToast({
                                  type: 'success',
                                  message: '스케줄이 삭제되었습니다.',
                                });
                                loadScheduledTasks();
                              }
                            } catch (error: any) {
                              showToast({
                                type: 'error',
                                message: `스케줄 삭제 실패: ${error.message}`,
                              });
                            }
                          }}
                          className="px-3 py-2 bg-red-200 text-red-700 rounded-lg hover:bg-red-300 text-sm"
                        >
                          삭제
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
                disabled={!taskInput.trim() || isExecuting || !selectedAgent}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    작업 실행 중...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    작업 실행
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
          </>
        )}

        {/* 자율AI와 학습시스템은 관리자 페이지(/admin/learning)로 이동 */}

        {/* 히스토리 탭 */}
        {activeTab === 'history' && (
          <>
            {/* 작업 목록 */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">작업 히스토리</h2>
            <button
              onClick={loadTasks}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <Repeat size={16} />
              새로고침
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="text-gray-400 mx-auto mb-4" size={64} />
              <p className="text-gray-600">아직 생성된 작업이 없습니다</p>
              <p className="text-sm text-gray-500 mt-2">에이전트를 선택하고 작업을 생성해보세요</p>
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
                        <p className="text-sm font-medium text-gray-700 mb-1">입력:</p>
                        <p className="text-sm text-gray-600 mb-3">
                          {typeof task.input === 'string'
                            ? task.input
                            : task.input?.prompt || JSON.stringify(task.input)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {task.createdAt.toLocaleString('ko-KR')}
                      </div>
                    </div>
                    {task.output && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">결과:</p>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {typeof task.output === 'string'
                            ? task.output
                            : task.output.content || task.output.data || JSON.stringify(task.output, null, 2)}
                        </div>
                      </div>
                    )}
                    {task.status === 'processing' && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Loader2 className="animate-spin" size={16} />
                          <span className="text-sm font-medium">작업 실행 중...</span>
                        </div>
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

      {/* 모달 */}
      <WorkflowCreateModal
        isOpen={isCreatingWorkflow}
        onClose={() => setIsCreatingWorkflow(false)}
        onSuccess={() => {
          loadWorkflows();
          setIsCreatingWorkflow(false);
        }}
      />
      <WorkflowEditModal
        isOpen={isEditingWorkflow}
        onClose={() => {
          setIsEditingWorkflow(false);
          setEditingWorkflow(null);
        }}
        onSuccess={() => {
          loadWorkflows();
          setIsEditingWorkflow(false);
          setEditingWorkflow(null);
        }}
        workflow={editingWorkflow}
      />
      <ScheduleCreateModal
        isOpen={isCreatingSchedule}
        onClose={() => setIsCreatingSchedule(false)}
        onSuccess={() => {
          loadScheduledTasks();
          setIsCreatingSchedule(false);
        }}
      />
    </div>
  );
}

