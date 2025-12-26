/**
 * 실시간 자동 저장
 * 디바운싱된 자동 저장 기능
 */

import { debounce } from '@/lib/utils/debounce';

interface AutoSaveOptions {
  delay?: number;
  onSave: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

class AutoSaveManager {
  private saveFunctions: Map<string, () => void> = new Map();

  /**
   * 자동 저장 등록
   */
  register(key: string, data: any, options: AutoSaveOptions): () => void {
    const {
      delay = 2000,
      onSave,
      onError,
      onSuccess,
    } = options;

    // 기존 함수 제거
    const existingCleanup = this.saveFunctions.get(key);
    if (existingCleanup) {
      existingCleanup();
    }

    // 디바운스된 저장 함수 생성
    const debouncedSave = debounce(async () => {
      try {
        await onSave(data);
        onSuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }
    }, delay);

    // 정리 함수
    const cleanup = () => {
      this.saveFunctions.delete(key);
    };

    this.saveFunctions.set(key, cleanup);

    // 데이터 변경 시 저장 트리거
    debouncedSave();

    return cleanup;
  }

  /**
   * 즉시 저장
   */
  async saveNow(key: string, data: any, onSave: (data: any) => Promise<void>): Promise<void> {
    await onSave(data);
  }

  /**
   * 모든 자동 저장 정리
   */
  cleanup(): void {
    this.saveFunctions.forEach((cleanup) => cleanup());
    this.saveFunctions.clear();
  }
}

// 싱글톤 인스턴스
export const autoSaveManager = typeof window !== 'undefined' ? new AutoSaveManager() : null;

/**
 * React 훅: 자동 저장
 */
export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  options: Omit<AutoSaveOptions, 'onSave'> = {}
): void {
  const React = require('react');
  const { useRef, useEffect } = React;

  const dataRef = useRef(data);
  const keyRef = useRef(`autosave-${Date.now()}-${Math.random()}`);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!autoSaveManager) {
      return;
    }

    const cleanup = autoSaveManager.register(
      keyRef.current,
      dataRef.current,
      {
        ...options,
        onSave: async (d) => {
          await onSave(d as T);
        },
      }
    );

    return cleanup;
  }, [data, onSave, options.delay]);
}

