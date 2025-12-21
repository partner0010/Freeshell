'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Layout,
  BarChart3,
  Settings,
  FileText,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Sparkles,
  CreditCard,
  Shield,
  HelpCircle,
  FileImage,
  ShoppingCart,
  MessageSquare,
  Megaphone,
  Activity,
  LifeBuoy,
  Key,
} from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/users', icon: Users, label: '사용자 관리' },
  { href: '/admin/projects', icon: FolderKanban, label: '프로젝트 관리' },
  { href: '/admin/licenses', icon: Key, label: '라이선스 관리' },
  { href: '/admin/templates', icon: Layout, label: '템플릿 관리' },
  { href: '/admin/content', icon: FileImage, label: '콘텐츠 관리' },
  { href: '/admin/ecommerce', icon: ShoppingCart, label: '이커머스' },
  { href: '/admin/community', icon: MessageSquare, label: '커뮤니티' },
  { href: '/admin/marketing', icon: Megaphone, label: '마케팅' },
  { href: '/admin/analytics', icon: BarChart3, label: '분석' },
  { href: '/admin/monitoring', icon: Activity, label: '시스템 모니터링' },
  { href: '/admin/security', icon: Shield, label: '보안 센터' },
  { href: '/admin/support', icon: LifeBuoy, label: '지원 센터' },
  { href: '/admin/logs', icon: FileText, label: '로그' },
  { href: '/admin/settings', icon: Settings, label: '설정' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications: Array<{ id: number; title: string; message: string; time: string; unread: boolean }> = [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 사이드바 */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full bg-gray-900 text-white transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* 로고 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            {sidebarOpen && (
              <span className="font-display font-bold text-lg">Freeshell Admin</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 하단 링크 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-colors"
          >
            <Sparkles size={20} />
            {sidebarOpen && <span>에디터로 이동</span>}
          </Link>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* 헤더 */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg hidden lg:block"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            
            {/* 검색 */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="검색..."
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 알림 */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border overflow-hidden z-50"
                >
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">알림</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${notif.unread ? 'bg-primary-50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{notif.title}</p>
                            <p className="text-gray-500 text-xs mt-1">{notif.message}</p>
                          </div>
                          <span className="text-xs text-gray-400">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center">
                    <Link href="/admin/notifications" className="text-primary-500 text-sm hover:underline">
                      모든 알림 보기
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 도움말 */}
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <HelpCircle size={20} className="text-gray-600" />
            </button>

            {/* 사용자 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  관
                </div>
                <span className="text-gray-700 font-medium hidden md:block">관리자</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border overflow-hidden z-50"
                >
                  <div className="p-3 border-b">
                    <p className="font-medium text-gray-800">관리자</p>
                    <p className="text-xs text-gray-500">admin@freeshell.app</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <Settings size={16} />
                      설정
                    </Link>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <LogOut size={16} />
                      로그아웃
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

