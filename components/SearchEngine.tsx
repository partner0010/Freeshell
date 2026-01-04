'use client';

import { useState } from 'react';
import { Search, History, Sparkles } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';

export default function SearchEngine() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToSearchHistory, searchHistory } = useSearchStore();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('검색 요청 실패');
      }

      const data = await response.json();
      setResult(data);
      addToSearchHistory(query);
    } catch (err) {
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 검색 입력 영역 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="검색어를 입력하세요..."
              className="w-full pl-10 pr-4 py-3 md:py-4 text-sm sm:text-base md:text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 md:px-8 md:py-4 bg-primary text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">검색 중...</span>
                <span className="sm:hidden">검색...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>검색</span>
              </>
            )}
          </button>
        </div>

        {/* 검색 기록 */}
        {searchHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">최근 검색</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistorySelect(item)}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 결과 표시 영역 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 mb-6">
          <p className="text-sm sm:text-base text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white break-words">
            {result.title || query}
          </h2>
          <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300 break-words">
              {result.content}
            </div>
          </div>
        </div>
      )}

      {/* 초기 상태 */}
      {!result && !error && !isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 md:p-16 text-center">
          <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary mx-auto mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-gray-900 dark:text-white">
            AI 검색 엔진
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            검색어를 입력하고 엔터 키를 누르거나 검색 버튼을 클릭하세요.
          </p>
        </div>
      )}
    </div>
  );
}
