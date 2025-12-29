'use client';

import { useEffect } from 'react';

// 접근성 개선 컴포넌트
export default function Accessibility() {
  useEffect(() => {
    // 키보드 네비게이션 개선
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape 키로 모달 닫기
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach((modal) => {
          if (modal instanceof HTMLElement && modal.style.display !== 'none') {
            const closeButton = modal.querySelector('[aria-label="닫기"]');
            if (closeButton instanceof HTMLElement) {
              closeButton.click();
            }
          }
        });
      }

      // Tab 키 네비게이션 개선
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // 스킵 링크 추가
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = '본문으로 건너뛰기';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg';
    document.body.insertBefore(skipLink, document.body.firstChild);

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      skipLink.remove();
    };
  }, []);

  return null;
}

