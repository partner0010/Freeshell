/**
 * Step 3: 선택된 템플릿에 프롬프트 추가 작성
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, X, ArrowRight, Sparkles, Lightbulb } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRequired from '@/components/AuthRequired';
import { useAuth } from '@/lib/hooks/useAuth';

export default function BuildStep3Page() {
  const { isAuthenticated, isLoading: isChecking } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [additionalPrompts, setAdditionalPrompts] = useState<string[]>(['']);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const q = searchParams.get('query');
    const t = searchParams.get('template');
    if (q) setQuery(q);
    if (t) setTemplateId(t);
  }, [searchParams]);

  const addPrompt = () => {
    setAdditionalPrompts([...additionalPrompts, '']);
  };

  const removePrompt = (index: number) => {
    setAdditionalPrompts(additionalPrompts.filter((_, i) => i !== index));
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...additionalPrompts];
    newPrompts[index] = value;
    setAdditionalPrompts(newPrompts);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const allPrompts = [query, ...additionalPrompts.filter(p => p.trim())].join('\n');
    router.push(`/build/generate?template=${templateId}&prompts=${encodeURIComponent(allPrompts)}`);
  };

  const suggestions = [
    '색상을 파란색으로 변경해줘',
    '반응형 디자인으로 만들어줘',
    '다크 모드를 추가해줘',
    '애니메이션 효과를 추가해줘',
    '소셜 미디어 링크를 추가해줘',
  ];

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">확인 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <AuthRequired 
          message="프롬프트를 추가하려면 회원가입이 필요합니다."
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                추가 요구사항 작성
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              원하는 기능이나 스타일을 추가로 요청하세요
            </p>
          </div>

          {/* 기본 요청 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">기본 요청</h3>
            </div>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{query}</p>
          </div>

          {/* 추가 요청 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900">추가 요청사항</h3>
              </div>
              <button
                onClick={addPrompt}
                className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>추가</span>
              </button>
            </div>
            <div className="space-y-3">
              {additionalPrompts.map((prompt, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => updatePrompt(index, e.target.value)}
                    placeholder="예: 색상을 파란색으로 변경해줘"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  {additionalPrompts.length > 1 && (
                    <button
                      onClick={() => removePrompt(index)}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 추천 요청 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="font-bold text-gray-900 mb-4">추천 요청사항</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const emptyIndex = additionalPrompts.findIndex(p => !p.trim());
                    if (emptyIndex >= 0) {
                      updatePrompt(emptyIndex, suggestion);
                    } else {
                      addPrompt();
                      setTimeout(() => {
                        updatePrompt(additionalPrompts.length, suggestion);
                      }, 0);
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-100 hover:text-purple-600 transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>준비 중...</span>
                </>
              ) : (
                <>
                  <span>웹사이트 생성하기</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
