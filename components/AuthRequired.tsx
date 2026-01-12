/**
 * 인증 필수 컴포넌트
 * 회원가입이 필요한 기능에 표시
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  UserPlus, 
  LogIn, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import EnhancedButton from './EnhancedButton';
import EnhancedCard from './EnhancedCard';

interface AuthRequiredProps {
  message?: string;
  showSignupPrompt?: boolean;
}

export function AuthRequired({ 
  message = '이 기능을 사용하려면 회원가입이 필요합니다.',
  showSignupPrompt = true 
}: AuthRequiredProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated || false);
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">확인 중...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // 인증된 경우 아무것도 표시하지 않음
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <EnhancedCard className="max-w-2xl w-full">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            회원가입이 필요합니다
          </h2>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-blue-900 mb-1">
                  무료로 사용하세요!
                </p>
                <p className="text-sm text-blue-700">
                  {message}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  모든 기능을 무료로 이용할 수 있지만, 회원가입은 필수입니다.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-left text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>모든 기능 무료 사용 가능</span>
            </div>
            <div className="flex items-center gap-2 text-left text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>프로젝트 저장 및 관리</span>
            </div>
            <div className="flex items-center gap-2 text-left text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>템플릿 마켓플레이스 이용</span>
            </div>
            <div className="flex items-center gap-2 text-left text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>AI 기능 및 에디터 사용</span>
            </div>
          </div>

          {showSignupPrompt && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <EnhancedButton
                variant="gradient"
                size="lg"
                onClick={() => router.push('/auth/signup')}
                icon={UserPlus}
                fullWidth
                className="sm:w-auto"
              >
                회원가입하기
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                size="lg"
                onClick={() => router.push('/auth/login')}
                icon={LogIn}
                fullWidth
                className="sm:w-auto"
              >
                로그인하기
              </EnhancedButton>
            </div>
          )}
        </div>
      </EnhancedCard>
    </div>
  );
}

export default AuthRequired;
