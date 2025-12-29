'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import Link from 'next/link';
import ResearchReport from '@/components/ResearchReport';
import AICopilot from '@/components/AICopilot';

export default function ResearchPage() {
  const params = useParams();

  // 실제로는 API에서 데이터를 가져와야 함
  const researchData = {
    summary: 'AI 기술 동향에 대한 심층 연구 결과, 현재 AI 기술은 빠르게 발전하고 있으며, 특히 생성형 AI와 대규모 언어 모델 분야에서 혁신적인 진전이 이루어지고 있습니다.',
    insights: [
      '생성형 AI 시장은 2024년 기준 100억 달러 규모로 성장했습니다.',
      '대규모 언어 모델의 파라미터 수가 지속적으로 증가하고 있습니다.',
      'AI 윤리와 규제에 대한 논의가 활발해지고 있습니다.',
      '엣지 AI와 온디바이스 AI가 주목받고 있습니다.',
    ],
    charts: [
      {
        type: 'bar' as const,
        title: 'AI 시장 성장률',
        data: [
          { name: '2020', value: 50 },
          { name: '2021', value: 65 },
          { name: '2022', value: 80 },
          { name: '2023', value: 95 },
          { name: '2024', value: 120 },
        ],
      },
      {
        type: 'line' as const,
        title: 'AI 기술 채택률',
        data: [
          { name: 'Q1', value: 30 },
          { name: 'Q2', value: 35 },
          { name: 'Q3', value: 42 },
          { name: 'Q4', value: 48 },
        ],
      },
    ],
    tables: [
      {
        title: '주요 AI 기업 비교',
        headers: ['기업', '시가총액', '주요 제품', '성장률'],
        rows: [
          ['OpenAI', '$80B', 'GPT-4, DALL-E', '+150%'],
          ['Anthropic', '$18B', 'Claude', '+200%'],
          ['Google', '$1.5T', 'Gemini, Bard', '+25%'],
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">연구 보고서</h1>
              <p className="text-gray-600 dark:text-gray-400">연구 ID: {params.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>다운로드</span>
              </button>
            </div>
          </div>
        </div>

        <ResearchReport topic="AI 기술 동향" data={researchData} />
        
        <AICopilot pageContent={researchData.summary} />
      </div>
    </div>
  );
}

