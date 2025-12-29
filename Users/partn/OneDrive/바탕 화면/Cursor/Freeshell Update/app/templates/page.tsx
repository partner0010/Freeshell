'use client';

import { motion } from 'framer-motion';
import { FileText, Video, Presentation, Globe, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const templates = [
  {
    id: 'travel-plan',
    title: '여행 계획',
    description: '완벽한 여행 일정을 자동으로 생성합니다',
    icon: Globe,
    category: '생활',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'business-presentation',
    title: '비즈니스 프레젠테이션',
    description: '전문적인 비즈니스 프레젠테이션을 만듭니다',
    icon: Presentation,
    category: '비즈니스',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'video-script',
    title: '비디오 스크립트',
    description: '매력적인 비디오 스크립트를 작성합니다',
    icon: Video,
    category: '콘텐츠',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'research-report',
    title: '연구 보고서',
    description: '심층적인 연구 보고서를 생성합니다',
    icon: FileText,
    category: '학술',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'website-design',
    title: '웹사이트 디자인',
    description: '현대적인 웹사이트를 설계합니다',
    icon: Globe,
    category: '디자인',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'marketing-campaign',
    title: '마케팅 캠페인',
    description: '효과적인 마케팅 전략을 수립합니다',
    icon: Sparkles,
    category: '마케팅',
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            템플릿 <span className="gradient-text">갤러리</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            다양한 템플릿으로 빠르게 시작하세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{template.title}</h3>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400">
                  {template.category}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

