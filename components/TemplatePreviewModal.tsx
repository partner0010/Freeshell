/**
 * 템플릿 미리보기 모달 (강화 버전)
 */
'use client';

import { useState } from 'react';
import { X, Monitor, Smartphone, Tablet, Code, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WebsiteTemplate } from '@/data/website-templates';

interface TemplatePreviewModalProps {
  template: WebsiteTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (template: WebsiteTemplate) => void;
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export default function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUse,
}: TemplatePreviewModalProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [showCode, setShowCode] = useState(false);

  if (!template || !isOpen) return null;

  const deviceSizes = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-[1024px] mx-auto',
    mobile: 'w-[375px] h-[667px] mx-auto',
  };

  const previewHtml = template.preview.html
    .replace('style.css', '')
    .replace('script.js', '')
    + `<style>${template.preview.css}</style>`
    + (template.preview.js ? `<script>${template.preview.js}</script>` : '');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {template.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {template.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 툴바 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded-lg transition-colors ${
                  device === 'desktop'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-2 rounded-lg transition-colors ${
                  device === 'tablet'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Tablet className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  device === 'mobile'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Smartphone className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCode(!showCode)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showCode
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>코드 보기</span>
              </button>
              <button
                onClick={() => onUse(template)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>템플릿 사용</span>
              </button>
            </div>
          </div>

          {/* 미리보기 영역 */}
          <div className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-gray-900">
            {showCode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">HTML</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{template.preview.html}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">CSS</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{template.preview.css}</code>
                  </pre>
                </div>
                {template.preview.js && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">JavaScript</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{template.preview.js}</code>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${deviceSizes[device]} bg-white rounded-lg shadow-xl overflow-hidden border-4 border-gray-300`}>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  title={template.name}
                />
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>카테고리: {template.category}</span>
              <span>태그: {template.tags.join(', ')}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
