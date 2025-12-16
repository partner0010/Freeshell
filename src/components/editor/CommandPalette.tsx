'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  Plus,
  Trash2,
  Copy,
  Save,
  Download,
  Eye,
  Undo,
  Redo,
  Settings,
  Palette,
  Layout,
  FileText,
  Image,
  Type,
  Box,
  Zap,
  Users,
  Share2,
  HelpCircle,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  shortcut?: string;
  category: string;
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { undo, redo, addBlock, isPreviewMode, setPreviewMode } = useEditorStore();

  // 명령어 목록
  const commands: CommandItem[] = [
    // 블록 추가
    { id: 'add-header', label: '헤더 블록 추가', icon: Layout, category: '블록 추가', action: () => addBlock({ type: 'header', content: {}, styles: {} }), shortcut: '' },
    { id: 'add-hero', label: '히어로 블록 추가', icon: Box, category: '블록 추가', action: () => addBlock({ type: 'hero', content: {}, styles: {} }), shortcut: '' },
    { id: 'add-text', label: '텍스트 블록 추가', icon: Type, category: '블록 추가', action: () => addBlock({ type: 'text', content: {}, styles: {} }), shortcut: '' },
    { id: 'add-image', label: '이미지 블록 추가', icon: Image, category: '블록 추가', action: () => addBlock({ type: 'image', content: {}, styles: {} }), shortcut: '' },
    { id: 'add-features', label: '기능 블록 추가', icon: Zap, category: '블록 추가', action: () => addBlock({ type: 'features', content: {}, styles: {} }), shortcut: '' },
    
    // 편집
    { id: 'undo', label: '실행 취소', icon: Undo, category: '편집', action: undo, shortcut: 'Ctrl+Z' },
    { id: 'redo', label: '다시 실행', icon: Redo, category: '편집', action: redo, shortcut: 'Ctrl+Shift+Z' },
    { id: 'duplicate', label: '블록 복제', icon: Copy, category: '편집', action: () => {}, shortcut: 'Ctrl+D' },
    { id: 'delete', label: '블록 삭제', icon: Trash2, category: '편집', action: () => {}, shortcut: 'Delete' },
    
    // 파일
    { id: 'save', label: '저장', icon: Save, category: '파일', action: () => {}, shortcut: 'Ctrl+S' },
    { id: 'export', label: '내보내기', icon: Download, category: '파일', action: () => {}, shortcut: 'Ctrl+E' },
    { id: 'preview', label: '미리보기', icon: Eye, category: '파일', action: () => setPreviewMode(!isPreviewMode), shortcut: 'Ctrl+P' },
    
    // 보기
    { id: 'settings', label: '설정', icon: Settings, category: '보기', action: () => {}, shortcut: 'Ctrl+,' },
    { id: 'theme', label: '테마 변경', icon: Palette, category: '보기', action: () => {}, shortcut: '' },
    { id: 'pages', label: '페이지 관리', icon: FileText, category: '보기', action: () => {}, shortcut: '' },
    
    // 협업
    { id: 'share', label: '공유', icon: Share2, category: '협업', action: () => {}, shortcut: '' },
    { id: 'invite', label: '팀원 초대', icon: Users, category: '협업', action: () => {}, shortcut: '' },
    
    // 도움말
    { id: 'shortcuts', label: '키보드 단축키', icon: Command, category: '도움말', action: () => {}, shortcut: 'Ctrl+/' },
    { id: 'help', label: '도움말', icon: HelpCircle, category: '도움말', action: () => {}, shortcut: '' },
  ];

  // 필터링된 명령어
  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // 카테고리별 그룹화
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // 키보드 단축키로 열기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 열릴 때 포커스
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // 방향키 네비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCommand = filteredCommands[selectedIndex];
      if (selectedCommand) {
        selectedCommand.action();
        setIsOpen(false);
      }
    }
  }, [filteredCommands, selectedIndex]);

  const executeCommand = (cmd: CommandItem) => {
    cmd.action();
    setIsOpen(false);
  };

  let flatIndex = -1;

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Search size={16} />
        <span className="text-sm">검색...</span>
        <kbd className="ml-2 px-2 py-0.5 bg-white dark:bg-gray-700 rounded text-xs border">⌘K</kbd>
      </button>

      {/* 모달 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[15vh]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 검색 입력 */}
              <div className="flex items-center gap-3 px-4 py-4 border-b dark:border-gray-800">
                <Search size={20} className="text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="명령어 검색..."
                  className="flex-1 bg-transparent outline-none text-lg text-gray-800 dark:text-white placeholder-gray-400"
                />
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500">ESC</kbd>
              </div>

              {/* 명령어 목록 */}
              <div className="max-h-[400px] overflow-y-auto">
                {Object.entries(groupedCommands).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                      {category}
                    </div>
                    {items.map((cmd) => {
                      flatIndex++;
                      const isSelected = flatIndex === selectedIndex;
                      const currentIndex = flatIndex;
                      
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                            ${isSelected 
                              ? 'bg-primary-50 dark:bg-primary-900/30' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <cmd.icon size={18} className={`${isSelected ? 'text-primary-500' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <p className={`font-medium ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'}`}>
                              {cmd.label}
                            </p>
                            {cmd.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{cmd.description}</p>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500">
                              {cmd.shortcut}
                            </kbd>
                          )}
                          {isSelected && <ArrowRight size={16} className="text-primary-500" />}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {filteredCommands.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <Hash size={32} className="mx-auto mb-2 opacity-50" />
                    <p>&quot;{query}&quot;에 대한 명령어를 찾을 수 없습니다</p>
                  </div>
                )}
              </div>

              {/* 하단 팁 */}
              <div className="px-4 py-3 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border text-[10px]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border text-[10px]">↓</kbd>
                    이동
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border text-[10px]">Enter</kbd>
                    실행
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border text-[10px]">ESC</kbd>
                    닫기
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

