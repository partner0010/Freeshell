'use client';

import { motion } from 'framer-motion';
import { Book, Code, Zap, Key } from 'lucide-react';
import { useState } from 'react';

const endpoints = [
  {
    method: 'POST',
    path: '/api/search',
    description: 'AI 검색 엔진으로 검색 쿼리를 처리합니다',
    params: { query: 'string (required)' },
    example: {
      request: { query: '파리 여행 계획' },
      response: { title: '...', content: '...', sources: [] },
    },
  },
  {
    method: 'POST',
    path: '/api/spark',
    description: 'Spark 워크스페이스 작업을 생성합니다',
    params: { prompt: 'string (required)' },
    example: {
      request: { prompt: '비디오 제작' },
      response: { id: '...', status: 'completed', result: {} },
    },
  },
  {
    method: 'POST',
    path: '/api/generate',
    description: '다중 모달 콘텐츠를 생성합니다',
    params: { type: 'video|document|presentation|website', prompt: 'string (required)' },
    example: {
      request: { type: 'document', prompt: '...' },
      response: { url: '...', format: 'pdf' },
    },
  },
  {
    method: 'GET',
    path: '/api/models',
    description: '사용 가능한 AI 모델 목록을 조회합니다',
    params: {},
    example: {
      response: { models: [{ id: 'gpt-4', name: 'GPT-4.1', provider: 'OpenAI' }] },
    },
  },
];

export default function APIDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Code className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            API <span className="gradient-text">문서</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Shell API를 사용하여 애플리케이션을 구축하세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-4">
              <h2 className="font-semibold mb-4 flex items-center space-x-2">
                <Book className="w-5 h-5" />
                <span>엔드포인트</span>
              </h2>
              <div className="space-y-2">
                {endpoints.map((endpoint, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedEndpoint(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedEndpoint === index
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono ${
                        endpoint.method === 'POST' ? 'text-green-500' : 'text-blue-500'
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className="text-sm truncate">{endpoint.path}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              key={selectedEndpoint}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded text-sm font-mono ${
                  endpoints[selectedEndpoint].method === 'POST'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {endpoints[selectedEndpoint].method}
                </span>
                <code className="text-lg font-mono">{endpoints[selectedEndpoint].path}</code>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {endpoints[selectedEndpoint].description}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>파라미터</span>
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm">
                      {JSON.stringify(endpoints[selectedEndpoint].params, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>예제</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">요청:</p>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(endpoints[selectedEndpoint].example.request || endpoints[selectedEndpoint].example.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                    {endpoints[selectedEndpoint].example.response && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">응답:</p>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(endpoints[selectedEndpoint].example.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

