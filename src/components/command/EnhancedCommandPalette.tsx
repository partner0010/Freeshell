'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, File, Settings, Zap, Clock } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords: string[];
  shortcut?: string;
}

interface EnhancedCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export function EnhancedCommandPalette({
  isOpen,
  onClose,
  commands,
}: EnhancedCommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  useEffect(() => {
    const recent = localStorage.getItem('command-palette-recent');
    if (recent) {
      setRecentCommands(JSON.parse(recent));
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = commands.filter((cmd) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(query)) ||
      cmd.category.toLowerCase().includes(query)
    );
  });

  const handleExecute = (command: CommandItem) => {
    // 최근 명령어 저장
    const recent = [command.id, ...recentCommands.filter((id) => id !== command.id)].slice(0, 10);
    setRecentCommands(recent);
    localStorage.setItem('command-palette-recent', JSON.stringify(recent));

    command.action();
    onClose();
  };

  // 키보드 네비게이션
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleExecute(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, handleExecute]);

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4">
        {/* 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* 커맨드 팔레트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border overflow-hidden"
        >
          {/* 검색 입력 */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="명령어 검색... (Ctrl+K 또는 Cmd+K)"
              className="flex-1 outline-none text-lg"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              ESC
            </kbd>
          </div>

          {/* 명령어 목록 */}
          <div className="max-h-96 overflow-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                검색 결과가 없습니다
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedCommands).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      {category}
                    </div>
                    {items.map((cmd, index) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleExecute(cmd)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isSelected ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-gray-400">{cmd.icon}</div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{cmd.label}</div>
                            {cmd.keywords.length > 0 && (
                              <div className="text-xs text-gray-400">
                                {cmd.keywords.slice(0, 2).join(', ')}
                              </div>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                              {cmd.shortcut}
                            </kbd>
                          )}
                          {recentCommands.includes(cmd.id) && (
                            <Clock size={14} className="text-gray-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

