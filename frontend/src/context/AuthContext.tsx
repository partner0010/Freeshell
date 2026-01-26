"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, LoginCredentials, RegisterData, TokenResponse, AuthState } from "@/types/auth";
import { authApi, tokenStorage } from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 토큰 확인 및 사용자 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      const storedAccessToken = tokenStorage.getAccessToken();
      const storedRefreshToken = tokenStorage.getRefreshToken();

      if (storedAccessToken && storedRefreshToken) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Failed to load user:", error);
          tokenStorage.clearTokens();
          setAccessToken(null);
          setRefreshToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 로그아웃 이벤트 리스너
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  // 토큰 자동 갱신 (15분마다)
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const interval = setInterval(async () => {
      try {
        const tokenData = await authApi.refresh();
        setAccessToken(tokenData.access_token);
        setRefreshToken(tokenData.refresh_token);
      } catch (error) {
        console.error("Auto refresh failed:", error);
        // 갱신 실패 시 로그아웃 처리
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        tokenStorage.clearTokens();
      }
    }, 14 * 60 * 1000); // 14분마다 (15분 만료 전에 갱신)

    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const tokenData: TokenResponse = await authApi.login(credentials);
      setAccessToken(tokenData.access_token);
      setRefreshToken(tokenData.refresh_token);

      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      await authApi.register(data);
      // 회원가입 후 자동 로그인
      await login({ email: data.email, password: data.password });
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
