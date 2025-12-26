/**
 * 접근성 유틸리티
 * ARIA 레이블, 키보드 네비게이션 등
 */

/**
 * ARIA 라이브 리전에 메시지 표시
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const region = document.getElementById('a11y-live-region');
  if (region) {
    region.setAttribute('aria-live', priority);
    region.textContent = message;
    
    // 메시지 제거 (다음 메시지를 위해)
    setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = '';
      }
    }, 1000);
  }
}

/**
 * 포커스 트랩 생성 (모달 등에서 사용)
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * 키보드 단축키 핸들러
 */
export function createKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: { ctrl?: boolean; alt?: boolean; shift?: boolean } = {}
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() !== key.toLowerCase()) {
      return;
    }

    if (options.ctrl && !e.ctrlKey && !e.metaKey) {
      return;
    }
    if (options.alt && !e.altKey) {
      return;
    }
    if (options.shift && !e.shiftKey) {
      return;
    }

    e.preventDefault();
    handler(e);
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * 스킵 링크 생성
 */
export function createSkipLink(targetId: string, label: string = '본문으로 건너뛰기'): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg';
  skipLink.setAttribute('aria-label', label);
  
  return skipLink;
}

