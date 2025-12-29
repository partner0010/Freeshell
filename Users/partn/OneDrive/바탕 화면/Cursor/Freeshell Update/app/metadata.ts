import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  metadataBase: new URL('https://freeshell.co.kr'),
  title: {
    default: 'Shell - 통합 AI 솔루션',
    template: '%s | Shell',
  },
  description: 'AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션',
  keywords: ['AI', '검색 엔진', '인공지능', 'Shell', 'AI 에이전트', 'Spark 워크스페이스', 'AI 드라이브', '포켓', '동영상 제작'],
  authors: [{ name: 'Shell Team' }],
  creator: 'Shell',
  publisher: 'Shell',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://freeshell.co.kr',
    siteName: 'Shell',
    title: 'Shell - 통합 AI 솔루션',
    description: 'AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Shell',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shell - 통합 AI 솔루션',
    description: 'AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션',
    images: ['/og-image.png'],
    creator: '@shell',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://freeshell.co.kr',
  },
};
