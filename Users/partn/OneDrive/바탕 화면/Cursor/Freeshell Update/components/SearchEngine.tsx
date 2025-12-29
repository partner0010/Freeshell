'use client';

import { useState } from 'react';
import { Search, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import ModelSelector from './ModelSelector';
import SearchHistory, { addToSearchHistory } from './SearchHistory';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import SearchResultPage from './SearchResultPage';
import VoiceSearch from './VoiceSearch';

interface SearchResult {
  title: string;
  content: string;
  sources: string[];
  generatedAt: string;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
}

export default function SearchEngine() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

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
      addToSearchHistory(query); // 검색 기록에 추가
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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI 검색 엔진</h2>
              <p className="text-gray-600 dark:text-gray-400">실시간 맞춤형 페이지 생성</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AdvancedSearchFilters />
            <SearchHistory onSelect={handleHistorySelect} />
            <ModelSelector onSelect={setSelectedModel} />
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="검색어를 입력하세요..."
            className="w-full pl-12 pr-32 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <VoiceSearch
              onTranscript={(text) => {
                setQuery(text);
                handleSearch();
              }}
              onError={(error) => setError(error)}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '검색'
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-gray-600 dark:text-gray-400">AI가 맞춤형 페이지를 생성하고 있습니다...</p>
              <div className="mt-4 flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <SearchResultPage result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

