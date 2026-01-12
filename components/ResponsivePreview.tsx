/**
 * 반응형 미리보기 컴포넌트
 * 모바일/태블릿/데스크톱 뷰 전환
 */
'use client';

import { useState } from 'react';
import { Smartphone, Tablet, Monitor, Maximize2, Minimize2 } from 'lucide-react';

interface ResponsivePreviewProps {
  html: string;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'fullscreen';

export default function ResponsivePreview({ html }: ResponsivePreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const deviceSizes = {
    mobile: { width: '375px', height: '667px', name: '모바일' },
    tablet: { width: '768px', height: '1024px', name: '태블릿' },
    desktop: { width: '100%', height: '100%', name: '데스크톱' },
    fullscreen: { width: '100vw', height: '100vh', name: '전체화면' },
  };

  const currentSize = deviceSizes[deviceType];

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Minimize2 className="w-5 h-5 text-white" />
            </button>
            <span className="text-white font-medium">{currentSize.name} 미리보기</span>
          </div>
          <div className="flex items-center gap-2">
            {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map((device) => (
              <button
                key={device}
                onClick={() => setDeviceType(device)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  deviceType === device
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {deviceSizes[device].name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
          <div
            style={{
              width: currentSize.width,
              height: currentSize.height,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            className="bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <iframe
              srcDoc={html}
              className="w-full h-full border-0"
              title="Fullscreen Preview"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">미리보기</span>
          <span className="text-xs text-gray-500">({currentSize.name})</span>
        </div>
        <div className="flex items-center gap-2">
          {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map((device) => {
            const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor;
            return (
              <button
                key={device}
                onClick={() => setDeviceType(device)}
                className={`p-2 rounded transition-colors ${
                  deviceType === device
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title={deviceSizes[device].name}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="전체화면"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 미리보기 영역 */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
        <div
          style={{
            width: currentSize.width,
            height: currentSize.height,
            maxWidth: '100%',
            maxHeight: '100%',
            transition: 'all 0.3s',
          }}
          className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-300"
        >
          <iframe
            srcDoc={html}
            className="w-full h-full border-0"
            title="Responsive Preview"
          />
        </div>
      </div>
    </div>
  );
}
