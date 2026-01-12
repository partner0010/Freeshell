/**
 * AI 실패 시 템플릿 선택 폴백 페이지
 * AI가 작동하지 않을 때 자동으로 이동
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedButton from '@/components/EnhancedButton';
import EnhancedCard from '@/components/EnhancedCard';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function FallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('query');
    if (q) {
      setQuery(q);
      fetchTemplates(q);
    } else {
      fetchDefaultTemplates();
    }
  }, [searchParams]);

  const fetchTemplates = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/website-templates?search=${encodeURIComponent(searchQuery)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        fetchDefaultTemplates();
      }
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      fetchDefaultTemplates();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultTemplates = async () => {
    try {
      const response = await fetch('/api/website-templates?limit=10');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('기본 템플릿 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/editor?template=${templateId}&fallback=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 알림 메시지 */}
          <ScrollAnimation direction="down">
            <EnhancedCard className="mb-8" glass>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    AI 생성에 실패했습니다
                  </h2>
                  <p className="text-gray-600 mb-4">
                    AI가 요청을 처리하지 못했습니다. 아래 템플릿 중 하나를 선택하여 직접 편집할 수 있습니다.
                  </p>
                  <div className="flex gap-2">
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/build/step1')}
                    >
                      다시 시도
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/templates/website')}
                    >
                      전체 템플릿 보기
                    </EnhancedButton>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </ScrollAnimation>

          {/* 추천 템플릿 */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              추천 템플릿
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-gray-600">템플릿을 불러오는 중...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, index) => (
                  <ScrollAnimation key={template.id} direction="up" delay={index * 100}>
                    <EnhancedCard
                      title={template.name}
                      description={template.description}
                      className="cursor-pointer"
                      hover
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          {template.category}
                        </span>
                        <ArrowRight className="w-5 h-5 text-purple-600" />
                      </div>
                    </EnhancedCard>
                  </ScrollAnimation>
                ))}
              </div>
            )}
          </div>

          {/* 안내 */}
          <ScrollAnimation direction="up" delay={300}>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 text-center border-2 border-purple-200">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                템플릿을 선택하면 바로 에디터로 이동합니다
              </h3>
              <p className="text-gray-600 text-sm">
                에디터에서 템플릿을 자유롭게 수정하고 커스터마이징할 수 있습니다
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      <Footer />
    </div>
  );
}
