'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Sparkles, Folder, Settings, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const commands = [
  { id: 'search', label: '검색', icon: Search, action: () => window.location.href = '/#search' },
  { id: 'spark', label: 'Spark 워크스페이스', icon: Sparkles, action: () => window.location.href = '/#spark' },
  { id: 'drive', label: 'AI 드라이브', icon: Folder, action: () => window.location.href = '/#drive' },
  { id: 'dashboard', label: '대시보드', icon: User, action: () => window.location.href = '/dashboard' },
  { id: 'settings', label: '설정', icon: Settings, action: () => window.location.href = '/dashboard/settings' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K로 명령 팔레트 열기
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape로 닫기
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }

      // 화살표 키로 네비게이션
      if (isOpen) {
        const filtered = commands.filter(cmd =>
          cmd.label.toLowerCase().includes(query.toLowerCase())
        );

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filtered[selectedIndex]) {
            filtered[selectedIndex].action();
            setIsOpen(false);
            setQuery('');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, selectedIndex]);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Command className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="명령어 검색..."
                  className="flex-1 bg-transparent outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    명령어를 찾을 수 없습니다
                  </div>
                ) : (
                  filteredCommands.map((command, index) => {
                    const Icon = command.icon;
                    return (
                      <button
                        key={command.id}
                        onClick={() => {
                          command.action();
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                      >
                        <Icon className="w-5 h-5 text-gray-400" />
                        <span>{command.label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

