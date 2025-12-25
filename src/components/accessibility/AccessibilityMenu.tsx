/**
 * 접근성 메뉴 컴포넌트
 * 스크린 리더, 키보드 네비게이션, 고대비 모드 등
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Accessibility, Eye, Keyboard, Volume2, Type, ZoomIn } from 'lucide-react';

export function AccessibilityMenu() {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 sm:p-4 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Accessibility className="text-purple-600" size={20} />
          <h3 className="font-bold text-gray-900">접근성 설정</h3>
        </div>

        <div className="space-y-4">
          {/* 폰트 크기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Type size={16} />
              <span>폰트 크기</span>
              <span className="text-xs text-gray-500 ml-1">(웹사이트 전체 텍스트 크기 조절)</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={decreaseFontSize}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                aria-label="폰트 크기 줄이기"
                title="폰트 크기 줄이기"
              >
                <span className="text-lg font-bold">−</span>
              </button>
              <span className="flex-1 text-center text-sm font-medium">{fontSize}px</span>
              <button
                onClick={increaseFontSize}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                aria-label="폰트 크기 늘리기"
                title="폰트 크기 늘리기"
              >
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
          </div>

          {/* 고대비 모드 */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-700" />
                <span className="text-sm font-medium text-gray-700">고대비 모드</span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-11 h-6 bg-gray-200 rounded-full appearance-none cursor-pointer relative transition-colors checked:bg-purple-600"
                style={{
                  background: highContrast ? '#9333ea' : '#e5e7eb',
                }}
              />
            </label>
          </div>

          {/* 키보드 단축키 안내 */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Keyboard size={16} className="text-gray-700" />
              <span className="text-sm font-medium text-gray-700">키보드 단축키</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Tab: 다음 요소</p>
              <p>Shift+Tab: 이전 요소</p>
              <p>Enter: 선택</p>
              <p>Esc: 닫기</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

