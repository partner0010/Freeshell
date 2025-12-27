import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { StructuredData } from '@/components/seo/StructuredData'
import { ResourceHints } from '@/components/performance/ResourceHints'
import { WebVitalsScript } from '@/components/performance/WebVitalsScript'
import { CookieConsent } from '@/components/cookies/CookieConsent'
import { A11yLiveRegion } from '@/components/accessibility/A11yLiveRegion'
import { KeyboardShortcutsInit } from '@/components/utils/KeyboardShortcutsInit'

export const metadata: Metadata = {
  title: 'Freeshell - AI 통합 콘텐츠 생성 솔루션',
  description: 'AI로 만드는 수익형 콘텐츠. 숏폼, 영상, 이미지, 전자책, 글쓰기까지 완전 자동화',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Freeshell',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Freeshell',
    title: 'Freeshell - AI 통합 콘텐츠 생성 솔루션',
    description: 'AI로 만드는 수익형 콘텐츠. 숏폼, 영상, 이미지, 전자책, 글쓰기까지 완전 자동화',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Freeshell - AI 통합 콘텐츠 생성 솔루션',
      },
    ],
    locale: 'ko_KR',
    url: 'https://freeshell.co.kr',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freeshell - AI 통합 콘텐츠 생성 솔루션',
    description: 'AI로 만드는 수익형 콘텐츠. 숏폼, 영상, 이미지, 전자책, 글쓰기까지 완전 자동화',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 언어는 클라이언트에서 동적으로 설정됨 (LanguageProvider에서 처리)
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <ResourceHints />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="robots" href="/robots.txt" />
        
        {/* 성능 최적화: DNS 프리페치 */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api-inference.huggingface.co" />
        
        {/* 성능 최적화: 프리커넥트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 구조화된 데이터 */}
        <StructuredData type="Organization" data={{}} />
        <StructuredData type="WebSite" data={{}} />
        <WebVitalsScript />
      </head>
      <body className="antialiased">
        <A11yLiveRegion />
        <Providers>
          {children}
          <CookieConsent />
          <KeyboardShortcutsInit />
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      // ServiceWorker 등록 성공
                      // 프로덕션에서는 로그 제거
                      if (process.env.NODE_ENV === 'development') {
                        console.log('ServiceWorker 등록 성공:', registration.scope);
                      }
                    },
                    function(err) {
                      // ServiceWorker 등록 실패 (에러 로깅만)
                      if (process.env.NODE_ENV === 'development') {
                        console.error('ServiceWorker 등록 실패:', err);
                      }
                    }
                  );
                });
              }
              
              // 성능 모니터링 초기화
              if (typeof window !== 'undefined' && 'performance' in window) {
                window.addEventListener('load', function() {
                  const perfData = window.performance.timing;
                  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                  
                  // 메모리 사용량 확인
                  if ((performance as any).memory) {
                    const memory = (performance as any).memory;
                    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
                    const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
                    
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[Performance] 페이지 로드 시간:', pageLoadTime + 'ms');
                      console.log('[Memory] 사용량:', usedMB + 'MB / ' + totalMB + 'MB');
                    }
                  } else {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[Performance] 페이지 로드 시간:', pageLoadTime + 'ms');
                    }
                  }
                });
              }
              
              // 메모리 누수 감지 (개발 환경)
              if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
                const checkMemory = setInterval(function() {
                  if ((performance as any).memory) {
                    const memory = (performance as any).memory;
                    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                    if (usageRatio > 0.8) {
                      console.warn('[Memory Warning] 메모리 사용량이 높습니다:', (usageRatio * 100).toFixed(1) + '%');
                    }
                  }
                }, 60000); // 1분마다 체크
                
                // 페이지 언로드 시 정리
                window.addEventListener('beforeunload', function() {
                  clearInterval(checkMemory);
                });
              }
              
              // 오프라인 큐 동기화 (온라인 상태로 전환 시)
              if (typeof window !== 'undefined') {
                window.addEventListener('online', function() {
                  import('@/lib/storage/offline-queue').then(function(module) {
                    module.syncOfflineQueue();
                  });
                });
                
                // 주기적 동기화 (5분마다)
                setInterval(function() {
                  if (navigator.onLine) {
                    import('@/lib/storage/offline-queue').then(function(module) {
                      module.syncOfflineQueue();
                    });
                  }
                }, 5 * 60 * 1000);
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

