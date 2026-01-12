/**
 * Step 1: AI 검색으로 앱/웹 제작 요구
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRequired from '@/components/AuthRequired';
import { checkAuth } from '@/lib/utils/auth-check';

export default function BuildStep1Page() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    checkAuth().then(authState => {
      setIsAuthenticated(authState.isAuthenticated);
      setIsChecking(false);
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSearching) return;

    setIsSearching(true);
    // AI 검색 시뮬레이션
    setTimeout(() => {
      router.push(`/build/step2?query=${encodeURIComponent(input.trim())}`);
    }, 1500);
  };

  const examples = [
    '블로그 웹사이트를 만들어줘',
    '간단한 투두리스트 웹 앱을 만들어줘',
    '포트폴리오 웹사이트를 만들어줘',
    '계산기 웹 앱을 만들어줘',
    '랜딩 페이지를 만들어줘',
  ];

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">확인 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <AuthRequired 
          message="AI로 웹사이트/앱을 만들려면 회원가입이 필요합니다."
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold shadow-lg mb-6">
              <Sparkles className="w-4 h-4" />
              <span>완전 무료 • 즉시 사용 가능</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                어떤 웹사이트나 앱을 만들고 싶으신가요?
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              자연어로 설명해주시면 AI가 최적의 템플릿을 추천해드립니다
            </p>
          </div>

          {/* 검색 입력 */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="예: 블로그 웹사이트를 만들어줘"
                className="w-full pl-14 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 shadow-lg"
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching || !input.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>검색 중...</span>
                  </>
                ) : (
                  <>
                    <span>검색</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 예시 */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-3 text-center">예시:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(example);
                    handleSearch(new Event('submit') as any);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* 특징 */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AI 추천</h3>
              <p className="text-sm text-gray-600">최적의 템플릿 자동 추천</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">빠른 제작</h3>
              <p className="text-sm text-gray-600">몇 분 만에 완성</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">완전 무료</h3>
              <p className="text-sm text-gray-600">모든 기능 무료 사용</p>
            </div>
          </div>

          {/* 템플릿만 사용하기 옵션 */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <p className="text-gray-600 mb-4">AI 없이 템플릿만 사용하고 싶으신가요?</p>
              <Link
                href="/templates/website"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5" />
                <span>템플릿 갤러리 바로가기</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
