'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { History, Clock, User, ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';

const versions = [
  {
    id: 'v3',
    version: 3,
    content: '최신 버전',
    author: '사용자',
    timestamp: '2024-01-15 14:30',
    changes: '전체 내용 업데이트',
  },
  {
    id: 'v2',
    version: 2,
    content: '이전 버전',
    author: '사용자',
    timestamp: '2024-01-15 10:20',
    changes: '섹션 추가',
  },
  {
    id: 'v1',
    version: 1,
    content: '초기 버전',
    author: '사용자',
    timestamp: '2024-01-15 09:00',
    changes: '최초 생성',
  },
];

export default function HistoryPage() {
  const params = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/spark/${params.id}`}
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Link>
          <div className="flex items-center space-x-3">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">버전 히스토리</h1>
          </div>
        </div>

        <div className="space-y-4">
          {versions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      v{version.version}
                    </span>
                    {index === 0 && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                        현재 버전
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{version.changes}</p>
                </div>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>복원</span>
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{version.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{version.timestamp}</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm">{version.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

