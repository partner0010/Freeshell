/**
 * 게시판 페이지
 * 카테고리별 자유 게시판
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Search, Filter, Clock, User, Heart,
  MessageCircle, Eye, TrendingUp, Bell, FileText,
  Lightbulb, Bug, BookOpen, Sparkles, Users, Plus
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
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categories = [
  { id: 'all', label: '전체', icon: MessageSquare, color: 'bg-gray-500' },
  { id: 'notice', label: '공지사항', icon: Bell, color: 'bg-red-500' },
  { id: 'idea', label: '아이디어', icon: Lightbulb, color: 'bg-yellow-500' },
  { id: 'bug', label: '버그 리포트', icon: Bug, color: 'bg-orange-500' },
  { id: 'guide', label: '가이드', icon: BookOpen, color: 'bg-blue-500' },
  { id: 'project', label: '프로젝트', icon: Sparkles, color: 'bg-purple-500' },
  { id: 'free', label: '자유', icon: Users, color: 'bg-green-500' },
];

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'comments'>('recent');

  // 예시 데이터 (나중에 API에서 가져옴)
  const posts: Post[] = [
    {
      id: '1',
      title: '새로운 AI 기능 업데이트 안내',
      content: '최신 AI 기능이 추가되었습니다. 더 강력한 검색 기능을 체험해보세요!',
      author: '관리자',
      category: 'notice',
      likes: 45,
      comments: 12,
      views: 256,
      isPinned: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: '번역 기능 개선 제안',
      content: '번역 기능에 더 많은 언어를 추가해주세요. 특히 동남아시아 언어들을...',
      author: '사용자1',
      category: 'idea',
      likes: 28,
      comments: 8,
      views: 134,
      isPinned: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: '이미지 검색에서 오류 발생',
      content: '이미지 검색을 사용하다가 에러가 발생했습니다. 스크린샷 첨부합니다.',
      author: '사용자2',
      category: 'bug',
      likes: 5,
      comments: 3,
      views: 67,
      isPinned: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: '4',
      title: 'AI 검색 활용 가이드',
      content: 'AI 검색을 더 효과적으로 사용하는 방법을 정리했습니다...',
      author: '사용자3',
      category: 'guide',
      likes: 32,
      comments: 6,
      views: 189,
      isPinned: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
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

  const getCategory = (id: string) => {
    return categories.find(c => c.id === id) || categories[0];
  };

  const filteredPosts = posts
    .filter(post => {
      if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
      if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // 고정 게시물 먼저
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'comments') return b.comments - a.comments;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  게시판
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  자유롭게 이야기를 나누고 정보를 공유하세요
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* 검색 */}
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="게시글 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* 정렬 옵션 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  인기순
                </button>
                <button
                  onClick={() => setSortBy('comments')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'comments'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  댓글순
                </button>
              </div>

              {/* 글쓰기 버튼 */}
              <Link
                href="/community/forum/create"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} />
                글쓰기
              </Link>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? `${category.color} text-white`
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 게시글 목록 */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {filteredPosts.length}개의 게시글
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPosts.map((post, index) => {
                const category = getCategory(post.category);
                const CategoryIcon = category.icon;
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      post.isPinned ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                    }`}
                  >
                    <Link href={`/community/forum/${post.id}`}>
                      <div className="flex items-start gap-4">
                        {/* 카테고리 아이콘 */}
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <CategoryIcon className="text-white" size={20} />
                        </div>

                        {/* 게시글 내용 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {post.isPinned && (
                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded">
                                  고정
                                </span>
                              )}
                              <span className={`px-2 py-1 ${category.color} text-white text-xs font-semibold rounded`}>
                                {category.label}
                              </span>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User size={16} />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>{getTimeAgo(post.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart size={16} />
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle size={16} />
                              <span>{post.comments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye size={16} />
                              <span>{post.views}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {filteredPosts.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={64} />
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  게시글이 없습니다
                </p>
                <Link
                  href="/community/forum/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Plus size={20} />
                  첫 번째 글 작성하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

