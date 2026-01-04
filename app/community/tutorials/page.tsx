/**
 * 튜토리얼 페이지
 * 사용자 제작 튜토리얼 및 가이드
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Search, Filter, Star, Clock, User, Eye,
  ThumbsUp, MessageCircle, Tag, Play, TrendingUp, BookMarked
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  rating: number;
  reviews: number;
  views: number;
  likes: number;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent');

  // 예시 데이터 (나중에 API에서 가져옴)
  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Google Gemini API로 AI 검색 구현하기',
      description: 'Google Gemini API를 사용하여 AI 검색 기능을 구현하는 방법을 단계별로 설명합니다.',
      author: '튜토리얼 작성자1',
      tags: ['AI', 'Gemini', '검색', 'API'],
      rating: 4.8,
      reviews: 24,
      views: 456,
      likes: 67,
      duration: '30분',
      difficulty: 'intermediate',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: '이미지 검색 API 통합 가이드',
      description: 'Pexels, Unsplash, Pixabay API를 통합하여 이미지 검색 기능을 만드는 방법입니다.',
      author: '튜토리얼 작성자2',
      tags: ['이미지', 'API', '통합'],
      rating: 4.5,
      reviews: 18,
      views: 289,
      likes: 42,
      duration: '20분',
      difficulty: 'beginner',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: '고급 AI 워크플로우 설계',
      description: '복잡한 AI 워크플로우를 설계하고 최적화하는 고급 기법을 다룹니다.',
      author: '튜토리얼 작성자3',
      tags: ['AI', '워크플로우', '최적화'],
      rating: 4.9,
      reviews: 31,
      views: 623,
      likes: 89,
      duration: '60분',
      difficulty: 'advanced',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const popularTags = ['AI', 'Gemini', 'API', '검색', '이미지', '번역', '자동화', '통합'];

  const difficultyLabels = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 30) return `${Math.floor(days / 30)}개월 전`;
    if (days > 0) return `${days}일 전`;
    return '오늘';
  };

  const filteredTutorials = tutorials
    .filter(tutorial => {
      if (selectedTag && !tutorial.tags.includes(selectedTag)) return false;
      if (difficultyFilter && tutorial.difficulty !== difficultyFilter) return false;
      if (searchQuery && !tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.views - a.views;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  튜토리얼
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  사용자들이 작성한 가이드와 튜토리얼을 탐색하세요
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
                    placeholder="튜토리얼 검색..."
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
                  onClick={() => setSortBy('rating')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'rating'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  평점순
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 사이드바 - 필터 */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Filter size={20} />
                  필터
                </h2>

                {/* 난이도 필터 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    난이도
                  </h3>
                  <div className="space-y-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => setDifficultyFilter(difficultyFilter === difficulty ? null : difficulty)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          difficultyFilter === difficulty
                            ? difficultyColors[difficulty]
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {difficultyLabels[difficulty]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 인기 태그 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    인기 태그
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTag === tag
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {(selectedTag || difficultyFilter) && (
                    <button
                      onClick={() => {
                        setSelectedTag(null);
                        setDifficultyFilter(null);
                      }}
                      className="mt-4 text-sm text-primary hover:underline"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* 튜토리얼 목록 */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {filteredTutorials.length}개의 튜토리얼
                  {(selectedTag || difficultyFilter) && (
                    <span className="ml-2 text-primary text-base font-normal">
                      {selectedTag && `태그: ${selectedTag}`}
                      {selectedTag && difficultyFilter && ', '}
                      {difficultyFilter && `난이도: ${difficultyLabels[difficultyFilter as keyof typeof difficultyLabels]}`}
                    </span>
                  )}
                </h2>
              </div>

              <div className="space-y-4">
                {filteredTutorials.map((tutorial, index) => (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex gap-6">
                      {/* 아이콘 */}
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="text-white" size={32} />
                      </div>

                      {/* 내용 */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {tutorial.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {tutorial.description}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[tutorial.difficulty]}`}>
                            {difficultyLabels[tutorial.difficulty]}
                          </span>
                        </div>

                        {/* 태그 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tutorial.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(tag)}
                              className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs font-medium rounded hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* 메타 정보 */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User size={16} />
                              <span>{tutorial.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>{tutorial.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{tutorial.rating}</span>
                              <span className="text-gray-400">({tutorial.reviews})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Eye size={16} />
                              <span>{tutorial.views}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <ThumbsUp size={16} />
                              <span>{tutorial.likes}</span>
                            </div>
                            <Link
                              href={`/community/tutorials/${tutorial.id}`}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                            >
                              <Play size={16} />
                              보기
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTutorials.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <BookOpen className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={64} />
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    튜토리얼이 없습니다
                  </p>
                  <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    첫 번째 튜토리얼 작성하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

