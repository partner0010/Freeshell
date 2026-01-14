/**
 * Diff 시각화 컴포넌트
 * 코드 변경 사항을 명확하게 표시
 */
'use client';

import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CodeDiff } from '@/lib/services/diff-manager';

interface DiffViewerProps {
  diffs: CodeDiff[];
  onApply?: () => void;
  onReject?: () => void;
  fileName?: string;
}

export default function DiffViewer({
  diffs,
  onApply,
  onReject,
  fileName,
}: DiffViewerProps) {
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());

  const toggleLine = (line: number) => {
    const newExpanded = new Set(expandedLines);
    if (newExpanded.has(line)) {
      newExpanded.delete(line);
    } else {
      newExpanded.add(line);
    }
    setExpandedLines(newExpanded);
  };

  const hasChanges = diffs.some(d => d.type !== 'context');

  if (!hasChanges) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">변경 사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            변경 사항 {fileName && `(${fileName})`}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {diffs.filter(d => d.type === 'add').length}개 추가,{' '}
            {diffs.filter(d => d.type === 'remove').length}개 제거,{' '}
            {diffs.filter(d => d.type === 'modify').length}개 수정
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onApply && (
            <button
              onClick={onApply}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              적용
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              거부
            </button>
          )}
        </div>
      </div>

      {/* Diff 내용 */}
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <tbody>
            {diffs.map((diff, index) => {
              const isExpanded = expandedLines.has(diff.line);
              const showContext = diff.type === 'context' && !isExpanded;

              return (
                <tr
                  key={index}
                  className={`${
                    diff.type === 'add'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : diff.type === 'remove'
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : diff.type === 'modify'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-gray-50 dark:bg-gray-800'
                  } ${
                    showContext ? 'opacity-50' : ''
                  } hover:bg-opacity-80 transition-colors`}
                >
                  <td className="px-4 py-2 text-right text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 w-16">
                    {diff.line}
                  </td>
                  <td className="px-4 py-2 text-center w-8 border-r border-gray-200 dark:border-gray-700">
                    {diff.type === 'add' && (
                      <span className="text-green-600 dark:text-green-400 font-bold">+</span>
                    )}
                    {diff.type === 'remove' && (
                      <span className="text-red-600 dark:text-red-400 font-bold">-</span>
                    )}
                    {diff.type === 'modify' && (
                      <span className="text-yellow-600 dark:text-yellow-400 font-bold">~</span>
                    )}
                    {diff.type === 'context' && (
                      <span className="text-gray-400"> </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {diff.type === 'remove' && diff.oldCode && (
                      <code className="text-red-700 dark:text-red-300 line-through">
                        {diff.oldCode}
                      </code>
                    )}
                    {diff.type === 'add' && diff.newCode && (
                      <code className="text-green-700 dark:text-green-300">
                        {diff.newCode}
                      </code>
                    )}
                    {diff.type === 'modify' && (
                      <div>
                        {diff.oldCode && (
                          <div className="text-red-700 dark:text-red-300 line-through mb-1">
                            <code>{diff.oldCode}</code>
                          </div>
                        )}
                        {diff.newCode && (
                          <div className="text-green-700 dark:text-green-300">
                            <code>{diff.newCode}</code>
                          </div>
                        )}
                      </div>
                    )}
                    {diff.type === 'context' && diff.oldCode && (
                      <code className="text-gray-600 dark:text-gray-400">
                        {diff.oldCode}
                      </code>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 w-32">
                    {diff.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
