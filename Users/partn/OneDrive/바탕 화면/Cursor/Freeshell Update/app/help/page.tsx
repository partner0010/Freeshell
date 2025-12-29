'use client';

import { motion } from 'framer-motion';
import { HelpCircle, Search, Book, MessageCircle, Video, FileText } from 'lucide-react';
import { useState } from 'react';

const categories = [
  { id: 'getting-started', name: '시작하기', icon: Book },
  { id: 'search', name: '검색 기능', icon: Search },
  { id: 'spark', name: 'Spark 워크스페이스', icon: FileText },
  { id: 'drive', name: 'AI 드라이브', icon: Video },
];

const faqs = [
  {
    category: 'getting-started',
    question: 'Shell은 무엇인가요?',
    answer: 'Shell은 AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션입니다. 실시간으로 맞춤형 정보를 제공하고, 다양한 AI 기능을 통합하여 사용자의 작업을 자동화합니다.',
  },
  {
    category: 'search',
    question: '검색 결과는 어떻게 생성되나요?',
    answer: '여러 AI 모델을 동시에 활용하여 다양한 출처의 정보를 통합하고, 실시간으로 맞춤형 Spark 페이지를 생성합니다.',
  },
  {
    category: 'spark',
    question: 'Spark 워크스페이스는 무엇인가요?',
    answer: 'Spark 워크스페이스는 노코드 AI 에이전트로, 자연어로 요구사항을 설명하면 AI가 자동으로 복잡한 작업을 처리합니다.',
  },
  {
    category: 'drive',
    question: 'AI 드라이브에 무엇을 저장할 수 있나요?',
    answer: '생성된 문서, 이미지, 동영상, 프레젠테이션, 웹사이트 등 모든 AI 생성 콘텐츠를 저장하고 관리할 수 있습니다.',
  },
];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            도움말 <span className="gradient-text">센터</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            필요한 정보를 빠르게 찾아보세요
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="질문을 검색하세요..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

