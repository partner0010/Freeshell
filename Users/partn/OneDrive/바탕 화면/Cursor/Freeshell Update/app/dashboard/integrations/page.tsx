'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Zap, Slack, FileText, Globe, Github, Webhook, CheckCircle } from 'lucide-react';

const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Slack 채널에 검색 결과를 공유하세요',
    icon: Slack,
    color: 'from-purple-500 to-pink-500',
    connected: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Notion 페이지에 Spark 결과를 저장하세요',
    icon: FileText,
    color: 'from-gray-700 to-gray-900',
    connected: false,
  },
  {
    id: 'google',
    name: 'Google Drive',
    description: 'Google Drive와 파일을 동기화하세요',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    connected: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: '코드를 GitHub에 직접 커밋하세요',
    icon: Github,
    color: 'from-gray-800 to-gray-900',
    connected: false,
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: '커스텀 웹훅을 설정하여 이벤트를 받으세요',
    icon: Webhook,
    color: 'from-orange-500 to-red-500',
    connected: false,
  },
];

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<string[]>(['google']);

  const toggleConnection = (id: string) => {
    if (connected.includes(id)) {
      setConnected(connected.filter(i => i !== id));
    } else {
      setConnected([...connected, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">통합</h1>
          <p className="text-gray-600 dark:text-gray-400">다양한 서비스와 Shell을 연결하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            const isConnected = connected.includes(integration.id);
            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{integration.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{integration.description}</p>
                <button
                  onClick={() => toggleConnection(integration.id)}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    isConnected
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>연결됨</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>연결하기</span>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

