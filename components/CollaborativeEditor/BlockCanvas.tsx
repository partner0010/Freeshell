/**
 * 블록 캔버스 컴포넌트
 * 드래그 앤 드롭으로 블록 배치
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import { useEditorStore, Block } from '@/store/editorStore';
import BlockComponent from '../blocks/Block';
import { Plus } from 'lucide-react';

export default function BlockCanvas() {
  const {
    blocks,
    selectedBlockId,
    selectBlock,
    addBlock,
    moveBlock,
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 새 블록 추가
  const handleAddBlock = useCallback((type: Block['type']) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: type === 'text' ? '새 텍스트' : type === 'code' ? '// 코드' : '',
      styles: {},
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
    };
    addBlock(newBlock);
    selectBlock(newBlock.id);
  }, [addBlock, selectBlock]);

  // 블록 드래그 시작
  const handleDragStart = useCallback((e: React.MouseEvent, blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - block.position.x,
      y: e.clientY - block.position.y,
    });
  }, [blocks]);

  // 블록 드래그 중
  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedBlockId) return;

    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    };

    moveBlock(selectedBlockId, newPosition);
  }, [isDragging, selectedBlockId, dragOffset, moveBlock]);

  // 블록 드래그 종료
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 캔버스 클릭 (블록 선택 해제)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectBlock(null);
    }
  }, [selectBlock]);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gray-50 dark:bg-gray-900 overflow-auto"
      onClick={handleCanvasClick}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* 그리드 배경 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* 블록들 */}
      {blocks.map((block) => (
        <div
          key={block.id}
          className="absolute"
          style={{
            left: `${block.position.x}px`,
            top: `${block.position.y}px`,
            width: `${block.size.width}px`,
            height: `${block.size.height}px`,
            zIndex: selectedBlockId === block.id ? 10 : 1,
          }}
          onMouseDown={(e) => {
            selectBlock(block.id);
            handleDragStart(e, block.id);
          }}
        >
          <BlockComponent
            block={block}
            isSelected={selectedBlockId === block.id}
          />
        </div>
      ))}

      {/* 새 블록 추가 버튼 */}
      <div className="fixed bottom-4 right-4 z-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-2">
          <button
            onClick={() => handleAddBlock('text')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            텍스트
          </button>
          <button
            onClick={() => handleAddBlock('image')}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
          >
            이미지
          </button>
          <button
            onClick={() => handleAddBlock('code')}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
          >
            코드
          </button>
          <button
            onClick={() => handleAddBlock('container')}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
          >
            컨테이너
          </button>
        </div>
      </div>
    </div>
  );
}
