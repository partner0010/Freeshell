/**
 * 키보드 단축키 시스템 초기화 컴포넌트
 */

'use client';

import { useEffect } from 'react';
import { initKeyboardShortcuts } from '@/lib/utils/keyboard-shortcuts';
import { keyboardShortcuts } from '@/lib/utils/keyboard-shortcuts';

export function KeyboardShortcutsInit() {
  useEffect(() => {
    // 전역 키보드 단축키 초기화
    const cleanup = initKeyboardShortcuts();

    // 기본 단축키 등록
    if (keyboardShortcuts) {
      // Ctrl/Cmd + / : 도움말
      keyboardShortcuts.register({
        key: '/',
        ctrl: true,
        action: () => {
          window.location.href = '/help';
        },
        description: '도움말 열기',
        category: 'navigation',
      });

      // Ctrl/Cmd + , : 설정
      keyboardShortcuts.register({
        key: ',',
        ctrl: true,
        action: () => {
          // 설정 페이지로 이동 (또는 설정 모달 열기)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-settings'));
          }
        },
        description: '설정 열기',
        category: 'navigation',
      });
    }

    return cleanup;
  }, []);

  return null;
}

