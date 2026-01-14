/**
 * AI 협업형 웹/앱 에디터 메인 컴포넌트
 */
'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import TemplateSelector from './TemplateSelector';
import BlockCanvas from './BlockCanvas';
import PreviewPanel from './PreviewPanel';
import AIAssistantPanel from './AIAssistantPanel';
import HistoryControls from './HistoryControls';
import { Layout, Palette, Code, Eye, Sparkles, Undo2, Redo2 } from 'lucide-react';

export default function CollaborativeEditor() {
  const {
    blocks,
    selectedBlockId,
    previewMode,
    canUndo,
    canRedo,
    undo,
    redo,
    updatePreview,
    setPreviewMode,
    resetEditor,
  } = useEditorStore();

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [layout, setLayout] = useState<'split' | 'editor' | 'preview'>('split');

  // 초기 미리보기 업데이트
  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AI 협업형 에디터
            </h1>
            
            {/* 레이아웃 선택 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLayout('editor')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  layout === 'editor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1" />
                에디터
              </button>
              <button
                onClick={() => setLayout('split')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  layout === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Layout className="w-4 h-4 inline mr-1" />
                분할
              </button>
              <button
                onClick={() => setLayout('preview')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  layout === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                미리보기
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 히스토리 컨트롤 */}
            <HistoryControls />

            {/* 템플릿 선택 */}
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              템플릿
            </button>

            {/* AI 도우미 */}
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                showAIAssistant
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI 도우미
            </button>

            {/* 초기화 */}
            <button
              onClick={resetEditor}
              className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm"
            >
              초기화
            </button>
          </div>
        </div>
      </header>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 템플릿 선택기 (모달) */}
        {showTemplateSelector && (
          <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <TemplateSelector
                onSelect={(templateId) => {
                  useEditorStore.getState().loadTemplate(templateId);
                  setShowTemplateSelector(false);
                }}
                onClose={() => setShowTemplateSelector(false)}
              />
            </div>
          </div>
        )}

        {/* 에디터 영역 */}
        {(layout === 'editor' || layout === 'split') && (
          <div className={`${layout === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-200 dark:border-gray-700 overflow-hidden`}>
            <BlockCanvas />
          </div>
        )}

        {/* 미리보기 영역 */}
        {(layout === 'preview' || layout === 'split') && (
          <div className={`${layout === 'split' ? 'w-1/2' : 'w-full'} overflow-hidden`}>
            <PreviewPanel />
          </div>
        )}

        {/* AI 도우미 패널 (사이드바) */}
        {showAIAssistant && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <AIAssistantPanel />
          </div>
        )}
      </div>
    </div>
  );
}
