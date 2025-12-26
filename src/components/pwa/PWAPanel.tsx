'use client';

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, XCircle, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  installPWA,
  canInstallPWA,
  isPWAInstalled,
  registerServiceWorker,
} from '@/lib/pwa/pwa-installer';
import { useToast } from '@/components/ui/Toast';

export function PWAPanel() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setIsInstalled(isPWAInstalled());
    setCanInstall(canInstallPWA());

    // 서비스 워커 등록 확인
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setSwRegistered(!!registration);
      });
    }
  }, []);

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      setIsInstalled(true);
      setCanInstall(false);
      showToast({ type: 'success', message: 'PWA가 설치되었습니다' });
    }
  };

  const handleRegisterSW = async () => {
    const registration = await registerServiceWorker();
    if (registration) {
      setSwRegistered(true);
      showToast({ type: 'success', message: 'Service Worker가 등록되었습니다' });
    } else {
      showToast({ type: 'error', message: 'Service Worker 등록에 실패했습니다' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Smartphone className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">PWA 설정</h2>
            <p className="text-sm text-gray-500">Progressive Web App 기능</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 상태 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">설치 상태</span>
                {isInstalled ? (
                  <Badge variant="success">
                    <CheckCircle2 size={14} className="mr-1" />
                    설치됨
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <XCircle size={14} className="mr-1" />
                    미설치
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service Worker</span>
                {swRegistered ? (
                  <Badge variant="success">등록됨</Badge>
                ) : (
                  <Badge variant="default">미등록</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 설치 */}
        {canInstall && !isInstalled && (
          <Card>
            <CardHeader>
              <CardTitle>앱 설치</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                홈 화면에 추가하여 더 빠르게 접근하세요
              </p>
              <Button variant="primary" onClick={handleInstall} className="w-full">
                <Download size={18} className="mr-2" />
                설치
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Service Worker */}
        {!swRegistered && (
          <Card>
            <CardHeader>
              <CardTitle>Service Worker 등록</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                오프라인 기능과 푸시 알림을 사용하려면 Service Worker를 등록하세요
              </p>
              <Button variant="outline" onClick={handleRegisterSW} className="w-full">
                Service Worker 등록
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 기능 설명 */}
        <Card>
          <CardHeader>
            <CardTitle>PWA 기능</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                <span>오프라인에서도 기본 기능 사용 가능</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                <span>홈 화면에 추가하여 앱처럼 사용</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                <span>푸시 알림 지원</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                <span>빠른 로딩 속도</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

