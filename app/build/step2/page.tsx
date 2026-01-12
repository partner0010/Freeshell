/**
 * Step 2: 추천 템플릿 5가지 선택
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight, Eye, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRequired from '@/components/AuthRequired';
import { useAuth } from '@/lib/hooks/useAuth';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  features: string[];
}

export default function BuildStep2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isChecking } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const q = searchParams.get('query');
    if (q) {
      setQuery(q);
      // AI 추천 템플릿 가져오기 (실제로는 API 호출)
      fetchRecommendedTemplates(q);
    }
  }, [searchParams]);

  const fetchRecommendedTemplates = async (searchQuery: string) => {
    try {
      // 실제 템플릿 API 호출
      const response = await fetch(`/api/website-templates?search=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        const actualTemplates = (data.templates || []).slice(0, 5).map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          preview: t.preview?.html || '',
          features: t.features || [],
        }));
        
        // 5개 미만이면 더 추가
        if (actualTemplates.length < 5) {
          const allResponse = await fetch('/api/website-templates?limit=100');
          if (allResponse.ok) {
            const allData = await allResponse.json();
            const additional = (allData.templates || [])
              .filter((t: any) => !actualTemplates.some((at: any) => at.id === t.id))
              .slice(0, 5 - actualTemplates.length)
              .map((t: any) => ({
                id: t.id,
                name: t.name,
                description: t.description,
                category: t.category,
                preview: t.preview?.html || '',
                features: t.features || [],
              }));
            setTemplates([...actualTemplates, ...additional].slice(0, 5));
          } else {
            setTemplates(actualTemplates);
          }
        } else {
          setTemplates(actualTemplates);
        }
      } else {
        // API 실패 시 기본 템플릿 사용
        fetchDefaultTemplates();
      }
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      fetchDefaultTemplates();
    }
  };

  const fetchDefaultTemplates = async () => {
    try {
      const response = await fetch('/api/website-templates?limit=5');
      if (response.ok) {
        const data = await response.json();
        setTemplates((data.templates || []).slice(0, 5).map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          preview: t.preview?.html || '',
          features: t.features || [],
        })));
      }
    } catch (error) {
      console.error('기본 템플릿 로드 실패:', error);
    }
  };

  const handleNext = () => {
    if (selectedTemplate) {
      // 템플릿만 사용하기 옵션: 바로 에디터로 이동
      const useTemplateOnly = searchParams.get('templateOnly') === 'true';
      if (useTemplateOnly) {
        router.push(`/editor?template=${selectedTemplate}`);
      } else {
        router.push(`/build/step3?template=${selectedTemplate}&query=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleUseTemplateDirectly = (templateId: string) => {
    // 템플릿만 사용하기: 바로 에디터로 이동
    router.push(`/editor?template=${templateId}`);
  };

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
          message="템플릿을 선택하려면 회원가입이 필요합니다."
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                추천 템플릿
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              &quot;{query}&quot;에 맞는 템플릿을 추천합니다
            </p>
          </div>

          {/* 템플릿 그리드 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`relative bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all border-2 ${
                  selectedTemplate === template.id
                    ? 'border-purple-500 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {selectedTemplate === template.id && (
                  <div className="absolute top-4 right-4 z-10 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Eye className="w-16 h-16 text-purple-400" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 버튼들 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={handleNext}
                disabled={!selectedTemplate}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>AI로 개선하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              {selectedTemplate && (
                <button
                  onClick={() => handleUseTemplateDirectly(selectedTemplate)}
                  className="px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <span>템플릿만 사용하기</span>
                  <Sparkles className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              &quot;템플릿만 사용하기&quot;를 선택하면 바로 에디터로 이동하여 수정할 수 있습니다
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
