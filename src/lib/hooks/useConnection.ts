/**
 * 네트워크 연결 상태 훅
 */

'use client';

import { useState, useEffect } from 'react';
import { connectionMonitor, type ConnectionInfo } from '@/lib/performance/connection-monitor';

export function useConnection(): ConnectionInfo {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(
    connectionMonitor?.getConnectionInfo() || { online: true }
  );

  useEffect(() => {
    if (!connectionMonitor) {
      return;
    }

    const unsubscribe = connectionMonitor.subscribe((info) => {
      setConnectionInfo(info);
    });

    return unsubscribe;
  }, []);

  return connectionInfo;
}

