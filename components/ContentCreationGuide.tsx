'use client';

import { useState } from 'react';
import { ExternalLink, CheckCircle, Clock, TrendingUp, ArrowRight, Lightbulb } from 'lucide-react';
import { contentGuides, getGuideById, type ContentGuide } from '@/data/content-creation-guides';

interface ContentCreationGuideProps {
  guideId?: string;
}

export default function ContentCreationGuide({ guideId }: ContentCreationGuideProps) {
  const [selectedGuide, setSelectedGuide] = useState<ContentGuide | null>(
    guideId ? getGuideById(guideId) || null : null
  );

  const categories = [
    { id: 'all', name: '전체', icon: '🎨' },
    { id: 'video', name: '영상', icon: '🎥' },
    { id: 'image', name: '이미지', icon: '🖼️' },
    { id: 'text', name: '텍스트', icon: '📝' },
    { id: 'audio', name: '음악', icon: '🎵' },
    { id: 'ebook', name: '전자책', icon: '📚' },
  ];

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const difficultyLabels = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  };

  if (selectedGuide) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        {/* 뒤로 가기 버튼 */}
        <button
          onClick={() => setSelectedGuide(null)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>가이드 목록으로</span>
        </button>

        {/* 가이드 상세 */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{selectedGuide.icon}</span>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    {selectedGuide.title}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {selectedGuide.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 메타 정보 */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className={`px-4 py-2 rounded-lg ${difficultyColors[selectedGuide.difficulty].replace('dark:', '').replace(/dark:\S+/g, '')}`}>
                난이도: {difficultyLabels[selectedGuide.difficulty]}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>소요 시간: {selectedGuide.timeRequired}</span>
              </div>
            </div>
          </div>

          {/* 사용 도구 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">필요한 도구</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedGuide.tools.map((tool, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                    {tool.freeTier && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        무료
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    사이트 방문
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 단계별 가이드 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">단계별 가이드</h2>
            <div className="space-y-6">
              {selectedGuide.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-6 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{step.description}</p>

                      {/* 상세 내용 */}
                      <div className="space-y-2 mb-4">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>

                      {/* 팁 */}
                      {step.tips && step.tips.length > 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-900">팁</h4>
                          </div>
                          <ul className="space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li key={idx} className="text-sm text-yellow-800">
                                • {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 참고 자료 */}
          {selectedGuide.resources.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">참고 자료</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedGuide.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs text-gray-500 mb-1 uppercase">
                        {resource.type}
                      </div>
                      <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {resource.title}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
          AI 콘텐츠 제작 가이드
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          무료 AI 도구를 활용하여 다양한 콘텐츠를 쉽게 제작하는 방법을 단계별로 안내합니다
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                // 카테고리 필터링 로직 (추후 구현)
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 가이드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentGuides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            className="text-left p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-primary hover:shadow-xl transition-all group"
          >
            <div className="text-5xl mb-4">{guide.icon}</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary transition-colors">
              {guide.title}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">{guide.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className={`px-3 py-1 rounded-full ${difficultyColors[guide.difficulty].replace('dark:', '').replace(/dark:\S+/g, '')}`}>
                {difficultyLabels[guide.difficulty]}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{guide.timeRequired}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center text-primary group-hover:gap-2 transition-all">
              <span className="text-sm font-semibold">가이드 보기</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

