'use client';

import { motion } from 'framer-motion';
import { Activity, Search, Sparkles, Folder, User, Clock, Filter } from 'lucide-react';
import { useState } from 'react';

const activities = [
  {
    id: '1',
    type: 'search',
    action: '검색 실행',
    details: '파리 여행 계획',
    user: '사용자',
    timestamp: '2024-01-15 14:30',
    icon: Search,
  },
  {
    id: '2',
    type: 'spark',
    action: 'Spark 작업 생성',
    details: '비디오 제작',
    user: '사용자',
    timestamp: '2024-01-15 13:20',
    icon: Sparkles,
  },
  {
    id: '3',
    type: 'drive',
    action: '파일 저장',
    details: '프레젠테이션.pptx',
    user: '사용자',
    timestamp: '2024-01-15 12:15',
    icon: Folder,
  },
  {
    id: '4',
    type: 'search',
    action: '검색 실행',
    details: 'AI 기술 동향',
    user: '팀원 1',
    timestamp: '2024-01-15 11:00',
    icon: Search,
  },
];

export default function ActivityPage() {
  const [filter, setFilter] = useState<'all' | 'search' | 'spark' | 'drive'>('all');

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">활동 로그</h1>
          <p className="text-gray-600 dark:text-gray-400">모든 활동 내역을 확인하세요</p>
        </div>

        <div className="mb-6 flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            {(['all', 'search', 'spark', 'drive'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? '전체' : f === 'search' ? '검색' : f === 'spark' ? 'Spark' : '드라이브'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">{activity.action}</span>
                      <span className="text-gray-500 dark:text-gray-400">·</span>
                      <span className="text-gray-600 dark:text-gray-400">{activity.details}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{activity.user}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

