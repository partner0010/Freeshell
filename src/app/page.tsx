'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Video, Image, FileText, 
  Globe, Zap, PlayCircle, Camera, Mic, Film, 
  Type, Palette, Rocket, Brain, Search, Code,
  Wand2, Layers, Zap as Lightning, MessageSquare, X
} from 'lucide-react';
import Link from 'next/link';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { Footer } from '@/components/layout/Footer';
import { ChatGPTLikeSearch } from '@/components/ai/ChatGPTLikeSearch';
import { SocialShare } from '@/components/social/SocialShare';
import { PersonalizedRecommendations } from '@/components/recommendations/PersonalizedRecommendations';
import { FloatingWidgets } from '@/components/ui/FloatingWidgets';
import { StructuredData } from '@/components/seo/StructuredData';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-white">
      {/* 구조화된 데이터 */}
      <StructuredData 
        type="WebPage" 
        data={{ 
          path: '/', 
          title: 'Freeshell - AI 통합 콘텐츠 생성 솔루션',
          description: 'AI로 만드는 수익형 콘텐츠. 숏폼, 영상, 이미지, 전자책, 글쓰기까지 완전 자동화'
        }} 
      />
      
      {/* 헤더 */}
      <GlobalHeader />

      {/* 히어로 섹션 - SHELL AI 통합 */}
      <section className="pt-6 sm:pt-8 md:pt-12 lg:pt-16 pb-8 sm:pb-12 md:pb-16 px-3 sm:px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50" />
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-200/30 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 sm:mb-6 text-center"
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm font-medium border border-purple-200">
              <Sparkles size={12} className="sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">무료 AI 도구 모음</span>
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 text-center leading-tight px-2"
          >
            <span className="block sm:inline">AI로 모든 것을</span>
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              더 쉽게
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 text-center max-w-2xl mx-auto px-4"
          >
            회원가입 없이 바로 사용할 수 있는 무료 AI 도구들
          </motion.p>

          {/* ChatGPT 스타일 AI 검색 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700/80 p-4 sm:p-6 max-w-4xl mx-auto w-full supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-900/80">
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-white" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">SHELL</h2>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">AI 어시스턴트 - ChatGPT처럼 질문하고 답변받으세요</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 w-full">
                <ChatGPTLikeSearch />
              </div>
            </div>
          </motion.div>

          {/* 맞춤형 추천 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mb-8 max-w-4xl mx-auto"
          >
            <PersonalizedRecommendations />
          </motion.div>

          {/* 빠른 액세스 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: Video, label: '영상 생성', href: '/creator', color: 'from-purple-500 to-pink-500' },
              { icon: Image, label: '이미지 생성', href: '/editor', color: 'from-pink-500 to-red-500' },
              { icon: FileText, label: '텍스트 생성', href: '/editor', color: 'from-blue-500 to-cyan-500' },
              { icon: Code, label: '코드 생성', href: '/editor', color: 'from-green-500 to-emerald-500' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className="text-white" size={24} />
                </div>
                <div className="text-sm font-semibold text-gray-900">{item.label}</div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              모든 AI 기능을 한 곳에서
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              회원가입 없이 바로 사용할 수 있는 무료 AI 도구들
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Video,
                title: '영상 생성',
                description: '텍스트나 이미지로 영상을 자동 생성합니다',
                href: '/creator',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Image,
                title: '이미지 생성',
                description: 'AI로 원하는 이미지를 생성합니다',
                href: '/editor',
                color: 'from-pink-500 to-red-500',
              },
              {
                icon: FileText,
                title: '텍스트 생성',
                description: '블로그, 글쓰기, 번역 등 텍스트 작업을 도와줍니다',
                href: '/editor',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Code,
                title: '코드 생성',
                description: 'AI가 코드를 작성하고 최적화해줍니다',
                href: '/editor',
                color: 'from-orange-500 to-yellow-500',
              },
              {
                icon: Mic,
                title: '음성 생성',
                description: '자연스러운 AI 음성으로 나레이션을 만듭니다',
                href: '/creator',
                color: 'from-indigo-500 to-purple-500',
              },
            ].map((feature, i) => (
              <Link
                key={i}
                href={feature.href}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>사용하기</span>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 작동 방식 */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              간단한 3단계
            </h2>
            <p className="text-lg text-gray-600">
              회원가입 없이 바로 시작하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: '도구 선택', desc: '원하는 AI 도구를 선택하세요', icon: Layers },
              { step: 2, title: '작업 시작', desc: '간단한 입력으로 AI가 작업을 시작합니다', icon: Zap },
              { step: 3, title: '결과 확인', desc: '생성된 결과를 바로 확인하고 사용하세요', icon: Rocket },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-purple-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-white/90 mb-8">
              회원가입 없이 무료로 모든 AI 기능을 사용할 수 있습니다
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                <MessageSquare size={20} />
                <span>SHELL AI와 대화하기</span>
                <ArrowRight size={20} />
              </button>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                <Sparkles size={20} />
                <span>전체 기능 보기</span>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white border-2 border-white/30 rounded-xl font-semibold text-base hover:bg-white/20 transition-all"
              >
                <MessageSquare size={18} />
                <span>SHELL AI와 대화하기</span>
              </button>
              <SocialShare className="bg-white/20 backdrop-blur rounded-xl p-3" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 플로팅 위젯 통합 (접근성, 피드백, 오프라인) */}
      <FloatingWidgets />

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
