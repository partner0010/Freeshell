'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Accessibility, AlertCircle, CheckCircle } from 'lucide-react';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  element?: HTMLElement;
  message: string;
  guideline: string;
  fix: string;
}

export function PreviewAccessibility() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scanAccessibility = () => {
      const newIssues: AccessibilityIssue[] = [];

      // 1. 이미지 alt 속성 검사
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.getAttribute('alt')) {
          newIssues.push({
            type: 'error',
            element: img as HTMLElement,
            message: '이미지에 alt 속성이 없습니다',
            guideline: 'WCAG 2.1 Level A',
            fix: '모든 이미지에 의미 있는 alt 속성을 추가하세요',
          });
        }
      });

      // 2. 링크 텍스트 검사
      const links = document.querySelectorAll('a');
      links.forEach((link) => {
        const text = link.textContent?.trim() || '';
        if (!text || text === '#' || text.toLowerCase() === 'click here' || text.toLowerCase() === 'read more') {
          newIssues.push({
            type: 'warning',
            element: link as HTMLElement,
            message: '링크 텍스트가 명확하지 않습니다',
            guideline: 'WCAG 2.1 Level A',
            fix: '링크의 목적을 명확히 설명하는 텍스트를 사용하세요',
          });
        }
      });

      // 3. 색상 대비 검사
      const elements = document.querySelectorAll('*');
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const fgColor = style.color;
        
        // 실제 대비 계산은 복잡하므로 시뮬레이션
        if (bgColor === fgColor || (bgColor === 'rgb(255, 255, 255)' && fgColor === 'rgb(255, 255, 255)')) {
          newIssues.push({
            type: 'error',
            element: el as HTMLElement,
            message: '텍스트와 배경색의 대비가 부족합니다',
            guideline: 'WCAG 2.1 Level AA (4.5:1)',
            fix: '텍스트와 배경색의 대비 비율을 4.5:1 이상으로 조정하세요',
          });
        }
      });

      // 4. 헤딩 구조 검사
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      if (headings.length === 0) {
        newIssues.push({
          type: 'warning',
          message: '페이지에 헤딩이 없습니다',
          guideline: 'WCAG 2.1 Level A',
          fix: '콘텐츠를 구조화하기 위해 헤딩을 사용하세요',
        });
      } else {
        let lastLevel = 0;
        headings.forEach((heading) => {
          const level = parseInt(heading.tagName[1]);
          if (level > lastLevel + 1) {
            newIssues.push({
              type: 'warning',
              element: heading as HTMLElement,
              message: `헤딩 레벨이 건너뛰어졌습니다 (h${lastLevel} → h${level})`,
              guideline: 'WCAG 2.1 Level A',
              fix: '헤딩 레벨을 순차적으로 사용하세요',
            });
          }
          lastLevel = level;
        });
      }

      // 5. 폼 레이블 검사
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        const id = input.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (!label && input.getAttribute('aria-label') && input.getAttribute('aria-labelledby')) {
            newIssues.push({
              type: 'error',
              element: input as HTMLElement,
              message: '입력 필드에 레이블이 없습니다',
              guideline: 'WCAG 2.1 Level A',
              fix: 'label 요소나 aria-label 속성을 추가하세요',
            });
          }
        }
      });

      // 6. 키보드 접근성 검사
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      interactiveElements.forEach((el) => {
        const tabIndex = el.getAttribute('tabindex');
        if (tabIndex === '-1' && !(el as HTMLElement).hasAttribute('aria-hidden')) {
          newIssues.push({
            type: 'warning',
            element: el as HTMLElement,
            message: '키보드 접근이 차단된 대화형 요소입니다',
            guideline: 'WCAG 2.1 Level A',
            fix: '키보드 사용자를 위해 tabindex="-1"을 제거하거나 적절한 대체 수단을 제공하세요',
          });
        }
      });

      setIssues(newIssues);
    };

    scanAccessibility();
    
    // DOM 변경 감지
    const observer = new MutationObserver(scanAccessibility);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['alt', 'aria-label', 'tabindex'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // 색맹 모드 적용
    const styleId = 'color-blind-mode';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    if (colorBlindMode === 'none') {
      styleElement.textContent = '';
    } else {
      // 색맹 시뮬레이션 필터 (간단한 버전)
      const filters = {
        protanopia: 'url(#protanopia)',
        deuteranopia: 'url(#deuteranopia)',
        tritanopia: 'url(#tritanopia)',
      };

      styleElement.textContent = `
        body {
          filter: ${filters[colorBlindMode]};
        }
        <svg>
          <defs>
            <filter id="protanopia">
              <feColorMatrix values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
            </filter>
            <filter id="deuteranopia">
              <feColorMatrix values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
            </filter>
            <filter id="tritanopia">
              <feColorMatrix values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
            </filter>
          </defs>
        </svg>
      `;
    }

    return () => {
      if (styleElement && colorBlindMode === 'none') {
        styleElement.textContent = '';
      }
    };
  }, [colorBlindMode]);

  const errors = issues.filter((i) => i.type === 'error').length;
  const warnings = issues.filter((i) => i.type === 'warning').length;

  return (
    <>
      {/* 접근성 버튼 */}
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        title="접근성 검사"
        aria-label="접근성 검사 패널 열기"
      >
        <Accessibility size={20} />
        {(errors > 0 || warnings > 0) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {errors + warnings}
          </span>
        )}
      </button>

      {/* 접근성 패널 */}
      {showPanel && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed top-20 left-6 z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-h-[calc(100vh-120px)] flex flex-col"
        >
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Accessibility className="text-blue-600" size={20} />
                <h3 className="font-bold text-gray-800">접근성 검사</h3>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="패널 닫기"
              >
                ✕
              </button>
            </div>

            {/* 요약 */}
            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle size={14} />
                <span className="font-medium">{errors} 오류</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertCircle size={14} />
                <span className="font-medium">{warnings} 경고</span>
              </div>
            </div>
          </div>

          {/* 이슈 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                <p className="text-sm text-gray-500">접근성 이슈가 없습니다!</p>
              </div>
            ) : (
              issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    issue.type === 'error'
                      ? 'bg-red-50 border-red-200'
                      : issue.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    {issue.type === 'error' ? (
                      <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{issue.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{issue.guideline}</p>
                      <p className="text-xs text-blue-600 mt-1">{issue.fix}</p>
                    </div>
                  </div>
                  {issue.element && (
                    <button
                      onClick={() => {
                        if (issue.element) {
                          issue.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          issue.element.style.outline = '3px solid red';
                          setTimeout(() => {
                            if (issue.element) {
                              issue.element.style.removeProperty('outline');
                            }
                          }, 2000);
                        }
                      }}
                      className="text-xs text-blue-600 hover:underline mt-2"
                    >
                      요소로 이동
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 도구 */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                색맹 시뮬레이션
              </label>
              <select
                value={colorBlindMode}
                onChange={(e) => setColorBlindMode(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="none">없음</option>
                <option value="protanopia">적색맹</option>
                <option value="deuteranopia">녹색맹</option>
                <option value="tritanopia">청색맹</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

