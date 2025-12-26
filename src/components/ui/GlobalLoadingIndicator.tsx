/**
 * 전역 로딩 인디케이터 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { loadingIndicator } from '@/lib/utils/loading-indicator';

export function GlobalLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('로딩 중...');

  useEffect(() => {
    if (!loadingIndicator) {
      return;
    }

    const unsubscribe = loadingIndicator.subscribe((loading, msg) => {
      setIsLoading(loading);
      setMessage(msg);
    });

    return unsubscribe;
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[200px]"
        >
          <Loader2 className="animate-spin text-purple-600" size={32} />
          <p className="text-gray-900 font-medium">{message}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

