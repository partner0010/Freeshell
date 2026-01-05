'use client';

import SearchEngine from '@/components/SearchEngine';
import AIContentCreator from '@/components/AIContentCreator';
import ContentCreationGuide from '@/components/ContentCreationGuide';
import ProjectGallery from '@/components/ProjectGallery';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import BookmarkManager from '@/components/BookmarkManager';
import CommandPalette from '@/components/CommandPalette';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* 1. 상단: 검색 기능 */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <Hero />
        <div className="max-w-7xl mx-auto mt-8">
          <SearchEngine />
        </div>
      </section>

      {/* 2. AI 콘텐츠 생성 */}
      <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <AIContentCreator />
        </div>
      </section>

      {/* 3. 콘텐츠 제작 가이드 */}
      <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <ContentCreationGuide />
        </div>
      </section>

      {/* 4. 프로젝트 갤러리 */}
      <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
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
