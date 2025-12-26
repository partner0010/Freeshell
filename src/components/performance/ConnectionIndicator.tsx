/**
 * 네트워크 연결 상태 표시 컴포넌트
 */

'use client';

import { useConnection } from '@/lib/hooks/useConnection';
import { connectionMonitor } from '@/lib/performance/connection-monitor';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ConnectionIndicator() {
  const connection = useConnection();

  if (connection.online && !connectionMonitor?.isSlowConnection()) {
    return null; // 정상 연결 시 표시 안 함
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium"
      >
        <div className="flex items-center justify-center gap-2">
          {!connection.online ? (
            <>
              <WifiOff size={16} />
              <span>오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.</span>
            </>
          ) : connectionMonitor?.isSlowConnection() ? (
            <>
              <AlertCircle size={16} />
              <span>느린 네트워크 연결이 감지되었습니다.</span>
            </>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

