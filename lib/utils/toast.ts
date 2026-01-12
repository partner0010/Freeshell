/**
 * 토스트 알림 유틸리티
 * alert 대신 사용
 */
'use client';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastManager {
  private toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
    options?: ToastOptions;
  }> = [];
  private listeners: Array<() => void> = [];

  show(type: ToastType, message: string, options?: ToastOptions) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    this.toasts.push({ id, type, message, options });
    this.notifyListeners();

    // 자동 제거
    const duration = options?.duration || (type === 'error' ? 5000 : 3000);
    setTimeout(() => {
      this.remove(id);
    }, duration);

    return id;
  }

  success(message: string, options?: ToastOptions) {
    return this.show('success', message, options);
  }

  error(message: string, options?: ToastOptions) {
    return this.show('error', message, options);
  }

  info(message: string, options?: ToastOptions) {
    return this.show('info', message, options);
  }

  warning(message: string, options?: ToastOptions) {
    return this.show('warning', message, options);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  getToasts() {
    return [...this.toasts];
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// 싱글톤 인스턴스
export const toastManager = new ToastManager();

// 편의 함수
export const toast = {
  success: (message: string, options?: ToastOptions) => toastManager.success(message, options),
  error: (message: string, options?: ToastOptions) => toastManager.error(message, options),
  info: (message: string, options?: ToastOptions) => toastManager.info(message, options),
  warning: (message: string, options?: ToastOptions) => toastManager.warning(message, options),
};
