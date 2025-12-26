/**
 * 네트워크 연결 모니터링
 * 온라인/오프라인 상태 추적
 */

import { useState, useEffect } from 'react';

export interface ConnectionInfo {
  online: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

class ConnectionMonitor {
  private listeners: Set<(info: ConnectionInfo) => void> = new Set();
  private currentInfo: ConnectionInfo = {
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    // 온라인/오프라인 이벤트
    window.addEventListener('online', () => {
      this.updateConnectionInfo({ online: true });
    });

    window.addEventListener('offline', () => {
      this.updateConnectionInfo({ online: false });
    });

    // Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.updateFromConnection(connection);

      connection.addEventListener('change', () => {
        this.updateFromConnection(connection);
      });
    }
  }

  private updateFromConnection(connection: any) {
    this.updateConnectionInfo({
      online: navigator.onLine,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    });
  }

  private updateConnectionInfo(info: Partial<ConnectionInfo>) {
    this.currentInfo = { ...this.currentInfo, ...info };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.currentInfo);
    });
  }

  /**
   * 연결 정보 구독
   */
  subscribe(listener: (info: ConnectionInfo) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentInfo); // 즉시 현재 상태 전달

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 현재 연결 정보 가져오기
   */
  getConnectionInfo(): ConnectionInfo {
    return { ...this.currentInfo };
  }

  /**
   * 느린 연결인지 확인
   */
  isSlowConnection(): boolean {
    return (
      !this.currentInfo.online ||
      this.currentInfo.effectiveType === 'slow-2g' ||
      this.currentInfo.effectiveType === '2g' ||
      (this.currentInfo.downlink !== undefined && this.currentInfo.downlink < 1.5)
    );
  }
}

// 싱글톤 인스턴스
export const connectionMonitor = typeof window !== 'undefined' ? new ConnectionMonitor() : null;

/**
 * React 훅: 연결 상태 구독
 */
export function useConnection() {
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

