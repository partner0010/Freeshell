'use client';

import SearchEngine from '@/components/SearchEngine';
import AIContentCreator from '@/components/AIContentCreator';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import BookmarkManager from '@/components/BookmarkManager';
import CommandPalette from '@/components/CommandPalette';
import CodeGenerator from '@/components/CodeGenerator';
import ChatInterface from '@/components/ChatInterface';
import { Code, MessageCircle } from 'lucide-react';

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

      {/* 1.5. AI 대화 인터페이스 (ChatGPT처럼) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">AI 대화</h2>
            <p className="text-gray-600">ChatGPT처럼 자연스러운 대화를 나눠보세요</p>
          </div>
          <ChatInterface />
        </div>
      </section>

      {/* 2. AI 코드 생성 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">AI 코드 생성기</h2>
            <p className="text-gray-600">개발자처럼 코드를 생성하고 설명합니다</p>
          </div>
          <CodeGenerator />
        </div>
      </section>

      {/* 3. AI 콘텐츠 생성 */}
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
