/**
 * 광고 배너 컴포넌트
 * 관리자 설정에 따라 표시/숨김
 */
'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface AdBannerProps {
  config: {
    type: 'banner' | 'popup';
    enabled: boolean;
    title: string;
    content: string;
    imageUrl?: string;
    linkUrl?: string;
    position?: string;
    frequency?: 'always' | 'once' | 'daily';
  };
}

export default function AdBanner({ config }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!config.enabled) {
      setIsVisible(false);
      return;
    }

    // 빈도 체크
    const checkFrequency = () => {
      const key = `ad_${config.type}_${config.position || 'default'}`;
      
      if (config.frequency === 'once') {
        const dismissed = localStorage.getItem(key);
        if (dismissed) {
          setIsDismissed(true);
          return;
        }
      } else if (config.frequency === 'daily') {
        const lastShown = localStorage.getItem(`${key}_date`);
        const today = new Date().toDateString();
        if (lastShown === today) {
          setIsDismissed(true);
          return;
        }
      }

      setIsVisible(true);
    };

    checkFrequency();
  }, [config]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    const key = `ad_${config.type}_${config.position || 'default'}`;
    localStorage.setItem(key, 'true');
    
    if (config.frequency === 'daily') {
      localStorage.setItem(`${key}_date`, new Date().toDateString());
    }
  };

  if (!isVisible || isDismissed) return null;

  if (config.type === 'popup') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in scale-in">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {config.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={config.imageUrl}
                alt={config.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
          <p className="text-gray-600 mb-4">{config.content}</p>
          {config.linkUrl && (
            <a
              href={config.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span>자세히 보기</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // 배너
  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    sidebar: 'top-20 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[config.position as keyof typeof positionClasses] || 'top-0'} z-40 p-4 animate-in slide-in-from-top`}
    >
      <div className="relative bg-white rounded-xl shadow-xl border-2 border-purple-200 p-4 max-w-7xl mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-4">
          {config.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={config.imageUrl}
                alt={config.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">{config.title}</h3>
            <p className="text-sm text-gray-600">{config.content}</p>
          </div>
          {config.linkUrl && (
            <a
              href={config.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
            >
              자세히
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
