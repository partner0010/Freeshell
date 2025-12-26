/**
 * 접근성 라이브 리전 컴포넌트
 * 스크린 리더에 동적 메시지 전달
 */

'use client';

export function A11yLiveRegion() {
  return (
    <div
      id="a11y-live-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}

