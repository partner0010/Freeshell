'use client';

import { useState } from 'react';
import { Search, Loader2, ExternalLink, Globe, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface WebSearchResponse {
  query: string;
  results: WebSearchResult[];
  generatedAt: string;
}

export default function WebSearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WebSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('웹 검색 요청 실패');
      }

      const data: WebSearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError('웹 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Web search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">무료 웹 검색</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 text-sm sm:text-base md:text-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-primary text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
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

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4">
              <p className="text-sm sm:text-base text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                {results.results.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {results.results.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block"
                        >
                          <h4 className="font-semibold text-sm sm:text-base md:text-lg text-primary group-hover:underline mb-2 flex items-start gap-2 break-words">
                            <span className="flex-1">{item.title}</span>
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 break-words">
                            {item.snippet}
                          </p>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    검색 결과가 없습니다.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
