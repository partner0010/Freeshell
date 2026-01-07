'use client';

import { useState, useEffect } from 'react';
import { Brain, Play, Pause, Settings, TrendingUp, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AutoLearningPanel() {
  const [isLearning, setIsLearning] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/learning/auto?action=status');
      const data = await response.json();
      if (data.success) {
        setIsLearning(data.isLearning);
        setStats(data.stats);
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error('학습 상태 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // 5초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const handleStartLearning = async (duration: number = 60) => {
    setLoading(true);
    try {
      const response = await fetch('/api/learning/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', duration }),
      });
      const data = await response.json();
      if (data.success) {
        setIsLearning(true);
        setTimeout(fetchStatus, 2000);
      }
    } catch (error) {
      console.error('학습 시작 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (updates: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/learning/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule', schedule: updates }),
      });
      const data = await response.json();
      if (data.success) {
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error('스케줄 업데이트 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">자동 학습 시스템</h2>
            <p className="text-sm text-gray-600">네트워크를 이용한 자연스러운 학습</p>
          </div>
        </div>
        {isLearning && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-semibold">학습 중...</span>
          </div>
        )}
      </div>

      {/* 학습 상태 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">총 학습</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}개</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">오늘 학습</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.todayTasks}개</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900">학습 주제</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.topicsLearned.length}개</div>
          </div>
        </div>
      )}

      {/* 학습 스케줄 */}
      {schedule && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              학습 스케줄
            </h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={(e) => handleUpdateSchedule({ enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">자동 학습 활성화</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">학습 시간:</span>
              <span className="ml-2 font-semibold text-gray-900">{schedule.startTime}</span>
            </div>
            <div>
              <span className="text-gray-600">학습 기간:</span>
              <span className="ml-2 font-semibold text-gray-900">{schedule.duration}분</span>
            </div>
            <div>
              <span className="text-gray-600">주기:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {schedule.interval === 'daily' ? '매일' : '매주'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">학습 주제:</span>
              <span className="ml-2 font-semibold text-gray-900">{schedule.topics?.length || 0}개</span>
            </div>
          </div>
        </div>
      )}

      {/* 학습 주제 목록 */}
      {schedule?.topics && schedule.topics.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">학습 주제 목록</h3>
          <div className="flex flex-wrap gap-2">
            {schedule.topics.slice(0, 10).map((topic: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                {topic}
              </span>
            ))}
            {schedule.topics.length > 10 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{schedule.topics.length - 10}개
              </span>
            )}
          </div>
        </div>
      )}

      {/* 수동 학습 시작 */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">수동 학습 시작</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleStartLearning(30)}
            disabled={isLearning || loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>30분 학습</span>
          </button>
          <button
            onClick={() => handleStartLearning(60)}
            disabled={isLearning || loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>1시간 학습</span>
          </button>
          <button
            onClick={() => handleStartLearning(120)}
            disabled={isLearning || loading}
            className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>2시간 학습</span>
          </button>
        </div>
      </div>

      {/* 학습 방법 설명 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          학습 방법
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 웹 검색을 통한 정보 수집 (DuckDuckGo, Wikipedia)</li>
          <li>• AI 자가 학습 (AI가 스스로 질문하고 답변)</li>
          <li>• 지식 베이스 개선 및 보완</li>
          <li>• 학습된 지식은 자동으로 응답에 활용됩니다</li>
        </ul>
      </div>
    </div>
  );
}

