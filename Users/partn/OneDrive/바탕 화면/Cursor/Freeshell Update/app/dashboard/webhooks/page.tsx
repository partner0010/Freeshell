'use client';

import WebhookManager from '@/components/WebhookManager';

export default function WebhooksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">웹훅 설정</h1>
          <p className="text-gray-600 dark:text-gray-400">이벤트를 외부 시스템으로 전송하세요</p>
        </div>
        <WebhookManager />
      </div>
    </div>
  );
}
