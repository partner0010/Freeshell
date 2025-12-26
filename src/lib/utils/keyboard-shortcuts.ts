/**
 * 전역 키보드 단축키 시스템
 * 앱 전체에서 사용할 수 있는 키보드 단축키 관리
 */

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private enabled: boolean = true;

  /**
   * 단축키 등록
   */
  register(shortcut: KeyboardShortcut): () => void {
    const key = this.getKeyString(shortcut);
    this.shortcuts.set(key, shortcut);

    // 정리 함수 반환
    return () => {
      this.shortcuts.delete(key);
    };
  }

  /**
   * 단축키 문자열 생성
   */
  private getKeyString(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('Meta');
    parts.push(shortcut.key);
    return parts.join('+');
  }

  /**
   * 키보드 이벤트 처리
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) {
      return;
    }

    // 입력 필드에 포커스가 있으면 제외
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // 특정 단축키는 입력 필드에서도 허용
      const allowedInInput = ['Escape', 'Enter'];
      if (!allowedInInput.includes(event.key)) {
        return;
      }
    }

    const key = this.getKeyString({
      key: event.key,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
      action: () => {},
      description: '',
    });

    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }

  /**
   * 활성화/비활성화
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 모든 단축키 가져오기
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * 카테고리별 단축키 가져오기
   */
  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(
      (s) => s.category === category
    );
  }
}

// 싱글톤 인스턴스
export const keyboardShortcuts = typeof window !== 'undefined' ? new KeyboardShortcutManager() : null;

/**
 * React 훅: 키보드 단축키
 */
export function useKeyboardShortcut(
  shortcut: Omit<KeyboardShortcut, 'action'>,
  action: () => void
): void {
  const React = require('react');
  const { useEffect } = React;

  useEffect(() => {
    if (!keyboardShortcuts) {
      return;
    }

    const cleanup = keyboardShortcuts.register({
      ...shortcut,
      action,
    });

    return cleanup;
  }, [shortcut.key, shortcut.ctrl, shortcut.shift, shortcut.alt, shortcut.meta, action]);
}

/**
 * 전역 키보드 이벤트 리스너 초기화
 */
export function initKeyboardShortcuts(): () => void {
  if (typeof window === 'undefined' || !keyboardShortcuts) {
    return () => {};
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    keyboardShortcuts.handleKeyDown(event);
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

