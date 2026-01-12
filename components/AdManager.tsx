/**
 * 광고 관리자 컴포넌트
 * 모든 광고/배너/팝업을 로드하고 표시
 */
'use client';

import { useState, useEffect } from 'react';
import AdBanner from './AdBanner';

interface AdConfig {
  type: 'banner' | 'popup';
  enabled: boolean;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  position?: string;
  frequency?: 'always' | 'once' | 'daily';
}

export default function AdManager() {
  const [adConfigs, setAdConfigs] = useState<AdConfig[]>([]);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setAdConfigs(data.adConfigs || []);
      }
    } catch (error) {
      console.error('광고 설정 로드 실패:', error);
    }
  };

  return (
    <>
      {adConfigs
        .filter(ad => ad.enabled)
        .map((ad, index) => (
          <AdBanner key={index} config={ad} />
        ))}
    </>
  );
}
