'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'offline';

export default function AutoSave() {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { project, getCurrentPage } = useEditorStore();
  
  // project에서 필요한 데이터 추출
  const currentPage = getCurrentPage();
  const blocks = currentPage?.blocks || [];
  const pages = project?.pages || [];
  const styles = project?.globalStyles || {};

  // 온라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 저장 함수
  const saveProject = useCallback(async () => {
    if (!isOnline) {
      setStatus('offline');
      // 오프라인일 때 로컬 스토리지에 저장
      const data = { blocks, pages, styles, project };
      localStorage.setItem('grip-autosave', JSON.stringify(data));
      return;
    }

    setStatus('saving');

    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 로컬 스토리지에도 백업
      const data = { blocks, pages, styles, project, savedAt: new Date().toISOString() };
      localStorage.setItem('grip-autosave', JSON.stringify(data));
      
      setStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      setStatus('unsaved');
      console.error('Auto-save failed:', error);
    }
  }, [blocks, pages, styles, project, isOnline]);

  // 변경 감지 및 자동 저장
  useEffect(() => {
    // 변경 감지
    setStatus('unsaved');

    // 디바운스된 저장
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveProject();
    }, 2000); // 2초 후 자동 저장

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blocks, pages, styles, saveProject]);

  // Ctrl+S 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject]);

  const statusConfig = {
    saved: {
      icon: Check,
      text: '저장됨',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    saving: {
      icon: Loader2,
      text: '저장 중...',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    unsaved: {
      icon: Cloud,
      text: '변경사항 있음',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    offline: {
      icon: CloudOff,
      text: '오프라인',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const diff = Date.now() - lastSaved.getTime();
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    return lastSaved.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={false}
        animate={{ scale: status === 'saving' ? 1.05 : 1 }}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          ${config.bgColor} ${config.color}
        `}
      >
        <Icon
          size={14}
          className={status === 'saving' ? 'animate-spin' : ''}
        />
        <span className="text-sm font-medium">{config.text}</span>
      </motion.div>

      {lastSaved && status === 'saved' && (
        <span className="text-xs text-gray-400">
          {formatLastSaved()}
        </span>
      )}

      {/* 수동 저장 버튼 */}
      <button
        onClick={saveProject}
        disabled={status === 'saving'}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title="저장 (Ctrl+S)"
      >
        <Save size={16} className="text-gray-500" />
      </button>
    </div>
  );
}

