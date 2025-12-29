'use client';

import { motion } from 'framer-motion';
import { Sparkles, Target, Users, Award, Globe } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Shell <span className="gradient-text">소개</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            AI 기반 검색 엔진으로 정보 검색의 새로운 경험을 제공합니다
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-12 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-3xl font-bold mb-6">우리의 미션</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Shell은 사용자에게 AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션을 제공하여, 더 나은 의사결정을 돕는 것을 목표로 합니다.
            여러 AI 모델을 통합하여 포괄적이고 편향 없는 정보를 제공하며, 복잡한 작업을 자동화하여 사용자의 생산성을 높입니다.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            우리는 AI 기술의 힘을 활용하여 정보 검색의 미래를 만들어가고 있습니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">함께 성장해요</h2>
          <p className="text-lg mb-6 opacity-90">
            Shell과 함께 AI 솔루션의 새로운 시대를 만들어가세요
          </p>
          <button className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            시작하기
          </button>
        </motion.div>
      </div>
    </div>
  );
}

