'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Layers,
  Palette,
  Type,
  Image,
  MoreHorizontal,
  Eye,
  EyeOff,
  Settings,
  Link,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';

export default function FloatingToolbar() {
  const { selectedBlockId, getCurrentPage, duplicateBlock, deleteBlock, moveBlock } = useEditorStore();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMore, setShowMore] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // project에서 현재 페이지의 blocks 추출
  const currentPage = getCurrentPage();
  const blocks = currentPage?.blocks || [];
  
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const blockIndex = blocks.findIndex(b => b.id === selectedBlockId);

  useEffect(() => {
    if (!selectedBlockId) return;

    const updatePosition = () => {
      const element = document.querySelector(`[data-block-id="${selectedBlockId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          x: rect.right + 10,
          y: rect.top,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [selectedBlockId]);

  if (!selectedBlockId || !selectedBlock) return null;

  const tools = [
    {
      icon: ChevronUp,
      label: '위로 이동',
      action: () => blockIndex > 0 && moveBlock(selectedBlockId, blockIndex - 1),
      disabled: blockIndex === 0,
    },
    {
      icon: ChevronDown,
      label: '아래로 이동',
      action: () => blockIndex < blocks.length - 1 && moveBlock(selectedBlockId, blockIndex + 1),
      disabled: blockIndex === blocks.length - 1,
    },
    {
      icon: Copy,
      label: '복제',
      action: () => duplicateBlock(selectedBlockId),
    },
    {
      icon: isLocked ? Unlock : Lock,
      label: isLocked ? '잠금 해제' : '잠금',
      action: () => setIsLocked(!isLocked),
    },
    {
      icon: isVisible ? EyeOff : Eye,
      label: isVisible ? '숨기기' : '표시',
      action: () => setIsVisible(!isVisible),
    },
    {
      icon: Trash2,
      label: '삭제',
      action: () => deleteBlock(selectedBlockId),
      danger: true,
    },
  ];

  const moreTools = [
    { icon: Palette, label: '스타일 편집' },
    { icon: Type, label: '텍스트 편집' },
    { icon: Image, label: '이미지 변경' },
    { icon: Link, label: '링크 설정' },
    { icon: Layers, label: '레이어 순서' },
    { icon: Settings, label: '블록 설정' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed',
          left: Math.min(position.x, window.innerWidth - 60),
          top: Math.max(position.y, 80),
          zIndex: 100,
        }}
        className="bg-white rounded-2xl shadow-xl border p-2"
      >
        {/* 블록 타입 표시 */}
        <div className="px-3 py-2 mb-2 bg-gray-50 rounded-lg">
          <span className="text-xs font-medium text-gray-500 uppercase">
            {selectedBlock.type}
          </span>
        </div>

        {/* 메인 도구 */}
        <div className="flex flex-col gap-1">
          {tools.map((tool, index) => (
            <motion.button
              key={index}
              onClick={tool.action}
              disabled={tool.disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                p-2 rounded-lg transition-colors flex items-center justify-center
                ${tool.disabled ? 'opacity-30 cursor-not-allowed' : ''}
                ${tool.danger 
                  ? 'hover:bg-red-50 text-red-500' 
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
              title={tool.label}
            >
              <tool.icon size={18} />
            </motion.button>
          ))}

          {/* 더보기 버튼 */}
          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className={`
                w-full p-2 rounded-lg transition-colors flex items-center justify-center
                ${showMore ? 'bg-gray-100' : 'hover:bg-gray-100'} text-gray-600
              `}
            >
              <MoreHorizontal size={18} />
            </button>

            {/* 더보기 메뉴 */}
            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute right-full top-0 mr-2 bg-white rounded-xl shadow-lg border p-2 min-w-[140px]"
                >
                  {moreTools.map((tool, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <tool.icon size={16} />
                      {tool.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className="mt-2 pt-2 border-t flex justify-center gap-2">
          {isLocked && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              잠김
            </span>
          )}
          {!isVisible && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              숨김
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

