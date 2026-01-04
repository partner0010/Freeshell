/**
 * 게시글 작성 페이지
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, AlertCircle, CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const categories = [
  { id: 'notice', label: '공지사항', icon: '📢' },
  { id: 'idea', label: '아이디어', icon: '💡' },
  { id: 'bug', label: '버그 리포트', icon: '🐛' },
  { id: 'guide', label: '가이드', icon: '📚' },
  { id: 'project', label: '프로젝트', icon: '🎨' },
  { id: 'free', label: '자유', icon: '💬' },
];

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('free');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    // API 호출 (나중에 구현)
    try {
      // const response = await fetch('/api/community/forum', { ... });
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      
      alert('게시글이 등록되었습니다.');
      router.push('/community/forum');
    } catch (error) {
      alert('게시글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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

          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              게시글 작성
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              자유롭게 이야기를 나누고 정보를 공유하세요
            </p>
          </div>

          {/* 작성 폼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        category === cat.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {cat.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="게시글 제목을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  maxLength={200}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {title.length}/200
                </p>
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`게시글 내용을 작성하세요.

마크다운 문법을 사용할 수 있습니다:
- **굵게**
- *기울임*
- \`코드\`
- [링크](url)
- 리스트`}
                  rows={16}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  마크다운 문법을 사용할 수 있습니다
                </p>
              </div>

              {/* 안내 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-1">게시글 작성 가이드</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>적절한 카테고리를 선택해주세요</li>
                      <li>명확하고 구체적인 내용을 작성해주세요</li>
                      <li>욕설, 비방, 스팸은 금지됩니다</li>
                      <li>버그 리포트는 구체적인 재현 방법을 포함해주세요</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/community/forum"
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      게시글 등록
                    </>
                  )}
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

