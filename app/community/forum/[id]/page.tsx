/**
 * 게시글 상세 페이지
 * 게시글 내용, 댓글 목록, 댓글 작성
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Clock, Heart, MessageCircle, Eye,
  Share2, Edit, Trash2, Send, MoreVertical
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Comment {
  id: string;
  author: string;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  likes: number;
  comments: Comment[];
  views: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function PostDetailPage() {
  const params = useParams();
  const [commentContent, setCommentContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 예시 데이터 (나중에 API에서 가져옴)
  const post: Post = {
    id: params.id as string,
    title: '번역 기능 개선 제안',
    content: `번역 기능에 더 많은 언어를 추가해주세요. 

특히 동남아시아 언어들(태국어, 베트남어, 인도네시아어 등)을 추가하면 좋을 것 같습니다.

현재 지원하는 언어가 많지만, 동남아시아 사용자들도 많이 사용하실 것 같아서 제안드립니다.`,
    author: '사용자1',
    category: 'idea',
    likes: 28,
    comments: [
      {
        id: '1',
        author: '관리자',
        content: '좋은 제안 감사합니다! 검토 후 반영하겠습니다.',
        likes: 5,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        author: '사용자2',
        content: '저도 동의합니다. 동남아시아 언어 지원이 필요해요.',
        likes: 3,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
    views: 134,
    isPinned: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
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

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      notice: '공지사항',
      idea: '아이디어',
      bug: '버그 리포트',
      guide: '가이드',
      project: '프로젝트',
      free: '자유',
    };
    return categories[category] || category;
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    // 댓글 제출 로직 (API 호출)
    setCommentContent('');
    alert('댓글이 등록되었습니다.');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(likeCount + (isLiked ? -1 : 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로가기 */}
          <Link
            href="/community/forum"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            게시판으로
          </Link>

          {/* 게시글 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-6"
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {post.isPinned && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded">
                    고정
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded">
                  {getCategoryLabel(post.category)}
                </span>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            {/* 게시글 본문 */}
            <div className="prose dark:prose-invert max-w-none mb-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                <span>{post.likes + likeCount}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <MessageCircle size={18} />
                <span>{post.comments.length}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Share2 size={18} />
                공유
              </button>
            </div>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                  <Eye size={16} />
                  <span>{post.views} 조회</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                  <Edit size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-600 dark:text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 댓글 목록 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageCircle size={24} />
                {post.comments.length}개의 댓글
              </h2>
            </div>

            <div className="space-y-4">
              {post.comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="prose dark:prose-invert max-w-none mb-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{comment.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{getTimeAgo(comment.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                        <Heart size={16} />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 text-sm">
                        답글
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 댓글 작성 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              댓글 작성
            </h2>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  마크다운 문법을 사용할 수 있습니다
                </p>
                <button
                  type="submit"
                  disabled={!commentContent.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                  댓글 등록
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

