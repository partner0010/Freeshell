/**
 * 질문과 답변 페이지
 * Stack Overflow 스타일 Q&A 시스템
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle, Search, Filter, TrendingUp, Clock, User,
  ThumbsUp, MessageCircle, CheckCircle, Tag, ArrowRight,
  Plus, ArrowUp, ArrowDown, Bookmark
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  hasAcceptedAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function QnAPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');

  // 예시 데이터 (나중에 API에서 가져옴)
  const questions: Question[] = [
    {
      id: '1',
      title: 'AI 검색 API 키 설정 방법이 궁금합니다',
      content: 'AI 검색 기능을 사용하려면 API 키가 필요한가요? 설정 방법을 알려주세요.',
      author: '사용자1',
      tags: ['AI', '검색', 'API'],
      votes: 15,
      answers: 3,
      views: 124,
      hasAcceptedAnswer: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: '번역 기능에서 지원하는 언어 목록',
      content: '어떤 언어들을 번역할 수 있나요? 전체 목록을 알려주세요.',
      author: '사용자2',
      tags: ['번역', '언어'],
      votes: 8,
      answers: 2,
      views: 89,
      hasAcceptedAnswer: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: '이미지 검색 결과를 다운로드하는 방법',
      content: '이미지 검색 결과에서 이미지를 다운로드하려면 어떻게 해야 하나요?',
      author: '사용자3',
      tags: ['이미지', '검색', '다운로드'],
      votes: 22,
      answers: 5,
      views: 156,
      hasAcceptedAnswer: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ];

  const popularTags = ['AI', '검색', '번역', '이미지', 'API', '설정', '문제해결', '튜토리얼'];

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금 전';
  };

  const filteredQuestions = questions.filter(q => {
    if (selectedTag && !q.tags.includes(selectedTag)) return false;
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !q.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.votes - a.votes;
    if (sortBy === 'unanswered') return a.answers - b.answers;
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  질문과 답변
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  궁금한 점을 물어보고 답변을 공유하세요
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* 검색 및 필터 */}
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="질문 검색..."
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
                  onClick={() => setSortBy('unanswered')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'unanswered'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  미답변
                </button>
              </div>

              {/* 질문 작성 버튼 */}
              <Link
                href="/community/qna/ask"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} />
                질문하기
              </Link>
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
                    도움이 되었나요?
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    질문과 답변에 투표하고 채택하여 커뮤니티를 도와주세요.
                  </p>
                </div>
              </div>
            </aside>

            {/* 질문 목록 */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {filteredQuestions.length}개의 질문
                  {selectedTag && (
                    <span className="ml-2 text-primary">태그: {selectedTag}</span>
                  )}
                </h2>
              </div>

              <div className="space-y-4">
                {filteredQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* 투표 및 답변 수 */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {question.votes}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">투표</div>
                        </div>
                        <div className={`text-center px-3 py-1 rounded ${
                          question.answers > 0
                            ? question.hasAcceptedAnswer
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          <div className="text-lg font-bold">{question.answers}</div>
                          <div className="text-xs">답변</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {question.views}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">조회</div>
                        </div>
                      </div>

                      {/* 질문 내용 */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            href={`/community/qna/${question.id}`}
                            className="flex-1"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors mb-2">
                              {question.title}
                              {question.hasAcceptedAnswer && (
                                <CheckCircle className="inline-block ml-2 text-green-500" size={18} />
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                              {question.content}
                            </p>
                          </Link>
                        </div>

                        {/* 태그 */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {question.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedTag(tag);
                              }}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* 메타 정보 */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User size={16} />
                              <span>{question.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>{getTimeAgo(question.updatedAt)}</span>
                            </div>
                          </div>
                          <Link
                            href={`/community/qna/${question.id}`}
                            className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors"
                          >
                            <span>보기</span>
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredQuestions.length === 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <HelpCircle className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={64} />
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      질문이 없습니다
                    </p>
                    <Link
                      href="/community/qna/ask"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <Plus size={20} />
                      첫 번째 질문하기
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

