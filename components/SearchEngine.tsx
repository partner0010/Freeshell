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

  const handleSearch = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!query.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '검색 요청 실패');
      }

      const data = await response.json();
      
      // API 오류가 있으면 에러 표시
      if (data.error) {
        setError(data.message || data.error || '검색 중 오류가 발생했습니다.');
        if (data.details) {
          setError(`${data.error}\n${data.details}`);
        }
        return;
      }
      
      setResult(data);
      addToSearchHistory(query);
      
      // API 상태 로그
      if (data.apiInfo) {
        console.log('[SearchEngine] API 상태:', {
          isRealApiCall: data.apiInfo.isRealApiCall,
          hasApiKey: data.apiInfo.hasApiKey,
          responseTime: data.apiInfo.responseTime,
          message: data.apiInfo.message,
        });
      }
    } catch (err: any) {
      console.error('[SearchEngine] 검색 오류:', err);
      const errorMessage = err.message || '검색 중 오류가 발생했습니다. 다시 시도해주세요.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSearch(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 검색 입력 영역 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="검색어를 입력하세요..."
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-600">최근 검색</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistorySelect(item)}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-blue-50 text-gray-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* API 사용 여부 표시 */}
          {result.apiInfo && (
            <div className={`mb-4 p-3 rounded-lg border ${
              result.apiInfo.isInfiniteAI
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300'
                : result.apiInfo.isRealApiCall 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 text-sm">
                {result.apiInfo.isInfiniteAI ? (
                  <>
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span className="text-indigo-700 font-bold">✨ 무한한 가능성 AI - 스스로 깨우치고 판단</span>
                    <span className="text-gray-500 text-xs ml-2">
                      {result.infiniteAI?.optionsCount || 0}가지 옵션 생성 후 최적 선택
                    </span>
                  </>
                ) : result.apiInfo.isRealApiCall ? (
                  <>
                    <span className="text-green-600 font-semibold">✅ 실제 AI API 사용</span>
                    <span className="text-gray-500">({result.apiInfo.responseTime}ms)</span>
                  </>
                ) : (
                  <>
                    <span className="text-yellow-600 font-semibold">⚠️ 시뮬레이션 모드</span>
                    <span className="text-gray-500 text-xs ml-2">
                      {result.apiInfo.hasApiKey 
                        ? 'API 키가 올바르지 않거나 오류가 발생했습니다.' 
                        : 'GOOGLE_API_KEY를 설정하세요.'}
                    </span>
                  </>
                )}
              </div>
              {result.apiInfo.isInfiniteAI && result.infiniteAI && (
                <div className="mt-2 text-xs text-indigo-600">
                  선택된 접근: <strong>{result.infiniteAI.selectedOption}</strong> | 
                  혁신 수준: <strong>{result.infiniteAI.innovationLevel}%</strong>
                </div>
              )}
              {!result.apiInfo.isRealApiCall && !result.apiInfo.isInfiniteAI && (
                <p className="text-xs text-gray-600 mt-1">
                  {result.apiInfo.message}
                </p>
              )}
            </div>
          )}
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 break-words">
            {result.title || query}
          </h2>
          <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 break-words">
              {result.content}
            </div>
          </div>
        </div>
      )}

      {/* 초기 상태 */}
      {!result && !error && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4 opacity-50" />
          <p className="text-sm text-gray-500">
            검색어를 입력하고 엔터 키를 누르거나 검색 버튼을 클릭하세요
          </p>
        </div>
      )}
    </div>
  );
}
