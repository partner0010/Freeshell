'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { ScheduleConfig } from '@/lib/scheduling/scheduler';

interface ScheduleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleCreateModal({ isOpen, onClose, onSuccess }: ScheduleCreateModalProps) {
  const { showToast } = useToast();
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [time, setTime] = useState('09:00');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const handleSubmit = async () => {
    if (!topic.trim()) {
      showToast({ type: 'error', message: '주제를 입력하세요.' });
      return;
    }

    const config: ScheduleConfig = {
      topic,
      contentType,
      frequency,
      time,
      ...(frequency === 'weekly' && { dayOfWeek }),
      ...(frequency === 'monthly' && { dayOfMonth }),
    };

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        showToast({ type: 'success', message: '스케줄이 생성되었습니다.' });
        setTopic('');
        setContentType('blog');
        setFrequency('daily');
        setTime('09:00');
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        showToast({ type: 'error', message: data.error || '스케줄 생성에 실패했습니다.' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: `스케줄 생성 실패: ${error.message}` });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl p-6 w-full max-w-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">새 스케줄 생성</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                주제
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 일일 기술 뉴스 요약"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                콘텐츠 타입
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              >
                <option value="blog">블로그</option>
                <option value="video">영상</option>
                <option value="image">이미지</option>
                <option value="text">텍스트</option>
                <option value="code">코드</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                빈도
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                실행 시간
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>

            {frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  요일
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
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

            {frequency === 'monthly' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  일
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                생성
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

