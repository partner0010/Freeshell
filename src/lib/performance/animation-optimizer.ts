/**
 * 애니메이션 성능 최적화
 * GPU 가속 및 프레임 드롭 방지
 */

/**
 * GPU 가속 클래스 추가
 */
export function enableGPUAcceleration(element: HTMLElement): void {
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform';
}

/**
 * 애니메이션 프레임 최적화
 */
export function requestAnimationFrameOptimized(callback: FrameRequestCallback): number {
  let lastTime = 0;
  const fps = 60;
  const frameInterval = 1000 / fps;

  return requestAnimationFrame((currentTime) => {
    const elapsed = currentTime - lastTime;

    if (elapsed >= frameInterval) {
      lastTime = currentTime - (elapsed % frameInterval);
      callback(currentTime);
    } else {
      requestAnimationFrameOptimized(callback);
    }
  });
}

/**
 * 스크롤 성능 최적화
 */
export function optimizeScroll(element: HTMLElement): () => void {
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // 스크롤 이벤트 처리
        ticking = false;
      });
      ticking = true;
    }
  };

  element.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    element.removeEventListener('scroll', handleScroll);
  };
}

/**
 * 리사이즈 성능 최적화
 */
export function optimizeResize(callback: () => void, delay: number = 250): () => void {
  let timeoutId: NodeJS.Timeout;

  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };

  window.addEventListener('resize', handleResize, { passive: true });

  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(timeoutId);
  };
}

/**
 * Intersection Observer 최적화
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}

