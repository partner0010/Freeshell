import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotificationCenter from "@/components/NotificationCenter";
import Accessibility from "@/components/Accessibility";
import MicroInteractions from "@/components/MicroInteractions";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Shell - 통합 AI 솔루션",
  description: "AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션",
  keywords: "AI, 검색 엔진, 인공지능, Shell, AI 에이전트, Spark 워크스페이스, AI 드라이브, 포켓, 동영상 제작",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shell",
  },
        openGraph: {
          title: "Shell - 통합 AI 솔루션",
          description: "AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션",
          type: "website",
          locale: "ko_KR",
          siteName: "Shell",
        },
        twitter: {
          card: "summary_large_image",
          title: "Shell - 통합 AI 솔루션",
          description: "AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션",
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
                    "name": "Shell",
                    "description": "통합 AI 솔루션",
                    "url": "https://freeshell.co.kr",
              "applicationCategory": "SearchApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
              },
            }),
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <Accessibility />
            <MicroInteractions />
            <Analytics />
            <main id="main-content">{children}</main>
            <Toaster position="top-right" />
            <NotificationCenter />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
