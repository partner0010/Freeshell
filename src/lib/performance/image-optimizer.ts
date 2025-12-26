/**
 * 이미지 최적화 유틸리티
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

/**
 * 이미지 URL 최적화
 */
export function optimizeImageUrl(
  url: string,
  options: ImageOptimizationOptions = {}
): string {
  // Next.js Image Optimization API 사용
  if (url.startsWith('/') || url.startsWith('http')) {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    // Next.js Image Optimization API 경로
    if (url.startsWith('/')) {
      return `/api/image-optimization?url=${encodeURIComponent(url)}&${params.toString()}`;
    }
  }
  
  return url;
}

/**
 * 이미지 프리로드
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 이미지 지연 로딩 (Intersection Observer 사용)
 */
export function setupLazyImageLoading(
  imageElement: HTMLImageElement,
  src: string,
  placeholder?: string
): () => void {
  if (placeholder) {
    imageElement.src = placeholder;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imageElement.src = src;
          observer.unobserve(imageElement);
        }
      });
    },
    { rootMargin: '50px' }
  );

  observer.observe(imageElement);

  return () => observer.unobserve(imageElement);
}

