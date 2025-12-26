/**
 * 쿠키 동의 컴포넌트
 * GDPR 및 개인정보 보호법 준수
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, Check } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'cookie-consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // 필수 쿠키는 항상 true
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // 쿠키 동의 여부 확인
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setIsVisible(false);
    
    // 쿠키 설정에 따라 스크립트 로드
    if (prefs.analytics) {
      // Google Analytics 등 분석 도구 로드
    }
    if (prefs.marketing) {
      // 마케팅 쿠키 스크립트 로드
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-gray-200 shadow-2xl"
      >
        <div className="max-w-6xl mx-auto">
          {!showSettings ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="text-purple-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">쿠키 사용 안내</h3>
                  <p className="text-sm text-gray-600">
                    당사는 웹사이트의 기능 향상과 사용자 경험 개선을 위해 쿠키를 사용합니다. 
                    자세한 내용은{' '}
                    <Link href="/privacy" className="text-purple-600 hover:underline">
                      개인정보 처리방침
                    </Link>
                    을 확인하세요.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Settings size={16} />
                  설정
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  거부
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  모두 수락
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">쿠키 설정</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">필수 쿠키</div>
                    <div className="text-sm text-gray-600">웹사이트 기본 기능에 필요합니다</div>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600">
                    <Check size={20} />
                    <span className="text-sm font-medium">항상 활성화</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">분석 쿠키</div>
                    <div className="text-sm text-gray-600">웹사이트 사용 통계 수집</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">마케팅 쿠키</div>
                    <div className="text-sm text-gray-600">맞춤형 광고 제공</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  설정 저장
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

