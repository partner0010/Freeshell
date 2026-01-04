'use client';

import { useState } from 'react';
import { Cloud, Server, Monitor, Network, Settings, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Service {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: string;
  location: string;
}

export default function RemoteSolutionPage() {
  const [services, setServices] = useState<Service[]>([
    { name: '메인 서버', status: 'online', uptime: '99.9%', location: '서울, 한국' },
    { name: '백업 서버', status: 'online', uptime: '99.8%', location: '부산, 한국' },
    { name: 'CDN 서버', status: 'online', uptime: '99.95%', location: '글로벌' },
    { name: '데이터베이스', status: 'online', uptime: '99.9%', location: '서울, 한국' },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '정상 운영';
      case 'offline':
        return '오프라인';
      case 'maintenance':
        return '점검 중';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <Cloud className="w-10 h-10 text-primary" />
              원격 솔루션
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              클라우드 기반 원격 서비스 및 인프라 상태를 모니터링합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <Server className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">서버 관리</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                원격 서버 모니터링 및 관리
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <Monitor className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">원격 모니터링</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                실시간 시스템 상태 모니터링
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <Network className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">네트워크 관리</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                네트워크 연결 및 트래픽 관리
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <Settings className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">설정 관리</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                원격 설정 및 구성 관리
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6">서비스 상태</h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{service.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      service.status === 'online' ? 'text-green-600 dark:text-green-400' :
                      service.status === 'offline' ? 'text-red-600 dark:text-red-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {getStatusText(service.status)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">가동률: {service.uptime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4">주요 기능</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• 실시간 서버 상태 모니터링</li>
                <li>• 원격 서버 접근 및 관리</li>
                <li>• 자동 백업 및 복구</li>
                <li>• 확장성 있는 클라우드 인프라</li>
                <li>• 24/7 시스템 모니터링</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4">서비스 정보</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• 글로벌 CDN 네트워크</li>
                <li>• 다중 지역 백업</li>
                <li>• 고가용성 아키텍처</li>
                <li>• 자동 스케일링</li>
                <li>• 실시간 알림 시스템</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

