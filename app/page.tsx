'use client';

import SearchEngine from '@/components/SearchEngine';
import AIContentCreator from '@/components/AIContentCreator';
import ProjectGallery from '@/components/ProjectGallery';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import BookmarkManager from '@/components/BookmarkManager';
import CommandPalette from '@/components/CommandPalette';
import { BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* 1. 상단: 검색 기능 */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <Hero />
        <div className="max-w-7xl mx-auto mt-8">
          <SearchEngine />
        </div>
      </section>

      {/* 2. AI 콘텐츠 생성 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <AIContentCreator />
        </div>
      </section>

      {/* 3. 콘텐츠 제작 가이드 (간단한 링크) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <a 
            href="/content-guide" 
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
            <span className="text-sm">
              AI 콘텐츠 제작 가이드
            </span>
          </a>
        </div>
      </section>

      {/* 4. 프로젝트 갤러리 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ProjectGallery />
        </div>
      </section>

      <Footer />
      <KeyboardShortcuts />
      <BookmarkManager />
      <CommandPalette />
    </main>
  );
}
