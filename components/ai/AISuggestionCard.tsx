/**
 * AI 제안 카드 컴포넌트
 */
'use client';

import { AISuggestion } from '@/store/editorStore';
import { Check, X, AlertTriangle, Lightbulb, Zap, Bug } from 'lucide-react';
import DiffViewer from '../DiffViewer';

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onApply: () => void;
  onDismiss: () => void;
}

export default function AISuggestionCard({
  suggestion,
  onApply,
  onDismiss,
}: AISuggestionCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'bug':
        return <Bug className="w-4 h-4" />;
      case 'optimization':
        return <Zap className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (suggestion.severity) {
      case 'high':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {suggestion.type === 'bug'
              ? '버그'
              : suggestion.type === 'optimization'
              ? '최적화'
              : '개선'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {suggestion.severity === 'high'
              ? '높음'
              : suggestion.severity === 'medium'
              ? '중간'
              : '낮음'}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
        {suggestion.message}
      </p>

      {suggestion.reason && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          이유: {suggestion.reason}
        </p>
      )}

      {/* Diff 표시 */}
      {suggestion.diffs && suggestion.diffs.length > 0 && (
        <div className="mb-3">
          <DiffViewer
            diffs={suggestion.diffs}
            fileName={`블록 ${suggestion.blockId}`}
          />
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onApply}
          className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          적용
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          거부
        </button>
      </div>
    </div>
  );
}
