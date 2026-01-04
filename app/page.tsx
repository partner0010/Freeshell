'use client';

import { useState } from 'react';
import { Search, Sparkles, FileText, Globe, Image as ImageIcon } from 'lucide-react';
import SearchEngine from '@/components/SearchEngine';
import SparkWorkspace from '@/components/SparkWorkspace';
import AIDrive from '@/components/AIDrive';
import Features from '@/components/Features';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Pricing from '@/components/Pricing';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import BookmarkManager from '@/components/BookmarkManager';
import CommandPalette from '@/components/CommandPalette';
import Translator from '@/components/Translator';
import WebSearch from '@/components/WebSearch';
import ImageSearch from '@/components/ImageSearch';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'spark' | 'drive' | 'translate' | 'web-search' | 'image-search'>('search');

  const tabs = [
    { id: 'search' as const, label: 'AI 검색 엔진', icon: Search },
    { id: 'spark' as const, label: 'Spark 워크스페이스', icon: Sparkles },
    { id: 'drive' as const, label: 'AI 드라이브', icon: FileText },
    { id: 'translate' as const, label: '번역', icon: Globe },
    { id: 'web-search' as const, label: '웹 검색', icon: Search },
    { id: 'image-search' as const, label: '이미지 검색', icon: ImageIcon },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <Hero />
      <Features />
      
      <section className="py-8 md:py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 탭 메뉴 - 모바일: 가로 스크롤, 데스크톱: 전체 표시 */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="w-full max-w-4xl">
              {/* 모바일: 가로 스크롤 가능한 탭 */}
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 overflow-x-auto scrollbar-hide md:overflow-x-visible md:w-full">
                <div className="flex min-w-max md:flex-wrap md:min-w-0 md:w-full md:justify-center gap-1 md:gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center justify-center gap-1.5 md:gap-2
                          px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3
                          rounded-md font-medium transition-all whitespace-nowrap
                          text-xs sm:text-sm md:text-base
                          flex-shrink-0
                          ${
                            isActive
                              ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }
                        `}
                        aria-label={tab.label}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="mt-6 md:mt-8">
            {activeTab === 'search' && <SearchEngine />}
            {activeTab === 'spark' && <SparkWorkspace />}
            {activeTab === 'drive' && <AIDrive />}
            {activeTab === 'translate' && <Translator />}
            {activeTab === 'web-search' && <WebSearch />}
            {activeTab === 'image-search' && <ImageSearch />}
          </div>
        </div>
      </section>

      <Pricing />
      <Footer />
      <KeyboardShortcuts />
      <BookmarkManager />
      <CommandPalette />
    </main>
  );
}
