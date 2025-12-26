'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Play, Pause, Trash2, Plus, Sparkles,
  Video, Image, BookOpen, FileText, Mic, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { GlobalHeader } from '@/components/layout/GlobalHeader';

interface Schedule {
  id: string;
  config: {
    topic: string;
    contentType: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    multilingual?: boolean;
  };
  nextRun: string;
  lastRun?: string;
  status: 'active' | 'paused' | 'completed';
  runCount: number;
}

const contentTypeIcons: Record<string, any> = {
  'short-video': Video,
  'image': Image,
  'video': Play,
  'ebook': BookOpen,
  'blog': FileText,
  'audio': Mic,
};

const frequencyLabels: Record<string, string> = {
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  custom: '사용자 정의',
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // agents 페이지로 리다이렉트 (중복 제거)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/agents?tab=scheduled';
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await fetch('/api/schedule');
      const data = await response.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (error) {
      console.error('스케줄 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const response = await fetch('/api/schedule/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (data.success) {
        loadSchedules();
      }
    } catch (error) {
      console.error('스케줄 토글 오류:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 스케줄을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/schedule?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        loadSchedules();
      }
    } catch (error) {
      console.error('스케줄 삭제 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <GlobalHeader />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2">
              자동 생성 스케줄
            </h1>
            <p className="text-xl text-gray-600">
              콘텐츠를 자동으로 생성하고 배포하는 스케줄을 관리하세요
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            새 스케줄
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
            <Calendar className="text-gray-400 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">스케줄이 없습니다</h3>
            <p className="text-gray-600 mb-6">새 스케줄을 추가하여 자동 콘텐츠 생성을 시작하세요</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              첫 스케줄 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => {
              const Icon = contentTypeIcons[schedule.config.contentType] || Video;
              return (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {schedule.config.topic}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {frequencyLabels[schedule.config.frequency]}
                          </span>
                          {schedule.config.time && (
                            <span className="flex items-center gap-1">
                              <Clock size={16} />
                              {schedule.config.time}
                            </span>
                          )}
                          {schedule.config.multilingual && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                              전세계 수익화
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          다음 실행: {new Date(schedule.nextRun).toLocaleString('ko-KR')}
                          {schedule.lastRun && (
                            <> | 마지막 실행: {new Date(schedule.lastRun).toLocaleString('ko-KR')}</>
                          )}
                          {schedule.runCount > 0 && <> | 실행 횟수: {schedule.runCount}</>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(schedule.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          schedule.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={schedule.status === 'active' ? '일시정지' : '재개'}
                      >
                        {schedule.status === 'active' ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        schedule.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {schedule.status === 'active' ? '활성' : '일시정지'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 스케줄 추가 폼 */}
        {showAddForm && (
          <ScheduleForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              loadSchedules();
            }}
          />
        )}
      </div>
    </div>
  );
}

function ScheduleForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    topic: '',
    contentType: 'short-video',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    multilingual: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: formData }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        alert(data.error || '스케줄 생성 실패');
      }
    } catch (error: any) {
      alert(`스케줄 생성 중 오류: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">새 스케줄 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">주제</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="예: AI로 시작하는 부업"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">콘텐츠 유형</label>
            <select
              value={formData.contentType}
              onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            >
              <option value="short-video">숏폼 영상</option>
              <option value="image">이미지</option>
              <option value="video">동영상</option>
              <option value="ebook">전자책</option>
              <option value="blog">블로그</option>
              <option value="audio">음성</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">빈도</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">실행 시간</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">요일</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              >
                <option value={0}>일요일</option>
                <option value={1}>월요일</option>
                <option value={2}>화요일</option>
                <option value={3}>수요일</option>
                <option value={4}>목요일</option>
                <option value={5}>금요일</option>
                <option value={6}>토요일</option>
              </select>
            </div>
          )}

          {formData.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">일</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: Number(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-lg">
            <input
              type="checkbox"
              id="schedule-multilingual"
              checked={formData.multilingual}
              onChange={(e) => setFormData({ ...formData, multilingual: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="schedule-multilingual" className="text-gray-700 cursor-pointer">
              전세계 수익화 (25개 언어 자동 생성)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? '생성 중...' : '스케줄 추가'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

