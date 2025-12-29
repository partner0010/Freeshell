'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Webhook, Plus, Trash2, Copy, Check, ExternalLink } from 'lucide-react';

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
}

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      url: 'https://example.com/webhook',
      events: ['search.completed', 'spark.created'],
      secret: 'whsec_••••••••',
      active: true,
      createdAt: '2024-01-10',
    },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] });
  const [copied, setCopied] = useState<string | null>(null);

  const availableEvents = [
    'search.completed',
    'spark.created',
    'spark.completed',
    'file.uploaded',
    'user.registered',
  ];

  const handleCreate = () => {
    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      url: newWebhook.url,
      events: newWebhook.events,
      secret: `whsec_${Math.random().toString(36).substring(7)}`,
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ url: '', events: [] });
    setIsCreating(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Webhook className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">웹훅 관리</h2>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>웹훅 추가</span>
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">웹훅 URL</label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://example.com/webhook"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">이벤트</label>
                <div className="space-y-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                          } else {
                            setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  생성
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewWebhook({ url: '', events: [] });
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <motion.div
            key={webhook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <a
                    href={webhook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary flex items-center space-x-1"
                  >
                    <span>{webhook.url}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {webhook.active ? (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                      활성
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded text-xs">
                      비활성
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                    >
                      {event}
                    </span>
                  ))}
                </div>
                {webhook.secret && (
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                      {webhook.secret}
                    </code>
                    <button
                      onClick={() => handleCopy(webhook.secret!, webhook.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      {copied === webhook.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setWebhooks(webhooks.filter(w => w.id !== webhook.id))}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

