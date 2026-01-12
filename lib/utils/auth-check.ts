/**
 * 인증 확인 유틸리티 (중복 제거)
 */
'use client';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export async function checkAuth(): Promise<AuthState> {
  try {
    const response = await fetch('/api/auth/session');
    if (response.ok) {
      const data = await response.json();
      return {
        isAuthenticated: data.authenticated || false,
        isLoading: false,
        user: data.user || null,
      };
    }
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    };
  } catch (error) {
    console.error('인증 확인 실패:', error);
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    };
  }
}
