'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Key, Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import TwoFactorAuth from '@/components/TwoFactorAuth';
import EmailVerification from '@/components/EmailVerification';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">설정</h1>

        <div className="space-y-6">
          {/* 프로필 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">프로필</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">이름</label>
                <input
                  type="text"
                  defaultValue="사용자"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">이메일</label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="mt-2">
                  <EmailVerification email="user@example.com" />
                </div>
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                저장
              </button>
            </div>
          </motion.div>

          {/* 알림 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">알림</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span>이메일 알림</span>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>푸시 알림</span>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>업데이트 알림</span>
                <input
                  type="checkbox"
                  checked={notifications.updates}
                  onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
            </div>
          </motion.div>

          {/* 테마 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              {theme === 'dark' ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-primary" />}
              <h2 className="text-2xl font-bold">테마</h2>
            </div>
            <div className="flex items-center justify-between">
              <span>다크 모드</span>
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {theme === 'dark' ? '켜짐' : '꺼짐'}
              </button>
            </div>
          </motion.div>

          {/* 보안 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">보안</h2>
            </div>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left">
                비밀번호 변경
              </button>
              <div className="w-full">
                <TwoFactorAuth />
              </div>
            </div>
          </motion.div>

          {/* API 키 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Key className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">API 키</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value="sk-••••••••••••••••"
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  복사
                </button>
              </div>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                새 API 키 생성
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

