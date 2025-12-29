'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 실제 비밀번호 재설정 로직
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-pink-500 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Shell</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">비밀번호 재설정</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isSent
                ? '비밀번호 재설정 링크를 이메일로 전송했습니다.'
                : '이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.'}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50"
              >
                {isLoading ? '전송 중...' : '재설정 링크 보내기'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {email}로 비밀번호 재설정 링크를 전송했습니다.
                이메일을 확인해주세요.
              </p>
            </div>
          )}

          <Link
            href="/auth/login"
            className="mt-6 flex items-center justify-center text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            로그인으로 돌아가기
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

