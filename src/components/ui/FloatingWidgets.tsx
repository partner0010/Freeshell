/**
 * 플로팅 위젯 통합 관리 컴포넌트
 * 오른쪽 하단에 아이콘으로 표시하고, 스크롤 시 따라다니며, 최소화 가능
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, MessageSquare, WifiOff, ChevronDown, ChevronUp, X, Settings } from 'lucide-react';
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';

type WidgetType = 'accessibility' | 'feedback' | null;

export function FloatingWidgets() {
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeWidget, setActiveWidget] = useState<WidgetType>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);

  // 오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineIndicator(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  return (
    <>
      {/* 오프라인 표시기 (별도 표시) */}
      <AnimatePresence>
        {showOfflineIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-white rounded-xl shadow-2xl p-3 sm:p-4 max-w-xs sm:max-w-sm mx-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <WifiOff size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm sm:text-base mb-1">오프라인 모드</h4>
                <p className="text-xs sm:text-sm opacity-90 break-words">
                  인터넷 연결이 없습니다.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 플로팅 위젯 컨테이너 - 모바일에서 하단 중앙, 데스크톱에서 오른쪽 하단 */}
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
              {activeWidget === 'accessibility' && (
                <div className="relative">
                  <button
                    onClick={closeWidget}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10"
                    aria-label="닫기"
                  >
                    <X size={14} />
                  </button>
                  <div className="pr-6">
                    <AccessibilityMenu />
                  </div>
                </div>
              )}

              {activeWidget === 'feedback' && (
                <div className="relative">
                  <button
                    onClick={closeWidget}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10"
                    aria-label="닫기"
                  >
                    <X size={14} />
                  </button>
                  <div className="pr-6">
                    <FeedbackWidget />
                  </div>
                </div>
              )}

              {activeWidget === null && (
                <div className="space-y-2">
                  <button
                    onClick={() => toggleWidget('accessibility')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Accessibility className="text-purple-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">접근성 설정</div>
                      <div className="text-xs text-gray-500">폰트 크기, 고대비 모드</div>
                    </div>
                  </button>

                  <button
                    onClick={() => toggleWidget('feedback')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="text-pink-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">피드백</div>
                      <div className="text-xs text-gray-500">의견을 남겨주세요</div>
                    </div>
                  </button>
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
    </>
  );
}

