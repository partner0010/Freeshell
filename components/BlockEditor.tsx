/**
 * 블록 에디터 (No-Code)
 * 드래그 앤 드롭으로 편집
 */
'use client';

import { useState } from 'react';
import { 
  Layout, 
  Type, 
  Image,
  Video,
  MousePointerClick as Button,
  Square,
  Circle,
  Move,
  Trash2,
  Copy,
  Save
} from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'button' | 'container' | 'spacer';
  content: string;
  style: {
    width?: string;
    height?: string;
    backgroundColor?: string;
    color?: string;
    padding?: string;
    margin?: string;
  };
  children?: Block[];
}

const blockTypes = [
  { type: 'text' as const, icon: Type, label: '텍스트', defaultContent: '텍스트를 입력하세요' },
  { type: 'image' as const, icon: Image, label: '이미지', defaultContent: 'https://via.placeholder.com/400' },
  { type: 'video' as const, icon: Video, label: '비디오', defaultContent: 'https://example.com/video.mp4' },
  { type: 'button' as const, icon: Button, label: '버튼', defaultContent: '버튼' },
  { type: 'container' as const, icon: Square, label: '컨테이너', defaultContent: '' },
  { type: 'spacer' as const, icon: Circle, label: '간격', defaultContent: '' },
];

function BlockItem({ block, onUpdate, onDelete }: {
  block: Block;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const BlockIcon = blockTypes.find(bt => bt.type === block.type)?.icon || Square;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border-2 border-gray-200 rounded-lg bg-white hover:border-purple-300 transition-colors mb-2"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-move">
            <Move className="w-4 h-4 text-gray-400" />
          </div>
          <BlockIcon className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-gray-700">
            {blockTypes.find(bt => bt.type === block.type)?.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div style={block.style}>
        {block.type === 'text' && (
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        )}
        {block.type === 'image' && (
          <input
            type="url"
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="이미지 URL"
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        )}
        {block.type === 'button' && (
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        )}
        {block.type === 'container' && (
          <div className="min-h-20 border-2 border-dashed border-gray-300 rounded p-2">
            컨테이너 (자식 블록을 여기에 추가)
          </div>
        )}
        {block.type === 'spacer' && (
          <div className="h-8 bg-gray-100 rounded" />
        )}
      </div>
    </div>
  );
}

export default function BlockEditor({
  onGenerateCode,
}: {
  onGenerateCode: (html: string, css: string) => void;
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setBlocks(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = [...items];
        [newItems[oldIndex], newItems[newIndex]] = [newItems[newIndex], newItems[oldIndex]];
        return newItems;
      });
    }
  };

  const addBlock = (type: Block['type']) => {
    const blockType = blockTypes.find(bt => bt.type === type);
    const newBlock: Block = {
      id: `block_${Date.now()}`,
      type,
      content: blockType?.defaultContent || '',
      style: {},
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const generateCode = () => {
    let html = '<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8">\n<title>Generated Page</title>\n</head>\n<body>\n';
    let css = 'body { margin: 0; padding: 20px; font-family: sans-serif; }\n';

    blocks.forEach(block => {
      switch (block.type) {
        case 'text':
          html += `  <p>${block.content}</p>\n`;
          break;
        case 'image':
          html += `  <img src="${block.content}" alt="Image" />\n`;
          break;
        case 'button':
          html += `  <button>${block.content}</button>\n`;
          break;
        case 'container':
          html += `  <div class="container">\n    <!-- Container content -->\n  </div>\n`;
          break;
        case 'spacer':
          html += `  <div class="spacer"></div>\n`;
          css += '.spacer { height: 2rem; }\n';
          break;
      }
    });

    html += '</body>\n</html>';
    onGenerateCode(html, css);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 툴바 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 flex-wrap">
          {blockTypes.map(bt => {
            const Icon = bt.icon;
            return (
              <button
                key={bt.type}
                onClick={() => addBlock(bt.type)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{bt.label}</span>
              </button>
            );
          })}
          <div className="flex-1" />
          <button
            onClick={generateCode}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>코드 생성</span>
          </button>
        </div>
      </div>

      {/* 블록 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>블록을 추가하여 시작하세요</p>
              </div>
            ) : (
              blocks.map(block => (
                <BlockItem
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                />
              ))
            )}
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="opacity-50">
                {blocks.find(b => b.id === activeId) && (
                  <BlockItem
                    block={blocks.find(b => b.id === activeId)!}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                  />
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
