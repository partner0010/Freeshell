'use client';

import { useEffect } from 'react';

// 마이크로 인터랙션 개선
export default function MicroInteractions() {
  useEffect(() => {
    // 버튼 클릭 리플 효과
    const addRippleEffect = (e: MouseEvent) => {
      const button = e.currentTarget as HTMLElement;
      if (!button || button.tagName !== 'BUTTON') return;

      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add('ripple');

      const existingRipple = button.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    // 모든 버튼에 리플 효과 추가
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      button.addEventListener('click', addRippleEffect);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener('click', addRippleEffect);
      });
    };
  }, []);

  return null;
}

