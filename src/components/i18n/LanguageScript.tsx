'use client';

import { useEffect } from 'react';
import { i18n } from '@/lib/i18n';

/**
 * 언어 설정을 HTML lang 속성에 동기화하는 컴포넌트
 */
export function LanguageScript() {
  useEffect(() => {
    const updateLang = () => {
      const locale = i18n.getLocale();
      document.documentElement.lang = locale;
    };

    // 초기 설정
    updateLang();

    // 언어 변경 이벤트 리스너
    const handleLanguageChange = () => {
      updateLang();
    };
    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  return null;
}

