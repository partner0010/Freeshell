'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, ExternalLink, Loader2 } from 'lucide-react';

interface SearchResult {
  source: string;
  title: string;
  url: string;
  snippet: string;
}

export default function CrossSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchSources = [
    { name: 'Google', icon: '🔍' },
    { name: 'Bing', icon: '🔎' },
    { name: 'DuckDuckGo', icon: '🦆' },
    { name: 'Wikipedia', icon: '📚' },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // 실제로는 여러 검색 엔진 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResults([
        {
          source: 'Google',
          title: `${query} 검색 결과`,
          url: `https://google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `${query}에 대한 검색 결과입니다...`,
        },
        {
          source: 'Bing',
          title: `${query} 검색 결과`,
          url: `https://bing.com/search?q=${encodeURIComponent(query)}`,
          snippet: `${query}에 대한 검색 결과입니다...`,
        },
      ]);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">교차 검색</h2>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="여러 검색 엔진에서 검색..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>검색 중...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>검색</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {searchSources.map((source) => (
            <button
              key={source.name}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="mr-1">{source.icon}</span>
              {source.name}
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="space-y-4 mt-6">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded mr-2">
                      {result.source}
                    </span>
                    <h3 className="font-semibold inline">{result.title}</h3>
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{result.snippet}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

