'use client';

import { useState } from 'react';
import { Filter, X, Calendar, Globe, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Filters {
  dateRange: 'all' | 'day' | 'week' | 'month' | 'year';
  language: 'all' | 'ko' | 'en' | 'ja' | 'zh';
  type: 'all' | 'text' | 'image' | 'video' | 'document';
  sortBy: 'relevance' | 'date' | 'popularity';
}

export default function AdvancedSearchFilters({ onFilterChange }: { onFilterChange?: (filters: Filters) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dateRange: 'all',
    language: 'all',
    type: 'all',
    sortBy: 'relevance',
  });

  const updateFilter = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: Filters = {
      dateRange: 'all',
      language: 'all',
      type: 'all',
      sortBy: 'relevance',
    };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const hasActiveFilters = filters.dateRange !== 'all' || 
    filters.language !== 'all' || 
    filters.type !== 'all' || 
    filters.sortBy !== 'relevance';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>필터</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-primary rounded-full"></span>
        )}
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
              className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">고급 필터</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>날짜 범위</span>
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => updateFilter('dateRange', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <option value="all">전체</option>
                    <option value="day">오늘</option>
                    <option value="week">이번 주</option>
                    <option value="month">이번 달</option>
                    <option value="year">올해</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>언어</span>
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => updateFilter('language', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <option value="all">전체</option>
                    <option value="ko">한국어</option>
                    <option value="en">영어</option>
                    <option value="ja">일본어</option>
                    <option value="zh">중국어</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>유형</span>
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <option value="all">전체</option>
                    <option value="text">텍스트</option>
                    <option value="image">이미지</option>
                    <option value="video">비디오</option>
                    <option value="document">문서</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">정렬</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <option value="relevance">관련성</option>
                    <option value="date">날짜</option>
                    <option value="popularity">인기</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

