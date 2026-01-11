/**
 * 재구성된 홈페이지
 * 핵심 기능 중심, 간결하고 명확한 구조
 */
'use client';

import { useRouter } from 'next/navigation';
import SearchEngine from '@/components/SearchEngine';
import HashtagGenerator from '@/components/HashtagGenerator';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import BookmarkManager from '@/components/BookmarkManager';
import CommandPalette from '@/components/CommandPalette';
import { Sparkles, Hash, FileText, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const coreFeatures = [
    {
      id: 'content-creation',
      title: 'AI 콘텐츠 제작',
      description: '5단계 AI 파이프라인으로 전문적인 콘텐츠를 제작하세요',
      icon: Sparkles,
      color: 'from-blue-500 to-blue-600',
      href: '/projects/new',
      badge: '신규'
    },
    {
      id: 'hashtag',
      title: '해시태그 생성기',
      description: 'AI가 최적의 해시태그를 자동으로 생성해드립니다',
      icon: Hash,
      color: 'from-purple-500 to-purple-600',
      href: '#hashtag-generator',
      badge: null
    },
    {
      id: 'templates',
      title: '템플릿 라이브러리',
      description: '50개 이상의 실제 사용 가능한 콘텐츠 템플릿',
      icon: FileText,
      color: 'from-pink-500 to-pink-600',
      href: '/templates',
      badge: '50+'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* 1. Hero Section - 검색 기능 */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 via-white to-white">
        <Hero />
        <div className="max-w-5xl mx-auto mt-8">
          <SearchEngine />
        </div>
      </section>

      {/* 2. 핵심 기능 카드 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              핵심 기능
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI를 활용한 콘텐츠 제작 도구들을 한 곳에서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.id}
                  href={feature.href}
                  className="group bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-xl p-8 relative overflow-hidden"
                >
                  {/* 배지 */}
                  {feature.badge && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full">
                      {feature.badge}
                    </span>
                  )}

                  {/* 아이콘 */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* 내용 */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* 링크 */}
                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    <span>시작하기</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA 버튼 */}
          <div className="text-center">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              <span>무료로 시작하기</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              가입 없이 바로 사용 가능 • 완전 무료
            </p>
          </div>
        </div>
      </section>

      {/* 3. 해시태그 생성기 (인라인) */}
      <section id="hashtag-generator" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI 해시태그 생성기
            </h2>
            <p className="text-gray-600">
              콘텐츠에 최적화된 해시태그를 자동으로 생성하세요
            </p>
          </div>
          <HashtagGenerator />
        </div>
      </section>

      {/* 4. 간단한 가격 안내 (옵션) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            모든 핵심 기능이 무료입니다
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            기본 기능은 모두 무료로 제공됩니다. 더 많은 기능이 필요하시면 유료 플랜으로 업그레이드하세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
              ✓ 무제한 AI 검색
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
              ✓ 해시태그 생성
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
              ✓ 템플릿 라이브러리
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
              ✓ 기본 콘텐츠 제작
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <KeyboardShortcuts />
      <BookmarkManager />
      <CommandPalette />
    </main>
  );
}
