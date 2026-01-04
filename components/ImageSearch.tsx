'use client';

import { useState } from 'react';
import { Search, Loader2, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ImageResult {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  source: string;
  pageUrl: string;
}

interface ImageSearchResponse {
  query: string;
  results: ImageResult[];
  generatedAt: string;
}

export default function ImageSearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ImageSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/image-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, perPage: 20 }),
      });

      if (!response.ok) {
        throw new Error('이미지 검색 요청 실패');
      }

      const data: ImageSearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError('이미지 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Image search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">무료 이미지 검색</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색할 이미지 키워드를 입력하세요..."
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
              >
                <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  총 {results.results.length}개의 이미지를 찾았습니다 (Pexels, Unsplash, Pixabay)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                  {results.results.map((item, index) => (
                    <motion.div
                      key={`${item.source}-${item.id}-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md aspect-square"
                    >
                      <Image
                        src={item.thumbnail}
                        alt={item.alt}
                        fill
                        className="object-cover"
                        loading="lazy"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                        <div className="text-white text-xs text-center mb-2 break-words">
                          <p className="font-semibold">{item.alt.split(',')[0]}</p>
                          <p className="text-gray-300 text-[10px]">{item.source}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <a
                            href={item.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white text-gray-900 rounded text-[10px] sm:text-xs hover:bg-gray-100 flex items-center justify-center gap-1 whitespace-nowrap"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>보기</span>
                          </a>
                          <a
                            href={item.url}
                            download
                            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-500 text-white rounded text-[10px] sm:text-xs hover:bg-blue-600 flex items-center justify-center gap-1 whitespace-nowrap"
                          >
                            <Download className="w-3 h-3" />
                            <span>다운</span>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {results.results.length === 0 && (
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
