'use client';

import React, { useState, useMemo } from 'react';
import { Search, Star, Menu, X } from 'lucide-react';
import { MenuSearch } from './MenuSearch';
import { Sidebar } from './Sidebar';

// 메뉴 항목 정의 (카테고리 및 키워드 포함)
const menuItems = [
  // 주요 기능
  { id: 'blocks', label: '블록', category: '주요', keywords: ['블록', '컴포넌트', '요소'] },
  { id: 'styles', label: '스타일', category: '주요', keywords: ['스타일', '디자인', '외관'] },
  { id: 'copilot', label: 'AI', category: '주요', keywords: ['AI', '인공지능', '자동화'] },
  { id: 'pages', label: '페이지', category: '주요', keywords: ['페이지', '화면'] },
  
  // AI 기능
  { id: 'ai-design', label: 'AI디자인', category: 'AI', keywords: ['AI', '디자인', '자동'] },
  { id: 'ai-improve', label: 'AI개선', category: 'AI', keywords: ['AI', '개선', '최적화'] },
  { id: 'free-api', label: '무료AI통합', category: 'AI', keywords: ['무료', 'API', 'AI'] },
  { id: 'advanced-ai', label: '고급AIAPI', category: 'AI', keywords: ['고급', 'API'] },
  
  // 보안
  { id: 'security', label: '보안', category: '보안', keywords: ['보안', '보호'] },
  { id: 'code-audit', label: '코드감사', category: '보안', keywords: ['코드', '감사', '검증'] },
  { id: 'zero-trust', label: 'Zero Trust', category: '보안', keywords: ['제로트러스트'] },
  { id: 'biometric', label: '생체인증', category: '보안', keywords: ['생체', '인증'] },
  
  // 성능
  { id: 'performance', label: '성능최적화', category: '성능', keywords: ['성능', '최적화', '속도'] },
  { id: 'performance-advanced', label: '성능최적화+', category: '성능', keywords: ['고급', '성능'] },
  
  // 디자인
  { id: 'theme', label: '테마', category: '디자인', keywords: ['테마', '색상'] },
  { id: 'gradient', label: '그라디언트', category: '디자인', keywords: ['그라디언트', '색상'] },
  { id: 'typography', label: '타이포', category: '디자인', keywords: ['타이포', '폰트', '텍스트'] },
  { id: 'micro-interactions', label: '마이크로인터랙션', category: '디자인', keywords: ['인터랙션', '애니메이션'] },
  
  // 개발
  { id: 'code-validator', label: '코드검증', category: '개발', keywords: ['코드', '검증'] },
  { id: 'debugging', label: '디버깅', category: '개발', keywords: ['디버깅', '오류'] },
  { id: 'cicd', label: 'CI/CD', category: '개발', keywords: ['CI', 'CD', '배포'] },
];

interface ImprovedSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ImprovedSidebar({ activeTab, onTabChange }: ImprovedSidebarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('menu-favorites') || '[]');
    }
    return [];
  });
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('menu-recent') || '[]');
    }
    return [];
  });

  const handleSelect = (id: string) => {
    onTabChange(id);
    setShowSearch(false);
    
    // 최근 항목 업데이트
    const newRecent = [id, ...recent.filter((item) => item !== id)].slice(0, 10);
    setRecent(newRecent);
    localStorage.setItem('menu-recent', JSON.stringify(newRecent));
  };

  const handleToggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('menu-favorites', JSON.stringify(newFavorites));
  };

  if (showSearch) {
    return (
      <div className="w-80 h-full bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">메뉴 검색</h2>
          <button
            onClick={() => setShowSearch(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        <MenuSearch
          items={menuItems}
          onSelect={handleSelect}
          favorites={favorites}
          recent={recent}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 검색 버튼 */}
      <button
        onClick={() => setShowSearch(true)}
        className="absolute top-4 right-4 z-10 p-2 bg-white border rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="메뉴 검색 (Ctrl+K)"
      >
        <Search size={20} />
      </button>
      
      {/* 즐겨찾기 표시 */}
      {favorites.length > 0 && (
        <div className="absolute top-16 right-4 z-10 p-2 bg-white border rounded-lg shadow-md">
          <div className="text-xs font-semibold text-gray-600 mb-2">즐겨찾기</div>
          <div className="space-y-1">
            {favorites.slice(0, 3).map((id) => {
              const item = menuItems.find((i) => i.id === id);
              if (!item) return null;
              return (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <Star size={12} className="text-yellow-500 fill-current" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      <Sidebar />
    </div>
  );
}

