/**
 * 템플릿 마켓플레이스 페이지
 * 사용자 간 템플릿 공유
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, 
  Star, 
  Download, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  Eye,
  MessageSquare
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedButton from '@/components/EnhancedButton';
import EnhancedCard from '@/components/EnhancedCard';
import ScrollAnimation from '@/components/ScrollAnimation';
import PageHeader from '@/components/PageHeader';
import AuthRequired from '@/components/AuthRequired';
import { checkAuth } from '@/lib/utils/auth-check';

interface MarketplaceTemplate {
  id: string;
  userId: string;
  userName: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  preview?: string;
  rating: number;
  reviewsCount: number;
  downloads: number;
  createdAt: string;
}

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, searchQuery, sortBy]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);

      const response = await fetch(`/api/templates/marketplace?${params.toString()}`);
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

  const handleDownload = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/marketplace`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, download: true }),
      });

      if (response.ok) {
        // 템플릿 다운로드 로직
        const templateResponse = await fetch(`/api/templates/marketplace/${templateId}`);
        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          // 에디터로 이동
          window.location.href = `/editor?template=${templateData.template.id}&source=marketplace`;
        }
      }
    } catch (error) {
      console.error('다운로드 실패:', error);
    }
  };

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'landing', name: '랜딩 페이지' },
    { id: 'blog', name: '블로그' },
    { id: 'portfolio', name: '포트폴리오' },
    { id: 'business', name: '비즈니스' },
    { id: 'ecommerce', name: '쇼핑몰' },
    { id: 'app', name: '웹 앱' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <PageHeader
        title="템플릿 마켓플레이스"
        description="커뮤니티에서 공유하는 템플릿을 탐색하고 다운로드하세요"
        icon={TrendingUp}
        action={
          <EnhancedButton
            variant="gradient"
            onClick={() => setShowUploadModal(true)}
            icon={Upload}
          >
            템플릿 업로드
          </EnhancedButton>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* 필터 및 검색 */}
        <ScrollAnimation direction="down">
          <EnhancedCard className="mb-8">
            <div className="space-y-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="템플릿 검색..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* 카테고리 및 정렬 */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="popular">인기순</option>
                  <option value="rating">평점순</option>
                  <option value="newest">최신순</option>
                </select>
              </div>
            </div>
          </EnhancedCard>
        </ScrollAnimation>

        {/* 템플릿 그리드 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">템플릿을 불러오는 중...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">템플릿이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <ScrollAnimation key={template.id} direction="up" delay={index * 50}>
                <EnhancedCard className="hover:shadow-xl transition-shadow" hover>
                  <div className="mb-4">
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                      {template.preview ? (
                        <img src={template.preview} alt={template.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Eye className="w-16 h-16 text-purple-400" />
                      )}
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">{template.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{template.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {template.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {template.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {template.reviewsCount}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">by {template.userName}</span>
                      <EnhancedButton
                        variant="gradient"
                        size="sm"
                        onClick={() => handleDownload(template.id)}
                        icon={Download}
                      >
                        다운로드
                      </EnhancedButton>
                    </div>
                  </div>
                </EnhancedCard>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
