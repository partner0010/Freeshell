'use client';

import { motion } from 'framer-motion';
import { BarChart3, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const usage = {
  searches: { used: 234, limit: 1000, type: '검색' },
  sparks: { used: 45, limit: 100, type: 'Spark 작업' },
  storage: { used: 2.5, limit: 10, type: '저장 공간 (GB)' },
  api: { used: 1200, limit: 5000, type: 'API 호출' },
};

export default function UsagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">사용량</h1>
          <p className="text-gray-600 dark:text-gray-400">현재 플랜의 사용량을 확인하세요</p>
        </div>

        <div className="space-y-6">
          {Object.entries(usage).map(([key, data], index) => {
            const percentage = (data.used / data.limit) * 100;
            const isWarning = percentage > 80;
            const isDanger = percentage > 95;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">{data.type}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {data.used.toLocaleString()} / {data.limit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isDanger && (
                    <div className="flex items-center space-x-2 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">한도 초과 임박</span>
                    </div>
                  )}
                  {isWarning && !isDanger && (
                    <div className="flex items-center space-x-2 text-yellow-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">주의</span>
                    </div>
                  )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isDanger
                        ? 'bg-red-500'
                        : isWarning
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {percentage.toFixed(1)}% 사용됨
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6" />
            <h2 className="text-2xl font-bold">사용량이 부족하신가요?</h2>
          </div>
          <p className="mb-4 opacity-90">
            더 많은 기능과 사용량을 위해 플랜을 업그레이드하세요
          </p>
          <button className="px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            플랜 업그레이드
          </button>
        </motion.div>
      </div>
    </div>
  );
}

