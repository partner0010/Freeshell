'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Menu, X, Search, 
  Video, FileText, Zap, Monitor, Bug, Shield, Accessibility, Users, HelpCircle, FileSignature,
  Home, ArrowLeft
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { LanguageSelector } from '@/components/i18n/LanguageSelector';
import type { Notification } from '@/components/notifications/NotificationCenter';

export function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAccessibility, setShowAccessibility] = useState(false);
  
  const isHomePage = pathname === '/';
  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;

  useEffect(() => {
    // 예시 알림 (실제로는 서버에서 받아옴)
    const exampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: '새로운 기능이 추가되었습니다!',
        message: 'AI 채팅에 음성 입력 기능이 추가되었습니다.',
        timestamp: new Date(),
        read: false,
      },
    ];
    setNotifications(exampleNotifications);
  }, []);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // 사용자 편의성에 맞게 메뉴 재설계
  // 논리적 그룹: 생성/편집 → AI 자동화 → 비즈니스 → 정보/소통 → 지원
  const mainMenu = [
    // 생성/편집 도구
    { href: '/editor', label: '에디터', icon: FileText, category: '생성' },
    { href: '/creator', label: '콘텐츠 생성', icon: Video, category: '생성' },
    // AI 자동화
    { href: '/agents', label: 'AI 에이전트', icon: Zap, category: '자동화' },
    // 비즈니스 도구
    { href: '/signature', label: '전자서명', icon: FileSignature, category: '비즈니스' },
    { href: '/remote', label: '원격 솔루션', icon: Monitor, category: '비즈니스' },
    // 정보 및 소통
    { href: '/trends', label: '최신 트렌드', icon: Sparkles, category: '정보' },
    { href: '/community', label: '커뮤니티', icon: Users, category: '소통' },
    // 지원
    { href: '/help', label: '도움말', icon: HelpCircle, category: '지원' },
  ];

  // 유틸리티 메뉴 (디버깅, 검증 등)
  const utilityMenu = [
    { href: '/debug', label: '디버깅', icon: Bug },
    { href: '/validate', label: '사이트 검증', icon: Shield },
  ];

  return (
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700/80 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 min-h-[56px]">
          {/* 모바일 네비게이션 버튼 (뒤로가기/홈) */}
          <div className="flex items-center gap-1 lg:hidden flex-shrink-0">
            {!isHomePage && (
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                aria-label="뒤로가기"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            {!isHomePage && (
              <Link
                href="/"
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                aria-label="홈으로"
              >
                <Home size={20} />
              </Link>
            )}
          </div>

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Sparkles className="text-white" size={16} />
            </div>
            <span className="font-display font-bold text-base sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
              Freeshell
            </span>
          </Link>

          {/* 데스크톱 네비게이션 - 통일된 가로 배치 스타일 */}
          <nav className="hidden lg:flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide flex-1 justify-center mx-2 sm:mx-4">
            {mainMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                <item.icon size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* 유틸리티 메뉴 (데스크톱) */}
            <div className="hidden xl:flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-700 pr-1.5 mr-1.5">
              {utilityMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium text-xs whitespace-nowrap"
                >
                  <item.icon size={14} className="flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* 언어 선택 */}
            <div className="hidden lg:block">
              <LanguageSelector />
            </div>

            {/* 접근성 메뉴 */}
            <button
              onClick={() => setShowAccessibility(!showAccessibility)}
              className="hidden lg:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="접근성 설정"
            >
              <Accessibility size={16} className="sm:w-5 sm:h-5" />
            </button>

            {/* 알림 센터 */}
            <NotificationCenter
              notifications={notifications}
              onDismiss={handleDismiss}
              onRead={handleRead}
              onClearAll={handleClearAll}
            />

            {/* 검색 버튼 */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="검색"
            >
              <Search size={16} className="sm:w-5 sm:h-5" />
            </button>

            {/* 로그인 버튼 */}
            <Link
              href="/auth/signin"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-xs sm:text-sm whitespace-nowrap"
            >
              <Zap size={12} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">로그인</span>
            </Link>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="메뉴"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <nav className="px-3 sm:px-4 py-3 sm:py-4 space-y-1">
              {/* 메인 메뉴 */}
              {mainMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all font-medium text-base sm:text-lg"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex-shrink-0">
                    <item.icon size={20} className="sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* 구분선 */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              
              {/* 유틸리티 메뉴 */}
              {utilityMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium text-sm sm:text-base"
                >
                  <item.icon size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색 모달 */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <Search className="text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  className="flex-1 text-lg outline-none border-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                SHELL AI와 대화하려면 메인 페이지로 이동하세요
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

