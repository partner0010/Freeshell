'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Bookmark, Share2, Download, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AICopilot from './AICopilot';

interface SearchResultPageProps {
  result: {
    title: string;
    content: string;
    sources: string[];
    generatedAt: string;
  };
}

export default function SearchResultPage({ result }: SearchResultPageProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Spark 페이지</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{result.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              생성일: {new Date(result.generatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="prose dark:prose-invert max-w-none mb-8">
          <ReactMarkdown>{result.content}</ReactMarkdown>
        </div>

        {/* 출처 */}
        {result.sources.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">참고 출처</h3>
            <div className="space-y-2">
              {result.sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">{source}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* AI 코파일럿 */}
      <AICopilot pageContent={result.content} />
    </div>
  );
}

