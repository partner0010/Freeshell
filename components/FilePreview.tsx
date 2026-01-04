'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Image as ImageIcon, Video, File, Download, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    type: string;
    url: string;
    size?: string;
  };
  onClose: () => void;
}

export default function FilePreview({ file, onClose }: FilePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  const Icon = getFileIcon();

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative w-full h-full min-h-[400px]">
          <Image
            src={file.url}
            alt={file.name}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      );
    }
    if (file.type.startsWith('video/')) {
      return (
        <video
          src={file.url}
          controls
          className="max-w-full max-h-full"
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Icon className="w-16 h-16 mb-4" />
        <p className="text-lg">{file.name}</p>
        <p className="text-sm mt-2">{file.size}</p>
        <a
          href={file.url}
          download
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>다운로드</span>
        </a>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl ${
            isFullscreen ? 'w-full h-full' : 'max-w-4xl max-h-[90vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold truncate flex-1">{file.name}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            {renderPreview()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

