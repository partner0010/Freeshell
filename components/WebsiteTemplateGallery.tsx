/**
 * 웹사이트/앱 템플릿 갤러리 컴포넌트
 * 미리보기 기능과 함께 템플릿 선택
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Code, 
  Eye, 
  Download, 
  Search, 
  Filter, 
  Grid, 
  List,
  Sparkles,
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  X
} from 'lucide-react';
import type { WebsiteTemplate } from '@/data/website-templates';
import TemplatePreviewModal from './TemplatePreviewModal';

type ViewMode = 'grid' | 'list';
type SortBy = 'popular' | 'newest' | 'name';

function WebsiteTemplateGallery() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WebsiteTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [previewTemplate, setPreviewTemplate] = useState<WebsiteTemplate | null>(null);
  
  // TemplatePreviewModal import 추가 필요
  const TemplatePreviewModal = require('./TemplatePreviewModal').default;
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: '전체', count: 0 },
    { id: 'landing', name: '랜딩 페이지', count: 0 },
    { id: 'blog', name: '블로그', count: 0 },
    { id: 'portfolio', name: '포트폴리오', count: 0 },
    { id: 'business', name: '비즈니스', count: 0 },
    { id: 'ecommerce', name: '쇼핑몰', count: 0 },
    { id: 'app', name: '웹 앱', count: 0 },
    { id: 'dashboard', name: '대시보드', count: 0 },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterAndSortTemplates();
  }, [selectedCategory, searchQuery, sortBy, templates]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/website-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTemplates = () => {
    let filtered = [...templates];

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return 0; // 생성 시간 기준 (현재는 랜덤)
        case 'popular':
        default:
          return 0; // 인기도 기준 (현재는 랜덤)
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (template: WebsiteTemplate) => {
    // 에디터로 직접 이동 (템플릿 ID만 전달)
    router.push(`/editor?template=${template.id}`);
  };

  const handlePreview = (template: WebsiteTemplate) => {
    setPreviewTemplate(template);
  };

  const getCategoryName = (category: string) => {
    return categories.find(c => c.id === category)?.name || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                웹사이트/앱 템플릿 갤러리
              </h1>
              <p className="text-gray-600">
                {filteredTemplates.length}개의 템플릿 중에서 선택하세요
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="템플릿 검색..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="popular">인기순</option>
              <option value="newest">최신순</option>
              <option value="name">이름순</option>
            </select>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 템플릿 그리드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">템플릿을 불러오는 중...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">템플릿을 찾을 수 없습니다.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className={`bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all overflow-hidden group ${
                  viewMode === 'list' ? 'flex gap-4' : ''
                }`}
              >
                {/* 미리보기 썸네일 */}
                <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full h-48'} bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden`}>
                  {(() => {
                    // HTML에서 외부 리소스 링크 제거하고 인라인 스타일/스크립트 추가
                    let thumbnailHtml = template.preview.html;
                    thumbnailHtml = thumbnailHtml.replace(/<link[^>]*>/gi, '');
                    thumbnailHtml = thumbnailHtml.replace(/<script[^>]*src=["'][^"']*["'][^>]*><\/script>/gi, '');
                    
                    if (thumbnailHtml.includes('</head>')) {
                      thumbnailHtml = thumbnailHtml.replace('</head>', `<style>${template.preview.css}</style></head>`);
                    } else if (thumbnailHtml.includes('<head>')) {
                      thumbnailHtml = thumbnailHtml.replace('<head>', `<head><style>${template.preview.css}</style>`);
                    } else {
                      thumbnailHtml = `<head><style>${template.preview.css}</style></head>${thumbnailHtml}`;
                    }
                    
                    if (template.preview.js) {
                      if (thumbnailHtml.includes('</body>')) {
                        thumbnailHtml = thumbnailHtml.replace('</body>', `<script>${template.preview.js}</script></body>`);
                      } else {
                        thumbnailHtml = `${thumbnailHtml}<script>${template.preview.js}</script>`;
                      }
                    }
                    
                    return (
                      <iframe
                        srcDoc={thumbnailHtml}
                        className="w-full h-full border-0 pointer-events-none scale-75 origin-top-left"
                        style={{ width: '133.33%', height: '133.33%' }}
                        title={template.name}
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => handlePreview(template)}
                        className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>미리보기</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 템플릿 정보 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{template.name}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {getCategoryName(template.category)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                  
                  {/* 태그 */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>사용하기</span>
                    </button>
                    <button
                      onClick={() => handlePreview(template)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 강화된 미리보기 모달 */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={(template: WebsiteTemplate) => {
          handleUseTemplate(template);
          setPreviewTemplate(null);
        }}
      />
    </div>
  );
}

export default WebsiteTemplateGallery;
