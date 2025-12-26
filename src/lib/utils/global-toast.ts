/**
 * 전역 Toast 유틸리티
 * 컴포넌트 외부에서도 Toast 사용 가능
 */

let globalToastHandler: ((toast: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void) | null = null;

/**
 * 전역 Toast 핸들러 설정
 */
export function setGlobalToastHandler(handler: (toast: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void) {
  globalToastHandler = handler;
}

/**
 * 전역 Toast 표시
 */
export function showGlobalToast(toast: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) {
  if (globalToastHandler) {
    globalToastHandler(toast);
  } else if (typeof window !== 'undefined') {
    // Fallback: window 이벤트 사용
    window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
  }
}

