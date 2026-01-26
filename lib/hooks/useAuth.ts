/**
 * 인증 상태 확인 훅
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  refresh: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    refresh: async () => {},
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: data.authenticated || false,
          isLoading: false,
          user: data.user || null,
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          user: null,
        }));
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        user: null,
      }));
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // 페이지 포커스 시 인증 상태 재확인
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAuth]);

  return {
    ...authState,
    refresh: checkAuth,
  };
}
