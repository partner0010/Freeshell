'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Settings, Sparkles } from 'lucide-react';
import AuthButton from './AuthButton';
import EnhancedNavbar from './EnhancedNavbar';

export default function Navbar() {
  // 향상된 네비게이션 사용
  return <EnhancedNavbar />;
}

export function OldNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/build', label: '웹사이트/앱 만들기' },
    { href: '/editor', label: '에디터' },
    { href: '/templates/website', label: '템플릿 갤러리' },
    { href: '/templates', label: '콘텐츠 템플릿' },
    { href: '/admin', label: '관리자' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* 로고 */}
          <Link 
            href="/" 
            className="flex items-center space-x-2.5 flex-shrink-0 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              Shell
            </span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all rounded-lg hover:bg-blue-50 whitespace-nowrap"
              >
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="ml-2">
              <AuthButton />
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors"
            aria-label="메뉴 토글"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              >
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="px-4 py-3">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
