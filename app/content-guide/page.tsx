'use client';

import { useState } from 'react';
import ContentCreationGuide from '@/components/ContentCreationGuide';
import AIContentCreator from '@/components/AIContentCreator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, BookOpen } from 'lucide-react';

export default function ContentGuidePage() {
  const [activeTab, setActiveTab] = useState<'create' | 'guide'>('create');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {/* 탭 메뉴 */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="inline-flex rounded-lg bg-white p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>AI 콘텐츠 생성</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'guide'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>제작 가이드</span>
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        {activeTab === 'create' ? <AIContentCreator /> : <ContentCreationGuide />}
      </main>
      <Footer />
    </div>
  );
}

