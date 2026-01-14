/**
 * 블록 기본 컴포넌트
 */
'use client';

import { Block as BlockType } from '@/store/editorStore';
import { Edit2, Trash2, Copy } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

interface BlockProps {
  block: BlockType;
  isSelected: boolean;
}

export default function BlockComponent({ block, isSelected }: BlockProps) {
  const { updateBlock, deleteBlock, duplicateBlock } = useEditorStore();

  const handleContentChange = (newContent: string) => {
    updateBlock(block.id, { content: newContent });
  };

  return (
    <div
      className={`relative border-2 rounded-lg p-4 bg-white dark:bg-gray-800 transition-all ${
        isSelected
          ? 'border-blue-600 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      style={{
        width: `${block.size.width}px`,
        height: `${block.size.height}px`,
        ...block.styles,
      }}
    >
      {/* 블록 내용 */}
      <div className="h-full overflow-auto">
        {block.type === 'text' && (
          <textarea
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full resize-none border-0 focus:outline-none bg-transparent"
            placeholder="텍스트 입력..."
          />
        )}
        {block.type === 'code' && (
          <textarea
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full resize-none border-0 focus:outline-none bg-transparent font-mono text-sm"
            placeholder="코드 입력..."
          />
        )}
        {block.type === 'image' && (
          <div className="flex flex-col items-center justify-center h-full">
            <input
              type="text"
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="이미지 URL"
            />
            {block.content && (
              <img
                src={block.content}
                alt="Block"
                className="mt-2 max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        )}
        {block.type === 'container' && (
          <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-2">
            <textarea
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full resize-none border-0 focus:outline-none bg-transparent"
              placeholder="HTML 컨텐츠..."
            />
          </div>
        )}
      </div>

      {/* 선택 시 툴바 */}
      {isSelected && (
        <div className="absolute -top-10 left-0 flex items-center gap-1 bg-gray-800 text-white rounded px-2 py-1 text-xs">
          <button
            onClick={() => duplicateBlock(block.id)}
            className="p-1 hover:bg-gray-700 rounded"
            title="복제"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => deleteBlock(block.id)}
            className="p-1 hover:bg-red-600 rounded"
            title="삭제"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <span className="px-2 text-xs opacity-75">{block.type}</span>
        </div>
      )}
    </div>
  );
}
