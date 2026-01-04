import { create } from 'zustand';

interface SearchStore {
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchHistory: [],
  addToSearchHistory: (query: string) => {
    set((state) => {
      // 중복 제거 및 최신 항목을 앞에 추가
      const filtered = state.searchHistory.filter((item) => item !== query);
      return {
        searchHistory: [query, ...filtered].slice(0, 10), // 최대 10개만 유지
      };
    });
  },
  clearSearchHistory: () => {
    set({ searchHistory: [] });
  },
}));

