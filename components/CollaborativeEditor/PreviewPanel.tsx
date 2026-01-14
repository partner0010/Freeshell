/**
 * 실시간 미리보기 패널
 */
'use client';

import { useEditorStore } from '@/store/editorStore';
import { Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';

export default function PreviewPanel() {
  const { previewHtml, previewMode, setPreviewMode, updatePreview } = useEditorStore();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 미리보기 컨트롤 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">미리보기</h3>
          <button
            onClick={updatePreview}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-2 rounded ${
              previewMode === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="모바일"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`p-2 rounded ${
              previewMode === 'tablet'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="태블릿"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-2 rounded ${
              previewMode === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="데스크톱"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 미리보기 iframe */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
        <div
          className="mx-auto bg-white shadow-lg"
          style={{
            width:
              previewMode === 'mobile'
                ? '375px'
                : previewMode === 'tablet'
                ? '768px'
                : '100%',
            maxWidth: previewMode === 'desktop' ? '100%' : 'none',
            minHeight: '600px',
          }}
        >
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            style={{ minHeight: '600px' }}
            title="미리보기"
          />
        </div>
      </div>
    </div>
  );
}
