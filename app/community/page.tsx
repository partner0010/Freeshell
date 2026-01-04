/**
 * 커뮤니티 메인 페이지
 * AI 솔루션 사용자 커뮤니티의 중심 허브
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, HelpCircle, BookOpen, Users, TrendingUp,
  Clock, ArrowRight, MessageCircle, FileText, Lightbulb,
  Heart, Eye, Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
  createdAt: Date;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'qna' | 'forum' | 'projects'>('all');

  // 예시 데이터 (나중에 API에서 가져옴)
  const recentPosts: Post[] = [
    {
      id: '1',
      title: 'AI 검색 기능 활용 팁',
      content: 'AI 검색을 더 효율적으로 사용하는 방법을 공유합니다...',
      author: '사용자1',
      category: '튜토리얼',
      likes: 24,
      comments: 8,
      views: 156,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: '번역 API 키 설정 방법',
      content: '번역 기능을 사용하려면 API 키가 필요한가요?',
      author: '사용자2',
      category: '질문',
      likes: 12,
      comments: 5,
      views: 89,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: '내가 만든 AI 프로젝트 공유',
      content: 'Shell 솔루션을 활용하여 만든 프로젝트를 공유합니다...',
      author: '사용자3',
      category: '프로젝트',
      likes: 45,
      comments: 12,
      views: 234,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금 전';
  };

  const categories = [
    { id: 'qna', label: '질문과 답변', icon: HelpCircle, color: 'bg-blue-500', href: '/community/qna' },
    { id: 'forum', label: '게시판', icon: MessageSquare, color: 'bg-green-500', href: '/community/forum' },
    { id: 'chat', label: '실시간 채팅', icon: MessageCircle, color: 'bg-purple-500', href: '/community/chat' },
    { id: 'projects', label: '프로젝트 갤러리', icon: Sparkles, color: 'bg-orange-500', href: '/community/projects' },
    { id: 'tutorials', label: '튜토리얼', icon: BookOpen, color: 'bg-pink-500', href: '/community/tutorials' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                커뮤니티
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              AI 솔루션 사용자들과 소통하고 지식을 공유하는 공간입니다
            </p>
          </motion.div>

          {/* 카테고리 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {category.label}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {category.id === 'qna' && '질문하고 답변을 받아보세요'}
                      {category.id === 'forum' && '자유롭게 이야기를 나눠보세요'}
                      {category.id === 'chat' && '실시간으로 소통하세요'}
                      {category.id === 'projects' && '만든 프로젝트를 공유하세요'}
                      {category.id === 'tutorials' && '가이드와 튜토리얼을 확인하세요'}
                    </p>
                    <div className="flex items-center text-primary group-hover:gap-2 transition-all">
                      <span className="text-sm font-semibold">바로가기</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* 최신 게시글 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-primary" size={24} />
                최신 게시글
              </h2>
              <Link
                href="/community/forum"
                className="text-primary hover:text-primary-dark text-sm font-semibold flex items-center gap-1"
              >
                더보기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                          {post.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {post.author}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          {getTimeAgo(post.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 빠른 시작 안내 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 sm:p-8 border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-start gap-4">
              <Lightbulb className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  커뮤니티 이용 가이드
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>질문과 답변</strong>: 궁금한 점을 물어보고 답변을 받아보세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>게시판</strong>: 아이디어를 제안하거나 버그를 신고하세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>실시간 채팅</strong>: 다른 사용자들과 실시간으로 소통하세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>프로젝트 갤러리</strong>: 만든 프로젝트를 자랑하고 피드백을 받아보세요</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

