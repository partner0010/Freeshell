'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from './CopyPaste';

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
  const { copied, copy } = useCopyToClipboard();

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setTargetText(''); // 이전 결과 초기화
    try {
      // OpenAI API를 사용한 번역
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: 'gpt-4',
          prompt: `다음 텍스트를 ${languages.find(l => l.code === targetLang)?.name || targetLang}로 번역해주세요. 원문의 의미와 톤을 정확히 유지해주세요:\n\n${sourceText}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // API에서 반환된 결과를 그대로 사용 (fallback이 이미 처리됨)
        setTargetText(data.result || sourceText);
      } else {
        // API 오류 시에도 응답 본문을 확인
        try {
          const errorData = await response.json();
          if (errorData.error) {
            console.error('번역 API 오류:', errorData.error);
          }
        } catch (e) {
          // JSON 파싱 실패 시 무시
        }
        // API 키가 없거나 오류 발생 시 원문 표시 (사용자가 API 키 설정을 알 수 있도록)
        setTargetText(sourceText);
      }
    } catch (error) {
      console.error('번역 실패:', error);
      // 네트워크 오류 등 예외 발생 시 원문 표시
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Languages className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">AI 번역</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <button
            onClick={swapLanguages}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">원문</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="번역할 텍스트를 입력하세요..."
              className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">번역 결과</label>
              {targetText && (
                <button
                  onClick={() => copy(targetText)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
            <textarea
              value={targetText}
              readOnly
              placeholder="번역 결과가 여기에 표시됩니다..."
              className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim()}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isTranslating ? '번역 중...' : '번역하기'}
        </button>
      </div>
    </div>
  );
}

