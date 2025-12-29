'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Settings, BarChart3, FileText, AlertCircle, CheckCircle, XCircle, Activity, Database, Key, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSearches: number;
  totalGenerations: number;
  apiUsage: number;
  systemStatus: 'healthy' | 'warning' | 'error';
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSearches: 0,
    totalGenerations: 0,
    apiUsage: 0,
    systemStatus: 'healthy',
  });
  const router = useRouter();

  useEffect(() => {
    // 관리자 인증 확인
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }
      
      // 토큰 검증 (실제로는 서버에서 검증)
      try {
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
          loadStats();
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadStats = async () => {
    // 실제로는 API에서 통계 데이터 가져오기
    setStats({
      totalUsers: 1234,
      activeUsers: 567,
      totalSearches: 8901,
      totalGenerations: 3456,
      apiUsage: 78.5,
      systemStatus: 'healthy',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Shell 통합 AI 솔루션 관리</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
              }}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">전체 사용자</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">활성 사용자</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <Activity className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 검색 수</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalSearches.toLocaleString()}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API 사용률</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.apiUsage}%</p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* 시스템 상태 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {stats.systemStatus === 'healthy' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : stats.systemStatus === 'warning' ? (
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">시스템 상태</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.systemStatus === 'healthy' ? '정상 작동 중' : stats.systemStatus === 'warning' ? '주의 필요' : '오류 발생'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/admin/users')}
          >
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">사용자 관리</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">사용자 목록, 권한 관리, 계정 상태 확인</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/admin/analytics')}
          >
            <BarChart3 className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">분석 및 통계</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">사용량 통계, API 사용량, 트렌드 분석</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/admin/settings')}
          >
            <Settings className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">시스템 설정</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">환경 변수, API 키, 시스템 구성</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/admin/api-keys')}
          >
            <Key className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">API 키 관리</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">OpenAI, Anthropic, Google API 키 관리</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/admin/logs')}
          >
            <FileText className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">로그 관리</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">시스템 로그, 에러 로그, 접근 로그</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/admin/domains')}
          >
            <Globe className="w-8 h-8 text-indigo-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">도메인 관리</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">도메인 설정, SSL 인증서, 리디렉션</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

