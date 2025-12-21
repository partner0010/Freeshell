'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Image, BookOpen, FileText, Mic, Sparkles,
  Play, Download, Globe, Zap, Settings, ArrowRight, Calendar, Clock
} from 'lucide-react';
import Link from 'next/link';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { AdBanner } from '@/components/ads/AdBanner';

export default function CreatorPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const contentTypes = [
    {
      id: 'short-video',
      name: '숏폼 영상',
      icon: Video,
      description: '15초~1시간 길이의 영상 자동 생성',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'image',
      name: '이미지',
      icon: Image,
      description: 'NanoBana AI로 캐릭터/이미지 생성',
      color: 'from-pink-500 to-red-500',
    },
    {
      id: 'video',
      name: '동영상',
      icon: Play,
      description: 'Kling AI로 텍스트/이미지에서 영상 생성',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'ebook',
      name: '전자책',
      icon: BookOpen,
      description: '자동 전자책 생성 및 포맷팅',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'blog',
      name: '블로그',
      icon: FileText,
      description: 'SEO 최적화된 블로그 포스트 생성',
      color: 'from-orange-500 to-yellow-500',
    },
    {
      id: 'audio',
      name: '음성',
      icon: Mic,
      description: 'SUPERTONE AI 나레이션 생성',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  const [multilingual, setMultilingual] = useState(false);
  const [duration, setDuration] = useState(600);

  const handleGenerate = async () => {
    if (!selectedType || !topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: selectedType,
          topic: topic.trim(),
          options: {
            duration: selectedType === 'short-video' ? duration : undefined,
            language: 'ko',
            multilingual,
            includeSubtitles: true,
            includeBackgroundMusic: true,
            seoOptimize: true,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '생성 실패');
      }

      const resultData = await response.json();
      setResult(resultData.data);
      setError(null);
      
      if (resultData.data?.message) {
        setError(resultData.data.message);
      }
      
      console.log('생성 결과:', resultData);
    } catch (error: any) {
      setError(`생성 중 오류가 발생했습니다: ${error.message}`);
      setResult(null);
      console.error('생성 오류:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <GlobalHeader />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            콘텐츠 생성하기
          </h1>
          <p className="text-xl text-gray-600">
            생성하고 싶은 콘텐츠 유형을 선택하고 주제를 입력하세요
          </p>
        </motion.div>

        {/* 콘텐츠 유형 선택 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <motion.button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 주제 입력 */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">주제 입력</h2>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: AI로 시작하는 부업, 오늘의 이슈, 요리 레시피 등..."
              className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none text-gray-900"
            />
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    생성 시작
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* 생성 옵션 */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={24} />
              생성 옵션
            </h2>
            <div className="space-y-4">
              {selectedType === 'short-video' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      영상 길이 (초)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="3600"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      권장: 600초 (10분) - 광고 수익 최적화
                    </p>
                  </div>
                </>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="multilingual"
                    checked={multilingual}
                    onChange={(e) => setMultilingual(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label htmlFor="multilingual" className="text-gray-700 flex items-center gap-2 cursor-pointer">
                    <Globe size={18} className="text-purple-600" />
                    <span className="font-semibold">전세계 수익화</span>
                    <span className="text-sm text-gray-600">(25개 언어 자동 생성, 예상 수익: $150+)</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="subtitles"
                    defaultChecked
                    className="w-5 h-5"
                  />
                  <label htmlFor="subtitles" className="text-gray-700 flex items-center gap-2 cursor-pointer">
                    <FileText size={18} className="text-blue-600" />
                    <span className="font-semibold">자막 자동 생성</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="backgroundMusic"
                    defaultChecked
                    className="w-5 h-5"
                  />
                  <label htmlFor="backgroundMusic" className="text-gray-700 flex items-center gap-2 cursor-pointer">
                    <Mic size={18} className="text-green-600" />
                    <span className="font-semibold">배경음악 자동 추가</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 결과 표시 */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">생성 결과</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">{error}</p>
              </div>
            )}

            {result.script && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">대본</h3>
                <div className="p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {result.script}
                </div>
              </div>
            )}

            {result.images && result.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">생성된 이미지</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {result.images.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt={`이미지 ${i + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {result.videoUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">생성된 영상</h3>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {result.videoUrl.startsWith('http') ? (
                    <video src={result.videoUrl} controls className="w-full h-full" />
                  ) : (
                    <img
                      src={result.videoUrl}
                      alt="영상 미리보기"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            {result.audioUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">생성된 음성 (나레이션)</h3>
                <audio src={result.audioUrl} controls className="w-full" />
              </div>
            )}

            {result.subtitles && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">자막 (SRT)</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {result.subtitles.substring(0, 500)}
                    {result.subtitles.length > 500 && '...'}
                  </pre>
                </div>
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(result.subtitles)}`}
                  download="subtitles.srt"
                  className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  SRT 파일 다운로드
                </a>
              </div>
            )}

            {result.backgroundMusic && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">배경음악</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">음악 URL:</span>
                      <span className="ml-2 text-gray-600 break-all">{result.backgroundMusic.url || '설정됨'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">볼륨:</span>
                      <span className="ml-2 text-gray-600">{(result.backgroundMusic.volume * 100).toFixed(0)}%</span>
                    </div>
                    {result.backgroundMusic.url && (
                      <audio src={result.backgroundMusic.url} controls className="w-full mt-2" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {result.seo && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO 최적화</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">제목:</span>
                    <span className="ml-2 text-gray-600">{result.seo.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">설명:</span>
                    <span className="ml-2 text-gray-600">{result.seo.description}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">키워드:</span>
                    <span className="ml-2 text-gray-600">{result.seo.keywords?.join(', ')}</span>
                  </div>
                </div>
              </div>
            )}

            {result.totalRevenue && (
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                <div className="text-sm opacity-90 mb-1">예상 수익</div>
                <div className="text-3xl font-bold">${result.totalRevenue}</div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setTopic('');
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                새로 만들기
              </button>
              {result.videoUrl && (
                <a
                  href={result.videoUrl}
                  download
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-center"
                >
                  다운로드
                </a>
              )}
            </div>
          </motion.div>
        )}

        {error && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-red-50 border border-red-200 rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-red-900 mb-2">오류 발생</h3>
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}
      </div>

      {/* 광고 배너 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdBanner position="inline" />
      </div>
    </div>
  );
}

