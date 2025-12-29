'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Folder, BarChart3, TrendingUp, Clock, Zap, FileText, Video, Presentation } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const stats = [
  { label: '총 검색', value: '1,234', icon: Search, color: 'text-blue-500' },
  { label: 'Spark 작업', value: '89', icon: Sparkles, color: 'text-purple-500' },
  { label: '저장된 파일', value: '156', icon: Folder, color: 'text-green-500' },
  { label: '사용 시간', value: '24h', icon: Clock, color: 'text-orange-500' },
];

const recentActivity = [
  { type: 'search', title: '파리 여행 계획', time: '2분 전', icon: Search },
  { type: 'spark', title: '비디오 생성 완료', time: '15분 전', icon: Video },
  { type: 'document', title: '프레젠테이션 저장', time: '1시간 전', icon: Presentation },
  { type: 'search', title: 'AI 기술 동향', time: '2시간 전', icon: Search },
];

const usageData = [
  { name: '월', 검색: 45, Spark: 12 },
  { name: '화', 검색: 52, Spark: 15 },
  { name: '수', 검색: 48, Spark: 10 },
  { name: '목', 검색: 61, Spark: 18 },
  { name: '금', 검색: 55, Spark: 14 },
  { name: '토', 검색: 38, Spark: 8 },
  { name: '일', 검색: 42, Spark: 11 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">대시보드</h1>
          <p className="text-gray-600 dark:text-gray-400">활동 요약 및 통계를 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 사용량 차트 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">주간 사용량</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="검색" fill="#6366f1" />
                <Bar dataKey="Spark" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 최근 활동 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">최근 활동</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 빠른 액션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-bold mb-4">빠른 액션</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/#search"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Search className="w-8 h-8 text-primary mb-2" />
              <span className="font-medium">검색</span>
            </Link>
            <Link
              href="/#spark"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Sparkles className="w-8 h-8 text-purple-500 mb-2" />
              <span className="font-medium">Spark</span>
            </Link>
            <Link
              href="/#drive"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Folder className="w-8 h-8 text-green-500 mb-2" />
              <span className="font-medium">드라이브</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-orange-500 mb-2" />
              <span className="font-medium">설정</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

