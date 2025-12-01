import { create } from 'zustand'
import { setSecureToken, getSecureToken, removeSecureToken } from '../utils/security'

interface User {
  id: string
  email: string
  username: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

// 안전한 토큰 조회
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return getSecureToken('token')
}

// 안전한 사용자 정보 조회
function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: typeof window !== 'undefined' ? !!getStoredToken() : false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        // 사용자 정보는 민감하지 않으므로 일반 저장
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
    set({ user, isAuthenticated: !!user })
  },
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        // 토큰은 안전하게 저장
        setSecureToken('token', token)
      } else {
        removeSecureToken('token')
      }
    }
    set({ token, isAuthenticated: !!token })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      removeSecureToken('token')
      // CSRF 토큰도 삭제
      sessionStorage.removeItem('csrf-token')
    }
    set({ user: null, token: null, isAuthenticated: false })
  }
}))

