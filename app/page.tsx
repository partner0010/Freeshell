'use client';

import SearchEngine from '@/components/SearchEngine';
import AIContentCreator from '@/components/AIContentCreator';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import BookmarkManager from '@/components/BookmarkManager';
import CommandPalette from '@/components/CommandPalette';

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


      <Footer />
      <KeyboardShortcuts />
      <BookmarkManager />
      <CommandPalette />
    </main>
  );
}
