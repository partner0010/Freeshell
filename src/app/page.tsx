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
    <div className="min-h-screen bg-white overflow-x-hidden">
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

      {/* SHELL AI 채팅 - 전체 화면 */}
      <section className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-4 md:px-6 relative overflow-hidden bg-white min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-full mx-auto h-full">
          <ChatGPTLikeSearch />
        </div>
      </section>

      {/* 플로팅 위젯 통합 (접근성, 피드백, 오프라인) */}
      <FloatingWidgets />

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
