/**
 * 템플릿 라이브러리 컴포넌트
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Youtube, Twitter, Instagram, Search, Filter, Star, TrendingUp, Clock } from 'lucide-react';
import type { ContentTemplate } from '@/lib/models/ContentTemplate';

type TemplateCategory = 'blog' | 'youtube' | 'sns' | 'instagram' | 'twitter' | 'linkedin' | 'all';

export default function TemplateLibrary() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ContentTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);

  const categories = [
    { id: 'all' as TemplateCategory, name: '전체', icon: FileText },
    { id: 'blog' as TemplateCategory, name: '블로그', icon: FileText },
    { id: 'youtube' as TemplateCategory, name: '유튜브', icon: Youtube },
    { id: 'sns' as TemplateCategory, name: 'SNS', icon: Twitter },
    { id: 'instagram' as TemplateCategory, name: '인스타그램', icon: Instagram },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [selectedCategory, searchQuery, templates]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/templates?action=popular&limit=100');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
        setFilteredTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (template: ContentTemplate) => {
    // 프로젝트 생성 페이지로 이동하며 템플릿 정보 전달
    const templateData = encodeURIComponent(JSON.stringify({
      id: template.id,
      title: template.title,
      category: template.category,
      platform: template.platform,
      content_type: template.category === 'blog' ? 'blog-post' :
                     template.category === 'youtube' ? 'youtube-script' :
                     template.category === 'sns' ? 'sns-post' :
                     template.category === 'instagram' ? 'instagram-caption' :
                     'twitter-thread'
    }));
    
    router.push(`/projects/new?template=${templateData}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blog': return FileText;
      case 'youtube': return Youtube;
      case 'sns': case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      default: return FileText;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">템플릿을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          콘텐츠 템플릿 라이브러리
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {templates.length}개의 실제 사용 가능한 템플릿으로 빠르게 콘텐츠를 제작하세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-8 space-y-4">
        {/* 검색바 */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="템플릿 검색 (제목, 설명, 태그)..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
                {selectedCategory === cat.id && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                    {selectedCategory === 'all' 
                      ? templates.length 
                      : templates.filter(t => t.category === cat.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 결과 개수 */}
      <div className="mb-6 text-sm text-gray-600">
        총 <span className="font-semibold text-gray-900">{filteredTemplates.length}</span>개의 템플릿
      </div>

      {/* 템플릿 그리드 */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">검색 결과가 없습니다.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = getCategoryIcon(template.category);
            return (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-xl overflow-hidden"
              >
                {/* 헤더 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                      template.category === 'blog' ? 'from-blue-500 to-blue-600' :
                      template.category === 'youtube' ? 'from-red-500 to-red-600' :
                      template.category === 'sns' ? 'from-green-500 to-green-600' :
                      'from-pink-500 to-pink-600'
                    } flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {template.isPremium && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                        <Star className="w-3 h-3 inline mr-1" />
                        프리미엄
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                </div>

                {/* 본문 */}
                <div className="p-6">
                  {/* 플랫폼 */}
                  <div className="mb-4">
                    <span className="text-xs text-gray-500">플랫폼:</span>
                    <span className="ml-2 text-sm font-semibold text-gray-700">{template.platform}</span>
                  </div>

                  {/* 섹션 수 */}
                  {template.structure.sections && (
                    <div className="mb-4">
                      <span className="text-xs text-gray-500">구성:</span>
                      <span className="ml-2 text-sm text-gray-700">
                        {template.structure.sections.length}개 섹션
                      </span>
                    </div>
                  )}

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* 사용 버튼 */}
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    템플릿 사용하기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

