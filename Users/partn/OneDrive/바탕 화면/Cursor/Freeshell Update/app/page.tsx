'use client';

import { useState } from 'react';
import { Search, Sparkles, Zap, Brain, Globe, Video, FileText, Phone, BarChart3, Workflow, Folder, Film } from 'lucide-react';
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
import ImageGenerator from '@/components/ImageGenerator';
import Translator from '@/components/Translator';
import CrossSearch from '@/components/CrossSearch';
import AIAgentCollaboration from '@/components/AIAgentCollaboration';
import Pocket from '@/components/Pocket';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'spark' | 'drive' | 'image' | 'translate' | 'cross' | 'agents' | 'pocket'>('search');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <Hero />
      <Features />
      
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Search className="inline-block w-4 h-4 mr-2" />
                AI 검색 엔진
              </button>
              <button
                onClick={() => setActiveTab('spark')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'spark'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Sparkles className="inline-block w-4 h-4 mr-2" />
                Spark 워크스페이스
              </button>
              <button
                onClick={() => setActiveTab('drive')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'drive'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <FileText className="inline-block w-4 h-4 mr-2" />
                AI 드라이브
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'image'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Video className="inline-block w-4 h-4 mr-2" />
                이미지 생성
              </button>
              <button
                onClick={() => setActiveTab('translate')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'translate'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Globe className="inline-block w-4 h-4 mr-2" />
                번역
              </button>
              <button
                onClick={() => setActiveTab('cross')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'cross'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Search className="inline-block w-4 h-4 mr-2" />
                교차 검색
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'agents'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Workflow className="inline-block w-4 h-4 mr-2" />
                AI 에이전트
              </button>
              <button
                onClick={() => setActiveTab('pocket')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'pocket'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Film className="inline-block w-4 h-4 mr-2" />
                포켓
              </button>
            </div>
          </div>

          <div className="mt-8">
            {activeTab === 'search' && <SearchEngine />}
            {activeTab === 'spark' && <SparkWorkspace />}
            {activeTab === 'drive' && <AIDrive />}
            {activeTab === 'image' && <ImageGenerator />}
            {activeTab === 'translate' && <Translator />}
            {activeTab === 'cross' && <CrossSearch />}
            {activeTab === 'agents' && <AIAgentCollaboration />}
            {activeTab === 'pocket' && <Pocket />}
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

