/**
 * 올인원 콘텐츠 제작 플랫폼 - 메인 페이지
 * AI 기반 콘텐츠 생성에 집중
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import BookmarkManager from '@/components/BookmarkManager';
import CommandPalette from '@/components/CommandPalette';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  MessageCircle, 
  Loader2,
  CheckCircle,
  Film,
  Video,
  Music,
  Image,
  Globe,
  Shield,
  Play,
  Star,
  TrendingUp,
  Wand2,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [contentPrompt, setContentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateContent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!contentPrompt.trim() || isGenerating) return;
    router.push(`/allinone-studio/create?prompt=${encodeURIComponent(contentPrompt.trim())}`);
  };

  const contentTypes = [
    {
      id: 'shortform',
      title: '숏폼 영상',
      description: 'AI가 스토리, 캐릭터, 애니메이션을 자동 생성하는 숏폼 영상',
      icon: Video,
      color: 'from-purple-600 to-pink-600',
      href: '/allinone-studio/create?type=shortform',
      badge: '인기',
      highlight: true
    },
    {
      id: 'video',
      title: '영상 콘텐츠',
      description: '전문적인 영상 콘텐츠를 AI로 자동 제작',
      icon: Film,
      color: 'from-blue-600 to-cyan-600',
      href: '/allinone-studio/create?type=video',
      badge: null
    },
    {
      id: 'animation',
      title: '애니메이션',
      description: '3D 캐릭터와 애니메이션을 포함한 동영상 제작',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-500',
      href: '/allinone-studio/create?type=animation',
      badge: null
    },
    {
      id: 'movie',
      title: '영화 제작',
      description: '장편 영화 수준의 콘텐츠를 AI로 생성',
      icon: Layers,
      color: 'from-indigo-600 to-purple-600',
      href: '/allinone-studio/create?type=movie',
      badge: 'NEW'
    }
  ];

  const examples = [
    '행복한 고양이가 춤추는 숏폼 영상',
    '제품 소개 애니메이션 영상',
    '교육용 3D 캐릭터 영상',
    '브랜드 스토리텔링 영상',
    '음악과 함께하는 뮤직비디오'
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />
      
      {/* 1. Hero Section - AI로 웹사이트와 앱 만들기 메인 */}
      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-3d-gradient">
        {/* 3D 배경 효과 */}
        <div className="absolute inset-0">
          {/* 파티클 효과 */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
                animation: `float3d ${Math.random() * 10 + 10}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* 배지 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold shadow-lg mb-6">
              <Wand2 className="w-4 h-4" />
              <span>완전 무료 • AI 자동 생성</span>
            </div>
          </div>

          {/* 메인 타이틀 */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                올인원 콘텐츠 제작 플랫폼
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-4 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg">
              AI가 스토리, 캐릭터, 애니메이션을 자동으로 생성하는 콘텐츠 제작 도구
            </p>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
              몇 분 만에 전문적인 숏폼 영상, 애니메이션, 영화를 만들어보세요
            </p>
          </div>

          {/* 콘텐츠 생성 인터페이스 */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden">
              {/* 입력 영역 */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <form onSubmit={handleCreateContent} className="flex gap-4">
                  <div className="flex-1 relative">
                    <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={contentPrompt}
                      onChange={(e) => setContentPrompt(e.target.value)}
                      placeholder="예: 행복한 고양이가 춤추는 숏폼 영상을 만들어주세요"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900 text-lg"
                      disabled={isGenerating}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!contentPrompt.trim() || isGenerating}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>생성 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>콘텐츠 생성</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* 예시 프롬프트 */}
              <div className="p-6 bg-gray-50">
                <p className="text-sm text-gray-600 mb-3 font-medium">💡 예시 프롬프트:</p>
                <div className="flex flex-wrap gap-2">
                  {examples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setContentPrompt(example);
                        setTimeout(() => {
                          const form = document.querySelector('form');
                          if (form) form.requestSubmit();
                        }, 100);
                      }}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 기능 태그 */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              { icon: Zap, text: '빠른 생성' },
              { icon: Globe, text: '완전 무료' },
              { icon: Shield, text: '안전한' },
              { icon: Wand2, text: 'AI 자동화' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Icon className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. 핵심 기능 카드 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              다양한 콘텐츠 타입 지원
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              AI가 자동으로 생성하는 전문적인 콘텐츠를 만나보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentTypes.map((contentType) => {
              const Icon = contentType.icon;
              return (
                <Link
                  key={contentType.id}
                  href={contentType.href}
                  className={`group relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-2xl p-8 transform hover:-translate-y-2 ${
                    contentType.highlight 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' 
                      : 'border-gray-200 hover:border-purple-500'
                  }`}
                >
                  {/* 배지 */}
                  {contentType.badge && (
                    <span className="absolute top-5 right-5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-md">
                      {contentType.badge}
                    </span>
                  )}

                  {/* 아이콘 */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${contentType.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* 내용 */}
                  <h3 className={`text-2xl font-bold mb-4 transition-colors ${
                    contentType.highlight ? 'text-purple-900' : 'text-gray-900 group-hover:text-purple-600'
                  }`}>
                    {contentType.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-base">
                    {contentType.description}
                  </p>

                  {/* 링크 */}
                  <div className={`flex items-center font-semibold transition-all ${
                    contentType.highlight ? 'text-purple-700' : 'text-purple-600 group-hover:gap-3'
                  }`}>
                    <span>시작하기</span>
                    <ArrowRight className={`w-5 h-5 ml-2 transition-transform ${
                      contentType.highlight ? '' : 'group-hover:translate-x-2'
                    }`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. 작동 방식 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              어떻게 작동하나요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              6단계 AI 파이프라인으로 전문적인 콘텐츠를 자동 생성합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: '스토리 & 스크립트',
                description: 'AI가 자동으로 스토리와 스크립트를 생성합니다',
                icon: MessageCircle,
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: '2',
                title: '캐릭터 생성',
                description: '3D 캐릭터와 디자인을 자동으로 생성합니다',
                icon: Sparkles,
                color: 'from-pink-500 to-pink-600'
              },
              {
                step: '3',
                title: '렌더링 & 완성',
                description: '최종 영상을 렌더링하고 다운로드하세요',
                icon: CheckCircle,
                color: 'from-rose-500 to-rose-600'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 text-center"
                >
                  {/* 스텝 번호 */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {item.step}
                    </div>
                  </div>

                  {/* 아이콘 */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* 내용 */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. 무료 기능 안내 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900">
            모든 핵심 기능이 무료입니다
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            기본 기능은 모두 무료로 제공됩니다. 더 많은 기능이 필요하시면 유료 플랜으로 업그레이드하세요.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { text: '무제한 콘텐츠 생성', icon: Film },
              { text: 'AI 자동화', icon: Wand2 },
              { text: '3D 캐릭터', icon: Sparkles },
              { text: '음성 & 음악', icon: Music }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="px-5 py-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all shadow-sm hover:shadow-md">
                  <Icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-700">{item.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CTA 섹션 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto">
            회원가입 필수 • 모든 기능 무료 사용
          </p>
          <p className="text-base text-blue-200 mb-10 max-w-2xl mx-auto">
            모든 기능을 무료로 이용할 수 있지만, 회원가입은 필수입니다
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/allinone-studio/create"
              className="group px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <Film className="w-6 h-6" />
              <span>콘텐츠 생성 시작</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/templates"
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all"
            >
              템플릿 둘러보기
            </Link>
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
