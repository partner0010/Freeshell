'use client';

import { useState } from 'react';
import { Sparkles, Menu, X, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">Shell</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              기능
            </Link>
            <Link href="#search" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              검색
            </Link>
            <Link href="#spark" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              Spark
            </Link>
            <Link href="#drive" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              AI 드라이브
            </Link>
            <Link href="/templates" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              템플릿
            </Link>
            <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              대시보드
            </Link>
            <Link href="/dashboard/integrations" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              통합
            </Link>
            <Link href="/api/docs" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              API
            </Link>
            <Link href="/dashboard/team" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              팀
            </Link>
            <Link href="/dashboard/webhooks" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              웹훅
            </Link>
            <Link href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              가격
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="테마 전환"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/auth/login" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              시작하기
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="#features" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
              기능
            </Link>
            <Link href="#search" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
              검색
            </Link>
            <Link href="#spark" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
              Spark
            </Link>
            <Link href="#drive" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
              AI 드라이브
            </Link>
            <Link href="#pricing" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
              가격
            </Link>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
              <span>테마 전환</span>
            </button>
            <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
              시작하기
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

