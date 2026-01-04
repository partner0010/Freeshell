/**
 * 질문 상세 페이지
 * 질문 내용, 답변 목록, 답변 작성
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Clock, Tag, ThumbsUp, ThumbsDown,
  CheckCircle, MessageSquare, Send, ArrowUp, ArrowDown,
  Bookmark, Share2, Edit, Trash2, Eye
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Answer {
  id: string;
  author: string;
  content: string;
  votes: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  votes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  answers: Answer[];
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [answerContent, setAnswerContent] = useState('');
  const [questionVote, setQuestionVote] = useState<number>(0);

  // 예시 데이터 (나중에 API에서 가져옴)
  const question: Question = {
    id: params.id as string,
    title: 'AI 검색 API 키 설정 방법이 궁금합니다',
    content: `AI 검색 기능을 사용하려면 API 키가 필요한가요? 
    
설정 방법을 자세히 알려주세요. Google Gemini API 키를 사용하는 것으로 알고 있는데, 정확한 설정 절차를 알고 싶습니다.`,
    author: '사용자1',
    tags: ['AI', '검색', 'API'],
    votes: 15,
    views: 124,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    answers: [
      {
        id: '1',
        author: '관리자',
        content: `네, Google Gemini API 키가 필요합니다. 

설정 방법:
1. Google AI Studio (https://makersuite.google.com/app/apikey)에서 API 키 발급
2. 환경 변수에 GOOGLE_API_KEY 추가
3. 애플리케이션 재시작

이렇게 하시면 AI 검색 기능을 사용할 수 있습니다.`,
        votes: 8,
        isAccepted: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        author: '사용자2',
        content: '무료 티어로도 충분히 사용 가능합니다!',
        votes: 3,
        isAccepted: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ],
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금 전';
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    // 답변 제출 로직 (API 호출)
    setAnswerContent('');
    alert('답변이 등록되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로가기 */}
          <Link
            href="/community/qna"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            질문 목록으로
          </Link>

          {/* 질문 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
          >
            <div className="flex gap-4">
              {/* 투표 */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setQuestionVote(questionVote === 1 ? 0 : 1)}
                  className={`p-2 rounded-lg transition-colors ${
                    questionVote === 1
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ArrowUp size={20} />
                </button>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {question.votes + questionVote}
                </span>
                <button
                  onClick={() => setQuestionVote(questionVote === -1 ? 0 : -1)}
                  className={`p-2 rounded-lg transition-colors ${
                    questionVote === -1
                      ? 'bg-red-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ArrowDown size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                  <Bookmark size={20} />
                </button>
              </div>

              {/* 질문 내용 */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {question.title}
                </h1>

                {/* 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/community/qna?tag=${tag}`}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>

                {/* 질문 본문 */}
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {question.content}
                  </p>
                </div>

                {/* 메타 정보 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{question.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{getTimeAgo(question.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{question.views} 조회</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                      <Share2 size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                      <Edit size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 답변 목록 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={24} />
                {question.answers.length}개의 답변
              </h2>
            </div>

            <div className="space-y-4">
              {question.answers.map((answer, index) => (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 p-6 ${
                    answer.isAccepted
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* 투표 */}
                    <div className="flex flex-col items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                        <ArrowUp size={20} />
                      </button>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {answer.votes}
                      </span>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                        <ArrowDown size={20} />
                      </button>
                      {answer.isAccepted && (
                        <div className="mt-2 p-2 bg-green-500 text-white rounded-lg">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>

                    {/* 답변 내용 */}
                    <div className="flex-1">
                      <div className="prose dark:prose-invert max-w-none mb-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {answer.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User size={16} />
                            <span>{answer.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{getTimeAgo(answer.updatedAt)}</span>
                          </div>
                        </div>
                        {!answer.isAccepted && (
                          <button className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium">
                            채택하기
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 답변 작성 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              답변 작성
            </h2>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="답변을 입력하세요..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  마크다운 문법을 사용할 수 있습니다
                </p>
                <button
                  type="submit"
                  disabled={!answerContent.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                  답변 등록
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

