/**
 * 히스토리 컨트롤 컴포넌트
 * 실행 취소/복구
 */
'use client';

import { useEditorStore } from '@/store/editorStore';
import { Undo2, Redo2 } from 'lucide-react';

export default function HistoryControls() {
  const { canUndo, canRedo, undo, redo } = useEditorStore();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={undo}
        disabled={!canUndo()}
        className={`p-2 rounded-lg transition-colors ${
          canUndo()
            ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
        }`}
        title="실행 취소 (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className={`p-2 rounded-lg transition-colors ${
          canRedo()
            ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
        }`}
        title="다시 실행 (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  );
}
