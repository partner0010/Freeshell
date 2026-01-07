'use client';

import { useState } from 'react';
import { Languages, ArrowRightLeft, Copy, Check, Loader2 } from 'lucide-react';

const languages = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
];

export default function Translator() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('ko');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setTargetText('');
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: 'gemini-pro',
          prompt: `다음 텍스트를 ${languages.find(l => l.code === targetLang)?.name || targetLang}로 번역해주세요. 원문의 의미와 톤을 정확히 유지해주세요:\n\n${sourceText}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translatedText = data.result || sourceText;
        
        // 시뮬레이션 응답인지 확인
        if (translatedText.includes('시뮬레이션') || translatedText === sourceText) {
          console.warn('[Translator] 시뮬레이션 모드 또는 번역 실패');
        }
        
        setTargetText(translatedText);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Translator] 번역 API 오류:', errorData);
        setTargetText(sourceText);
      }
    } catch (error: any) {
      console.error('[Translator] 번역 실패:', error);
      setTargetText(sourceText);
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    const tempText = sourceText;
    setSourceText(targetText);
    setTargetText(tempText);
  };

  const handleCopy = async () => {
    if (targetText) {
      await navigator.clipboard.writeText(targetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">AI 번역</h2>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* 언어 선택 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:justify-center">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary dark:text-white"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <button
              onClick={swapLanguages}
              className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors self-center sm:self-auto"
              aria-label="언어 교환"
            >
              <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary dark:text-white"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* 텍스트 입력 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">원문</label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="번역할 텍스트를 입력하세요..."
                className="w-full h-32 sm:h-40 md:h-48 px-4 py-3 text-sm sm:text-base md:text-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary resize-none dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">번역 결과</label>
                {targetText && (
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="복사"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                )}
              </div>
              <textarea
                value={targetText}
                readOnly
                placeholder="번역 결과가 여기에 표시됩니다..."
                className="w-full h-32 sm:h-40 md:h-48 px-4 py-3 text-sm sm:text-base md:text-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none resize-none dark:text-white"
              />
            </div>
          </div>

          {/* 번역 버튼 */}
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="w-full px-6 py-3 sm:px-8 sm:py-4 bg-primary text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>번역 중...</span>
              </>
            ) : (
              <span>번역하기</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
