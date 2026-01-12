/**
 * 향상된 네비게이션 바
 * 마이크로 인터랙션, 활성 상태, 호버 효과 등 최신 트렌드 반영
 */
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Sparkles, ChevronDown, Search, Bell, User } from 'lucide-react';
import AuthButton from './AuthButton';
import { useAuth } from '@/lib/hooks/useAuth';
import NotificationSystem from './NotificationSystem';

export default function EnhancedNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // 컴포넌트 언마운트 시 타임아웃 정리
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  const navLinks = [
    { 
      href: '/', 
      label: '홈',
      icon: Sparkles,
    },
    { 
      href: '/build/step1', 
      label: '웹사이트/앱 만들기',
      icon: Sparkles,
    },
    { 
      href: '/editor', 
      label: '에디터',
      icon: Sparkles,
    },
    {
      label: '템플릿',
      icon: Sparkles,
      dropdown: [
        { href: '/templates/website', label: '웹사이트 템플릿' },
        { href: '/templates', label: '콘텐츠 템플릿' },
      ],
    },
    // 관리자 메뉴는 관리자로 로그인한 경우에만 표시
    ...(isAdmin ? [{
      href: '/admin', 
      label: '관리자',
      icon: Sparkles,
    }] : []),
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* 로고 */}
          <Link 
            href="/" 
            className="flex items-center space-x-2.5 flex-shrink-0 group relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110 group-hover:rotate-12">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap group-hover:scale-105 transition-transform">
              Shell
            </span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              if (link.dropdown) {
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => {
                      // 기존 타임아웃 취소
                      if (dropdownTimeout) {
                        clearTimeout(dropdownTimeout);
                        setDropdownTimeout(null);
                      }
                      // 즉시 드롭다운 표시
                      setActiveDropdown(link.label);
                    }}
                    onMouseLeave={() => {
                      // 약간의 지연 후 드롭다운 숨김 (마우스 이동 시간 확보)
                      const timeout = setTimeout(() => {
                        setActiveDropdown(null);
                        setDropdownTimeout(null);
                      }, 200); // 200ms 지연
                      setDropdownTimeout(timeout);
                    }}
                  >
                    <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-all rounded-lg hover:bg-purple-50 whitespace-nowrap group">
                      <link.icon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span>{link.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === link.label && (
                      <div 
                        className="absolute top-full left-0 pt-2 w-56 z-50"
                        onMouseEnter={() => {
                          // 서브메뉴 위에 마우스가 있으면 타임아웃 취소
                          if (dropdownTimeout) {
                            clearTimeout(dropdownTimeout);
                            setDropdownTimeout(null);
                          }
                          setActiveDropdown(link.label);
                        }}
                        onMouseLeave={() => {
                          // 서브메뉴를 벗어나면 약간의 지연 후 숨김
                          const timeout = setTimeout(() => {
                            setActiveDropdown(null);
                            setDropdownTimeout(null);
                          }, 200);
                          setDropdownTimeout(timeout);
                        }}
                      >
                        {/* 보이지 않는 브릿지 영역 (메인 메뉴와 서브메뉴 사이 간격 채우기) */}
                        <div className="absolute top-0 left-0 right-0 h-2 -mt-2" />
                        {/* 실제 서브메뉴 */}
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors border-b border-gray-100 last:border-0"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all group ${
                    isActive(link.href)
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                  )}
                  <link.icon className={`w-4 h-4 transition-transform ${isActive(link.href) ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {/* 검색 버튼 */}
            <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
              <Search className="w-5 h-5" />
            </button>
            
            {/* 알림 시스템 */}
            <NotificationSystem />
            
            <div className="ml-2">
              <AuthButton />
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors relative"
            aria-label="메뉴 토글"
          >
            <div className="relative w-6 h-6">
              <Menu className={`absolute inset-0 w-6 h-6 transition-all ${isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
              <X className={`absolute inset-0 w-6 h-6 transition-all ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              if (link.dropdown) {
                return (
                  <div key={link.label} className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700">
                      <link.icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </div>
                    <div className="pl-11 space-y-1">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="px-4 py-3 border-t border-gray-200 mt-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
