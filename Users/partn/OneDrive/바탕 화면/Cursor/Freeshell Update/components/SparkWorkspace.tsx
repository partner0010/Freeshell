'use client';

import { useState } from 'react';
import { Sparkles, Plus, Play, Loader2, CheckCircle, XCircle, Video, FileText, Presentation, Globe, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: {
    type: 'video' | 'document' | 'presentation' | 'website' | 'call';
    content: string;
    url?: string;
  };
}

export default function SparkWorkspace() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateTask = async () => {
    if (!prompt.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      prompt: prompt,
      status: 'pending',
    };

    setTasks([newTask, ...tasks]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsProcessing(true);

    try {
      // API 호출
      const response = await fetch('/api/spark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      if (!response.ok) {
        throw new Error('작업 생성 실패');
      }

      const data = await response.json();
      
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { 
              ...task, 
              status: data.status,
              result: data.result
            }
          : task
      ));
    } catch (err) {
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'error' }
          : task
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'presentation': return Presentation;
      case 'website': return Globe;
      case 'call': return Phone;
      default: return FileText;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running': return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Loader2 className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-pink-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Spark 워크스페이스</h2>
            <p className="text-gray-600 dark:text-gray-400">노코드 AI 에이전트로 복잡한 작업 자동화</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
              placeholder="예: 파리 여행 계획 문서 작성, 제품 소개 비디오 제작, 레스토랑 예약 전화..."
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isProcessing}
            />
            <button
              onClick={handleCreateTask}
              disabled={isProcessing || !prompt.trim()}
              className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>작업 생성</span>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            자연어로 요구사항을 설명하면 AI가 자동으로 처리합니다
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">작업 목록</h3>
          <AnimatePresence>
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>아직 작업이 없습니다. 위에서 작업을 생성해보세요.</p>
              </div>
            ) : (
              tasks.map((task) => {
                const Icon = task.result ? getIcon(task.result.type) : FileText;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(task.status)}
                          <p className="font-medium">{task.prompt}</p>
                        </div>
                        {task.result && (
                          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Icon className="w-4 h-4" />
                            <span>{task.result.content}</span>
                            {task.result.url && (
                              <a
                                href={task.result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline ml-2"
                              >
                                결과 보기
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

