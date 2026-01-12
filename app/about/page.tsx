'use client';

import { motion } from 'framer-motion';
import { Sparkles, Target, Users, Award, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import EnhancedCard from '@/components/EnhancedCard';
import ScrollAnimation from '@/components/ScrollAnimation';
import EnhancedButton from '@/components/EnhancedButton';

const values = [
  {
    icon: Target,
    title: '혁신',
    description: '최신 AI 기술을 활용하여 검색 경험을 혁신합니다',
  },
  {
    icon: Users,
    title: '사용자 중심',
    description: '사용자의 needs를 최우선으로 고려합니다',
  },
  {
    icon: Award,
    title: '품질',
    description: '정확하고 신뢰할 수 있는 정보를 제공합니다',
  },
  {
    icon: Globe,
    title: '접근성',
    description: '누구나 쉽게 사용할 수 있는 플랫폼을 만듭니다',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <PageHeader
        title="Shell 소개"
        description="코드 작성 없이 웹사이트와 앱을 쉽고 간단하게 만들 수 있는 플랫폼입니다"
        icon={Sparkles}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        <ScrollAnimation direction="up" delay={100}>
          <EnhancedCard className="mb-12" glass>
            <h2 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              우리의 미션
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
              Shell은 사용자에게 AI 검색, 콘텐츠 생성, 웹사이트/앱 제작까지 모든 것을 하나로 통합한 올인원 솔루션을 제공하여, 더 나은 의사결정을 돕는 것을 목표로 합니다.
              여러 AI 모델을 통합하여 포괄적이고 편향 없는 정보를 제공하며, 복잡한 작업을 자동화하여 사용자의 생산성을 높입니다.
            </p>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              우리는 AI 기술의 힘을 활용하여 웹 개발의 미래를 만들어가고 있습니다.
            </p>
          </EnhancedCard>
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <ScrollAnimation key={index} direction="up" delay={200 + index * 100}>
                <EnhancedCard
                  icon={Icon}
                  title={value.title}
                  description={value.description}
                  className="text-center"
                >
                  {null}
                </EnhancedCard>
              </ScrollAnimation>
            );
          })}
        </div>

        <ScrollAnimation direction="up" delay={600}>
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-600/50 animate-pulse" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">함께 성장해요</h2>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Shell과 함께 웹 개발의 새로운 시대를 만들어가세요
              </p>
              <EnhancedButton
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = '/build/step1'}
              >
                시작하기
              </EnhancedButton>
            </div>
          </div>
        </ScrollAnimation>
      </div>
      
      <Footer />
    </div>
  );
}

