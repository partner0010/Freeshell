'use client';

import { useState } from 'react';
import { Sparkles, Plus, Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Task {
  id: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: {
    type: string;
    content: string;
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
              status: data.status || 'completed',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'running': return <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      default: return <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white break-words">Spark 워크스페이스</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">노코드 AI 에이전트로 복잡한 작업 자동화</p>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCreateTask()}
              placeholder="예: 파리 여행 계획 문서 작성, 제품 소개 비디오 제작..."
              className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 text-sm sm:text-base md:text-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary dark:text-white"
              disabled={isProcessing}
            />
            <button
              onClick={handleCreateTask}
              disabled={isProcessing || !prompt.trim()}
              className="px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-purple-600 text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">작업 생성</span>
              <span className="sm:hidden">생성</span>
            </button>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            자연어로 요구사항을 설명하면 AI가 자동으로 처리합니다
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">작업 목록</h3>
          <AnimatePresence>
            {tasks.length === 0 ? (
              <div className="text-center py-8 sm:py-12 md:py-16 text-gray-500 dark:text-gray-400">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base md:text-lg">아직 작업이 없습니다. 위에서 작업을 생성해보세요.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white break-words">{task.prompt}</p>
                      {task.status === 'running' && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">처리 중...</p>
                      )}
                    </div>
                  </div>
                  {task.result && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none">
                        <ReactMarkdown className="text-sm sm:text-base md:text-lg break-words">{task.result.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
