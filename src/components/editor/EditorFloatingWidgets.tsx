/**
 * 에디터 플로팅 위젯 통합 관리 컴포넌트
 * 오른쪽 하단에 아이콘으로 표시하고, 클릭 시 나타나며, 메인 기능을 가리지 않음
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Camera, 
  BarChart3, 
  Eye, 
  Download, 
  Settings,
  ChevronDown, 
  ChevronUp, 
  X 
} from 'lucide-react';
import FeedbackWidget from '@/components/editor/FeedbackWidget';
import { PreviewSnapshot } from '@/components/editor/PreviewSnapshot';
import { PreviewPerformance } from '@/components/editor/PreviewPerformance';
import { PreviewAccessibility } from '@/components/editor/PreviewAccessibility';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

type WidgetType = 'feedback' | 'snapshot' | 'performance' | 'accessibility' | 'pwa' | null;

interface EditorFloatingWidgetsProps {
  isPreviewMode?: boolean;
}

export function EditorFloatingWidgets({ isPreviewMode = false }: EditorFloatingWidgetsProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeWidget, setActiveWidget] = useState<WidgetType>(null);

  // 모바일에서는 기본적으로 최소화 상태
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsMinimized(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleWidget = (widget: WidgetType) => {
    if (activeWidget === widget) {
      setActiveWidget(null);
    } else {
      setActiveWidget(widget);
      setIsMinimized(false);
    }
  };

  const closeWidget = () => {
    setActiveWidget(null);
    setIsMinimized(true);
  };

  // 위젯 목록 (순서대로 정렬: 피드백 → 스냅샷 → 성능 → 접근성 → PWA)
  const widgets = [
    { 
      id: 'feedback' as WidgetType, 
      icon: MessageSquare, 
      label: '피드백', 
      color: 'from-pink-500 to-rose-500',
      show: true,
    },
    { 
      id: 'snapshot' as WidgetType, 
      icon: Camera, 
      label: '스냅샷', 
      color: 'from-blue-500 to-cyan-500',
      show: isPreviewMode,
    },
    { 
      id: 'performance' as WidgetType, 
      icon: BarChart3, 
      label: '성능', 
      color: 'from-green-500 to-emerald-500',
      show: isPreviewMode,
    },
    { 
      id: 'accessibility' as WidgetType, 
      icon: Eye, 
      label: '접근성', 
      color: 'from-purple-500 to-indigo-500',
      show: isPreviewMode,
    },
    { 
      id: 'pwa' as WidgetType, 
      icon: Download, 
      label: 'PWA 설치', 
      color: 'from-orange-500 to-amber-500',
      show: true,
    },
  ].filter(w => w.show);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 sm:gap-3">
      {/* 위젯 패널 (열려있을 때) */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 w-72 sm:w-80 max-w-[calc(100vw-2rem)] mb-2"
          >
            {activeWidget && (
              <div className="relative">
                <button
                  onClick={closeWidget}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10"
                  aria-label="닫기"
                >
                  <X size={14} />
                </button>
                <div className="pr-6">
                  {activeWidget === 'feedback' && <FeedbackWidget />}
                  {activeWidget === 'snapshot' && isPreviewMode && <PreviewSnapshot />}
                  {activeWidget === 'performance' && isPreviewMode && <PreviewPerformance />}
                  {activeWidget === 'accessibility' && isPreviewMode && <PreviewAccessibility />}
                  {activeWidget === 'pwa' && <PWAInstallPrompt />}
                </div>
              </div>
            )}

            {activeWidget === null && (
              <div className="space-y-2">
                {widgets.map((widget) => {
                  const Icon = widget.icon;
                  return (
                    <button
                      key={widget.id}
                      onClick={() => toggleWidget(widget.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${widget.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900">{widget.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 최소화된 아이콘 버튼 */}
      <motion.button
        onClick={() => setIsMinimized(!isMinimized)}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center relative z-50"
        aria-label={isMinimized ? '위젯 열기' : '위젯 최소화'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMinimized ? (
          <Settings size={20} className="sm:w-6 sm:h-6" />
        ) : (
          <ChevronDown size={20} className="sm:w-6 sm:h-6" />
        )}
      </motion.button>
    </div>
  );
}

