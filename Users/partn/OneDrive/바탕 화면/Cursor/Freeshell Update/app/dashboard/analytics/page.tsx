'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Search, Sparkles, Clock, Zap } from 'lucide-react';

const searchData = [
  { name: '월', 검색: 45, Spark: 12 },
  { name: '화', 검색: 52, Spark: 15 },
  { name: '수', 검색: 48, Spark: 10 },
  { name: '목', 검색: 61, Spark: 18 },
  { name: '금', 검색: 55, Spark: 14 },
  { name: '토', 검색: 38, Spark: 8 },
  { name: '일', 검색: 42, Spark: 11 },
];

const categoryData = [
  { name: '검색', value: 341, color: '#6366f1' },
  { name: 'Spark', value: 88, color: '#8b5cf6' },
  { name: '드라이브', value: 156, color: '#10b981' },
];

const topQueries = [
  { query: '파리 여행 계획', count: 23 },
  { query: 'AI 기술 동향', count: 18 },
  { query: '건강한 식단', count: 15 },
  { query: '비즈니스 프레젠테이션', count: 12 },
  { query: '웹 개발 가이드', count: 10 },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">분석</h1>
          <p className="text-gray-600 dark:text-gray-400">사용 통계 및 인사이트를 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: '총 검색', value: '1,234', icon: Search, color: 'text-blue-500' },
            { label: 'Spark 작업', value: '89', icon: Sparkles, color: 'text-purple-500' },
            { label: '평균 응답 시간', value: '2.3초', icon: Clock, color: 'text-green-500' },
            { label: '생산성 향상', value: '+34%', icon: TrendingUp, color: 'text-orange-500' },
          ].map((stat, index) => {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 주간 사용량 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">주간 사용량</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={searchData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="검색" fill="#6366f1" />
                <Bar dataKey="Spark" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 카테고리 분포 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">카테고리 분포</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* 인기 검색어 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-bold mb-4">인기 검색어</h2>
          <div className="space-y-3">
            {topQueries.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{item.query}</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">{item.count}회</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

