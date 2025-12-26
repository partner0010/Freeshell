/**
 * 사용자 설정 Provider
 * 사용자 설정을 전역으로 적용
 */

'use client';

import { useEffect } from 'react';
import { useUserSettings } from '@/lib/storage/user-settings';

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useUserSettings();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = document.documentElement;

    // 테마 적용
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // auto: 시스템 설정 따름
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // 폰트 크기 적용
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];

    // 고대비 모드 적용
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 애니메이션 설정
    if (!settings.animations) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  }, [settings]);

  // 시스템 테마 변경 감지 (auto 모드일 때)
  useEffect(() => {
    if (settings.theme !== 'auto') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return <>{children}</>;
}

