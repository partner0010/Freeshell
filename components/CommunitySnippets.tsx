/**
 * 커뮤니티 스니펫 라이브러리
 * 사용자 간 코드 스니펫 공유
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  Code, 
  Star, 
  Download, 
  Upload, 
  Search,
  TrendingUp,
  Clock,
  User,
  ThumbsUp
} from 'lucide-react';
import EnhancedButton from './EnhancedButton';
import EnhancedCard from './EnhancedCard';

interface CommunitySnippet {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  code: string;
  language: string;
  category: string;
  tags: string[];
  rating: number;
  likes: number;
  downloads: number;
  createdAt: string;
}

export default function CommunitySnippets({
  onInsert,
}: {
  onInsert: (code: string) => void;
}) {
  const [snippets, setSnippets] = useState<CommunitySnippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadSnippets();
  }, [selectedCategory, searchQuery]);

  const loadSnippets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/snippets/community?category=${selectedCategory}&search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSnippets(data.snippets || []);
      }
    } catch (error) {
      console.error('스니펫 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (snippetId: string) => {
    try {
      const response = await fetch(`/api/snippets/community/${snippetId}/like`, {
        method: 'POST',
      });
      if (response.ok) {
        loadSnippets();
      }
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'react', name: 'React' },
    { id: 'animation', name: '애니메이션' },
    { id: 'utility', name: '유틸리티' },
  ];

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">커뮤니티 스니펫</h3>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title="스니펫 업로드"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        {/* 검색 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="스니펫 검색..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>

        {/* 카테고리 */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 스니펫 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : snippets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">스니펫이 없습니다</p>
          </div>
        ) : (
          snippets.map(snippet => (
            <div
              key={snippet.id}
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">{snippet.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{snippet.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {snippet.language}
                </span>
                {snippet.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {snippet.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {snippet.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {snippet.downloads}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {snippet.userName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(snippet.code)}
                  icon={Code}
                  fullWidth
                >
                  사용하기
                </EnhancedButton>
                <button
                  onClick={() => handleLike(snippet.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
