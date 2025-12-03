/**
 * 관리자 전용 라우트 보호
 * - 로그인 확인
 * - 관리자 권한 확인
 * - 계정 활성화 확인
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ReactNode, useEffect } from 'react'
import { Shield, AlertCircle } from 'lucide-react'

interface AdminRouteProps {
  children: ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    console.log('👮 AdminRoute 권한 체크:', {
      authenticated: isAuthenticated,
      user: user,
      role: user?.role,
      isAdmin: user?.role === 'admin'
    })
  }, [isAuthenticated, user])

  // 1. 로그인 확인
  if (!isAuthenticated) {
    console.log('❌ 로그인 안됨 - 로그인 페이지로 리다이렉트')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. 사용자 정보 없음
  if (!user) {
    console.log('❌ 사용자 정보 없음 - 로그인 페이지로 리다이렉트')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. 관리자 권한 확인
  if (user.role !== 'admin') {
    console.log('❌ 관리자 권한 없음 - 홈으로 리다이렉트')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">접근 권한 없음</h1>
            <p className="text-gray-400 text-lg mb-6">
              이 페이지는 관리자만 접근할 수 있습니다.
            </p>
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>현재 역할: {user.role}</span>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 4. 계정 활성화 확인
  if (user.isActive === false) {
    console.log('❌ 비활성화된 계정')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">계정 비활성화</h1>
            <p className="text-gray-400 text-lg">
              이 계정은 현재 비활성화 상태입니다.<br />
              관리자에게 문의하세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 5. 모든 확인 통과 - 관리자 페이지 표시
  console.log('✅ 관리자 권한 확인 완료')
  return <>{children}</>
}

