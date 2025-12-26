/**
 * 실시간 검색 제안
 * 사용자 입력에 따른 실시간 검색 제안 제공
 */

import { debounce } from '@/lib/utils/debounce';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'suggestion';
  metadata?: Record<string, any>;
}

class SearchSuggestionManager {
  private suggestions: SearchSuggestion[] = [];
  private recentSearches: string[] = [];
  private maxRecentSearches = 10;

  /**
   * 최근 검색어 추가
   */
  addRecentSearch(query: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    // 중복 제거
    this.recentSearches = this.recentSearches.filter(s => s !== query);
    // 앞에 추가
    this.recentSearches.unshift(query);
    // 최대 개수 제한
    this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);

    // localStorage에 저장
    try {
      localStorage.setItem('freeshell-recent-searches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('최근 검색어 저장 실패:', error);
    }
  }

  /**
   * 최근 검색어 로드
   */
  loadRecentSearches(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('freeshell-recent-searches');
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      }
    } catch (error) {
      console.error('최근 검색어 로드 실패:', error);
    }
  }

  /**
   * 검색 제안 가져오기
   */
  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query.trim()) {
      // 빈 쿼리면 최근 검색어 반환
      return this.recentSearches.map((text, index) => ({
        id: `recent-${index}`,
        text,
        type: 'recent' as const,
      }));
    }

    const suggestions: SearchSuggestion[] = [];

    // 최근 검색어에서 매칭되는 것 찾기
    const matchingRecent = this.recentSearches
      .filter(s => s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map((text, index) => ({
        id: `recent-match-${index}`,
        text,
        type: 'recent' as const,
      }));

    suggestions.push(...matchingRecent);

    // 인기 검색어 (실제로는 API에서 가져올 수 있음)
    const popularSearches = [
      'AI 코드 생성',
      '콘텐츠 생성',
      '전자서명',
      '디버깅',
      '사이트 검증',
    ];

    const matchingPopular = popularSearches
      .filter(s => s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map((text, index) => ({
        id: `popular-${index}`,
        text,
        type: 'popular' as const,
      }));

    suggestions.push(...matchingPopular);

    // AI 기반 제안 (실제로는 API 호출)
    // 여기서는 간단한 예시만 제공
    if (query.length > 2) {
      const aiSuggestions: SearchSuggestion[] = [
        {
          id: `suggestion-1`,
          text: `${query} 관련 도움말`,
          type: 'suggestion',
        },
        {
          id: `suggestion-2`,
          text: `${query} 생성하기`,
          type: 'suggestion',
        },
      ];
      suggestions.push(...aiSuggestions);
    }

    return suggestions.slice(0, 10); // 최대 10개
  }

  /**
   * 검색 제안 (디바운싱)
   */
  getSuggestionsDebounced = debounce(
    async (query: string, callback: (suggestions: SearchSuggestion[]) => void) => {
      const suggestions = await this.getSuggestions(query);
      callback(suggestions);
    },
    300
  );
}

// 싱글톤 인스턴스
export const searchSuggestionManager = typeof window !== 'undefined' ? new SearchSuggestionManager() : null;

// 초기화 시 최근 검색어 로드
if (searchSuggestionManager) {
  searchSuggestionManager.loadRecentSearches();
}

