'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // 실제로는 API 호출
      setTimeout(() => {
        setIsLoading(false);
        setStatus('success');
      }, 2000);
    } else {
      setIsLoading(false);
      setStatus('error');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-pink-500 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">Shell</span>
          </Link>

          {isLoading ? (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">이메일 인증 중...</h1>
              <p className="text-gray-600 dark:text-gray-400">
                이메일 인증을 확인하고 있습니다.
              </p>
            </>
          ) : status === 'success' ? (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">이메일 인증 완료!</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                이메일이 성공적으로 인증되었습니다.
                이제 모든 기능을 사용하실 수 있습니다.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
              >
                대시보드로 이동
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">인증 실패</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                이메일 인증에 실패했습니다.
                인증 링크가 만료되었거나 유효하지 않을 수 있습니다.
              </p>
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                  로그인으로 이동
                </Link>
                <button className="block w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  인증 이메일 재전송
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
