'use client';

import { useState, useEffect } from 'react';
import { History, Clock, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

export default function SearchHistory({ onSelect }: { onSelect?: (query: string) => void }) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 검색 기록 불러오기
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const removeItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  if (history.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
      >
        <History className="w-5 h-5" />
        <span>검색 기록</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold">최근 검색</h3>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  모두 삭제
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between group"
                  >
                    <button
                      onClick={() => {
                        onSelect?.(item.query);
                        setIsOpen(false);
                      }}
                      className="flex-1 flex items-center space-x-3 text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">{item.query}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.timestamp).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// 검색 기록에 추가하는 유틸리티 함수
export function addToSearchHistory(query: string) {
  const saved = localStorage.getItem('searchHistory');
  const history: SearchHistoryItem[] = saved ? JSON.parse(saved) : [];
  
  const newItem: SearchHistoryItem = {
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
  };

  // 중복 제거 및 최신순 정렬
  const filtered = history.filter(item => item.query !== query);
  const updated = [newItem, ...filtered].slice(0, 10); // 최대 10개만 저장

  localStorage.setItem('searchHistory', JSON.stringify(updated));
}

