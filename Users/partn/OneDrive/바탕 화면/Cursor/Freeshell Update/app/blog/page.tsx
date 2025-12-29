'use client';

import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

const posts = [
  {
    id: 1,
    title: 'AI 검색 엔진의 미래',
    excerpt: 'AI 기술이 검색 경험을 어떻게 변화시키고 있는지 알아봅니다.',
    author: 'Shell 팀',
    date: '2024-01-15',
    category: '기술',
    image: 'https://via.placeholder.com/400x250',
  },
  {
    id: 2,
    title: 'Spark 워크스페이스 활용 가이드',
    excerpt: '노코드 AI 에이전트로 복잡한 작업을 자동화하는 방법을 소개합니다.',
    author: 'Shell 팀',
    date: '2024-01-10',
    category: '가이드',
    image: 'https://via.placeholder.com/400x250',
  },
  {
    id: 3,
    title: '다중 모달 AI의 가능성',
    excerpt: '텍스트, 이미지, 음성을 통합한 AI 모델의 발전 방향을 살펴봅니다.',
    author: 'Shell 팀',
    date: '2024-01-05',
    category: 'AI',
    image: 'https://via.placeholder.com/400x250',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">블로그</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            최신 소식과 인사이트를 확인하세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="h-48 bg-gradient-to-br from-primary to-secondary"></div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">{post.category}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
                >
                  더 읽기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

