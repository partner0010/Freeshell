/**
 * 인증이 필요한 라우트 보호
 */

import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  // 로그인 안되어 있으면 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 관리자 권한 필요한데 관리자 아니면
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

