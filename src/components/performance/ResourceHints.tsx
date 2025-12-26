/**
 * 리소스 힌트 컴포넌트
 * DNS prefetch, preconnect, prefetch, preload 등
 */

export function ResourceHints() {
  return (
    <>
      {/* DNS Prefetch - 외부 도메인 */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://api.openai.com" />
      <link rel="dns-prefetch" href="https://api-inference.huggingface.co" />
      <link rel="dns-prefetch" href="https://api.cohere.ai" />
      <link rel="dns-prefetch" href="https://api.together.xyz" />

      {/* Preconnect - 중요한 외부 리소스 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Preload - 중요한 폰트 */}
      <link
        rel="preload"
        href="/fonts/Pretendard-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}

