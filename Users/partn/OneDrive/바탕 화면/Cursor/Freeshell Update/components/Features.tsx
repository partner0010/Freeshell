'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Globe, Video, FileText, Phone, BarChart3, Workflow, Sparkles, Search, Folder } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'AI 기반 검색 엔진',
    description: '실시간으로 맞춤형 페이지를 생성하여 포괄적이고 편향 없는 정보를 제공합니다',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Brain,
    title: '9개의 전문화된 LLM',
    description: '다양한 대형 언어 모델을 통합하여 최적의 결과를 제공합니다',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: '80개 이상의 전문 도구',
    description: '레스토랑 예약부터 전문 프레젠테이션 제작까지 복잡한 작업을 자동화합니다',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Phone,
    title: 'AI 기반 전화 통화',
    description: '현실적인 음성으로 예약, 문의, 비즈니스 커뮤니케이션을 자연스럽게 처리합니다',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Video,
    title: '다중 모달 콘텐츠 생성',
    description: '비디오, 슬라이드, 웹사이트, 문서 등 다양한 형식의 콘텐츠를 즉시 생성합니다',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: BarChart3,
    title: '심층 연구 기능',
    description: '수백만 단어의 데이터를 분석하여 상세한 통찰력과 종합 보고서를 제공합니다',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Workflow,
    title: '노코드 AI 워크스페이스',
    description: '복잡한 설정 없이 자연어로 요구사항을 설명하면 AI가 자동으로 처리합니다',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Globe,
    title: '웹 자동화',
    description: '웹사이트 탐색, 양식 작성, 데이터 추출 및 애플리케이션과의 상호작용을 자동화합니다',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Folder,
    title: 'AI 드라이브',
    description: '생성된 문서, 이미지, 동영상 등 모든 결과물을 저장·관리하는 공간으로, 파일 업로드, 폴더 정리, 다운로드 및 공유 기능을 제공합니다',
    color: 'from-blue-500 to-indigo-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            강력한 <span className="gradient-text">AI 기능</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            최신 AI 기술을 활용하여 복잡한 작업을 간단하게 만들어드립니다
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

