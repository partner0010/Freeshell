/**
 * 프로젝트 갤러리 페이지
 * 사용자 프로젝트 공유 및 탐색
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Search, Filter, Heart, Eye, MessageCircle,
  ExternalLink, Calendar, User, Tag, TrendingUp, Grid, List
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  likes: number;
  views: number;
  comments: number;
  thumbnail?: string;
  url?: string;
  createdAt: Date;
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'likes'>('recent');

  // 예시 데이터 (나중에 API에서 가져옴)
  const projects: Project[] = [
    {
      id: '1',
      title: 'AI 기반 자동 번역 시스템',
      description: 'Google Gemini API를 활용한 실시간 다국어 번역 시스템입니다. 여러 언어를 동시에 번역할 수 있습니다.',
      author: '개발자1',
      tags: ['AI', '번역', 'Gemini'],
      likes: 45,
      views: 234,
      comments: 12,
      url: 'https://example.com/project1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: '이미지 검색 통합 도구',
      description: 'Pexels, Unsplash, Pixabay를 통합하여 한 곳에서 이미지를 검색하고 다운로드할 수 있는 도구입니다.',
      author: '개발자2',
      tags: ['이미지', '검색', '통합'],
      likes: 32,
      views: 189,
      comments: 8,
      url: 'https://example.com/project2',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'AI 콘텐츠 제작 자동화',
      description: 'AI를 활용하여 블로그 글, SNS 포스트, 이미지를 자동으로 생성하는 워크플로우입니다.',
      author: '개발자3',
      tags: ['AI', '자동화', '콘텐츠'],
      likes: 67,
      views: 356,
      comments: 15,
      url: 'https://example.com/project3',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const popularTags = ['AI', '번역', '이미지', '검색', '자동화', '통합', '콘텐츠', 'Gemini'];

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 30) return `${Math.floor(days / 30)}개월 전`;
    if (days > 0) return `${days}일 전`;
    return '오늘';
  };

  const filteredProjects = projects
    .filter(project => {
      if (selectedTag && !project.tags.includes(selectedTag)) return false;
      if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !project.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.views - a.views;
      if (sortBy === 'likes') return b.likes - a.likes;
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
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  프로젝트 갤러리
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  사용자들이 만든 프로젝트를 탐색하고 공유하세요
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
                    placeholder="프로젝트 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* 정렬 및 보기 모드 */}
              <div className="flex items-center gap-2">
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      sortBy === 'recent'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      sortBy === 'popular'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    인기순
                  </button>
                  <button
                    onClick={() => setSortBy('likes')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      sortBy === 'likes'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    좋아요순
                  </button>
                </div>
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 사이드바 - 인기 태그 */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Tag size={20} />
                  인기 태그
                </h2>
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
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    필터 제거
                  </button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    프로젝트 공유하기
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    여러분의 프로젝트를 공유하고 피드백을 받아보세요.
                  </p>
                  <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                    프로젝트 등록
                  </button>
                </div>
              </div>
            </aside>

            {/* 프로젝트 목록 */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {filteredProjects.length}개의 프로젝트
                  {selectedTag && (
                    <span className="ml-2 text-primary">태그: {selectedTag}</span>
                  )}
                </h2>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {/* 썸네일 */}
                      <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center relative overflow-hidden">
                        {project.thumbnail ? (
                          <Image 
                            src={project.thumbnail} 
                            alt={project.title} 
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Sparkles className="text-white" size={64} />
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        {/* 태그 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(tag)}
                              className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* 통계 */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User size={16} />
                              <span>{project.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>{getTimeAgo(project.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Heart size={16} />
                              <span>{project.likes}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Eye size={16} />
                              <span>{project.views}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <MessageCircle size={16} />
                              <span>{project.comments}</span>
                            </div>
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        {project.url && (
                          <div className="mt-4">
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                            >
                              <ExternalLink size={18} />
                              프로젝트 보기
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex gap-6">
                        {/* 썸네일 */}
                        <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                          {project.thumbnail ? (
                            <Image 
                              src={project.thumbnail} 
                              alt={project.title} 
                              fill
                              className="object-cover rounded-lg"
                              unoptimized
                            />
                          ) : (
                            <Sparkles className="text-white" size={48} />
                          )}
                        </div>

                        {/* 내용 */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {project.description}
                          </p>

                          {/* 태그 */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>

                          {/* 메타 정보 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User size={16} />
                                <span>{project.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>{getTimeAgo(project.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <Heart size={16} />
                                <span>{project.likes}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <Eye size={16} />
                                <span>{project.views}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <MessageCircle size={16} />
                                <span>{project.comments}</span>
                              </div>
                              {project.url && (
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm"
                                >
                                  <ExternalLink size={16} />
                                  보기
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredProjects.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <Sparkles className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={64} />
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    프로젝트가 없습니다
                  </p>
                  <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    첫 번째 프로젝트 등록하기
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

