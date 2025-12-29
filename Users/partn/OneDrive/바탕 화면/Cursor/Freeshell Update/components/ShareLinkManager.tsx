'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, Check, Settings, Eye, EyeOff, Calendar, Users } from 'lucide-react';

interface ShareLink {
  id: string;
  url: string;
  title: string;
  access: 'public' | 'private' | 'password';
  password?: string;
  expiresAt?: string;
  views: number;
  createdAt: string;
}

export default function ShareLinkManager({ itemId, itemType }: { itemId: string; itemType: 'search' | 'spark' | 'drive' }) {
  const [links, setLinks] = useState<ShareLink[]>([
    {
      id: '1',
      url: `https://freeshell.co.kr/share/${itemId}`,
      title: '공유 링크 1',
      access: 'public',
      views: 42,
      createdAt: '2024-01-15',
    },
  ]);
  const [copied, setCopied] = useState<string | null>(null);

  const generateLink = () => {
    const newLink: ShareLink = {
      id: Date.now().toString(),
      url: `https://freeshell.co.kr/share/${itemId}-${Date.now()}`,
      title: `공유 링크 ${links.length + 1}`,
      access: 'public',
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLinks([...links, newLink]);
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Link2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">공유 링크</h2>
        </div>
        <button
          onClick={generateLink}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          링크 생성
        </button>
      </div>

      <div className="space-y-4">
        {links.map((link) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold">{link.title}</h3>
                  {link.access === 'public' ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <code className="text-sm bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded flex-1">
                    {link.url}
                  </code>
                  <button
                    onClick={() => handleCopy(link.url, link.id)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {copied === link.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{link.views}회 조회</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{link.createdAt}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

