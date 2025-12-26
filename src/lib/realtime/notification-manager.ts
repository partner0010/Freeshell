/**
 * 실시간 알림 관리자
 * 브라우저 알림 및 인앱 알림 관리
 */

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

class NotificationManager {
  private permission: NotificationPermission = 'default';

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  /**
   * 알림 표시
   */
  async show(options: NotificationOptions): Promise<Notification | null> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return null;
    }

    if (this.permission === 'default') {
      this.permission = await this.requestPermission();
    }

    if (this.permission !== 'granted') {
      return null;
    }

    const notificationOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      requireInteraction: false,
      ...options,
    };

    const notification = new Notification(notificationOptions.title, notificationOptions);

    // 클릭 이벤트
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (notificationOptions.data?.url) {
        window.open(notificationOptions.data.url, '_blank');
      }
      notification.close();
    };

    // 자동 닫기 (5초 후)
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  /**
   * 인앱 알림 (Toast와 통합)
   */
  showInApp(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    // Toast 시스템과 통합 (별도 구현 필요)
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, message });
    }
  }
}

// 싱글톤 인스턴스
export const notificationManager = typeof window !== 'undefined' ? new NotificationManager() : null;

/**
 * React 훅: 알림
 */
export function useNotifications(): {
  show: (options: NotificationOptions) => Promise<Notification | null>;
  requestPermission: () => Promise<NotificationPermission>;
} {
  const React = require('react');
  const { useCallback } = React;

  const show = useCallback(async (options: NotificationOptions) => {
    return notificationManager?.show(options) || null;
  }, []);

  const requestPermission = useCallback(async () => {
    return notificationManager?.requestPermission() || 'denied';
  }, []);

  return { show, requestPermission };
}

