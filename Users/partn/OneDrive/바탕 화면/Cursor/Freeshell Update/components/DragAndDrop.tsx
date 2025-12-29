'use client';

import { useState, DragEvent, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';

interface DragAndDropProps {
  onDrop: (files: File[]) => void;
  accept?: string;
  children?: ReactNode;
  className?: string;
}

export default function DragAndDrop({ onDrop, accept, children, className = '' }: DragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (accept) {
      const acceptedFiles = files.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return accept.split(',').some(acc => acc.includes(extension || ''));
      });
      onDrop(acceptedFiles);
    } else {
      onDrop(files);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative ${className}`}
    >
      {children}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-2xl border-4 border-dashed border-primary">
              <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-2xl font-bold text-center">파일을 여기에 놓으세요</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

