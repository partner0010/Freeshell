/**
 * 사용자 설정 저장 시스템
 * localStorage 기반 사용자 설정 관리
 */

import { useState, useEffect } from 'react';

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  animations: boolean;
  notifications: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  keyboardShortcuts: boolean;
  [key: string]: any;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  language: 'ko',
  fontSize: 'medium',
  highContrast: false,
  animations: true,
  notifications: true,
  autoSave: true,
  autoSaveInterval: 2000,
  keyboardShortcuts: true,
};

class UserSettingsManager {
  private settings: UserSettings = { ...DEFAULT_SETTINGS };
  private listeners: Set<(settings: UserSettings) => void> = new Set();

  constructor() {
    this.load();
  }

  /**
   * 설정 로드
   */
  load(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('freeshell-user-settings');
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * 설정 저장
   */
  save(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('freeshell-user-settings', JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  }

  /**
   * 설정 가져오기
   */
  get<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.settings[key];
  }

  /**
   * 설정 업데이트
   */
  set<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
    this.settings[key] = value;
    this.save();
  }

  /**
   * 전체 설정 업데이트
   */
  update(updates: Partial<UserSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.save();
  }

  /**
   * 설정 리셋
   */
  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
  }

  /**
   * 리스너 등록
   */
  subscribe(listener: (settings: UserSettings) => void): () => void {
    this.listeners.add(listener);
    listener(this.settings); // 즉시 현재 설정 전달

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 리스너에게 알림
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.settings);
    });
  }

  /**
   * 전체 설정 가져오기
   */
  getAll(): UserSettings {
    return { ...this.settings };
  }
}

// 싱글톤 인스턴스
export const userSettings = typeof window !== 'undefined' ? new UserSettingsManager() : null;

/**
 * React 훅: 사용자 설정
 */
export function useUserSettings(): {
  settings: UserSettings;
  set: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  update: (updates: Partial<UserSettings>) => void;
  reset: () => void;
} {
  const [settings, setSettings] = useState<UserSettings>(
    userSettings?.getAll() || DEFAULT_SETTINGS
  );

  useEffect(() => {
    if (!userSettings) {
      return;
    }

    const unsubscribe = userSettings.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const set = (key: keyof UserSettings, value: any) => {
    userSettings?.set(key, value);
  };

  const update = (updates: Partial<UserSettings>) => {
    userSettings?.update(updates);
  };

  const reset = () => {
    userSettings?.reset();
  };

  return { settings, set, update, reset };
}

