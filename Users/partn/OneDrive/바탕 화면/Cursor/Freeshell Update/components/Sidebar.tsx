'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';

interface SidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  title?: string;
}

export default function Sidebar({
  children,
  isOpen,
  onClose,
  position = 'left',
  title,
}: SidebarProps) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: position === 'left' ? -320 : 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: position === 'left' ? -320 : 320, opacity: 0 }}
              className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col`}
            >
              {title && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4">{children}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

