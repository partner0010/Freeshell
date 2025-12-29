'use client';

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from './ToastNotifications';

interface EmailVerificationProps {
  email: string;
  onVerified?: () => void;
}

export default function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('인증 이메일이 재전송되었습니다.');
    } catch (error) {
      showError('인증 이메일 전송에 실패했습니다.');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">이메일 인증 완료</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            이메일 인증이 필요합니다
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            {email}로 전송된 인증 링크를 확인해주세요.
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-yellow-800 dark:text-yellow-200 hover:underline font-medium disabled:opacity-50"
            >
              {isResending ? '전송 중...' : '인증 이메일 재전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

