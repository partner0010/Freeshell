/**
 * 로딩 상태 관리 유틸리티
 * 사용자 경험 개선을 위한 로딩 상태 최적화
 */

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

/**
 * 스켈레톤 로딩 컴포넌트 생성
 */
export function createSkeletonLoader(count: number = 3): Array<{ id: string }> {
  return Array.from({ length: count }, (_, i) => ({ id: `skeleton-${i}` }));
}

/**
 * 프로그레스 바 업데이트
 */
export function updateProgress(
  current: number,
  total: number,
  callback: (progress: number) => void
): void {
  const progress = Math.min(100, Math.round((current / total) * 100));
  callback(progress);
}

/**
 * 최소 로딩 시간 보장 (깜빡임 방지)
 */
export function ensureMinimumLoadingTime<T>(
  promise: Promise<T>,
  minimumTime: number = 300
): Promise<T> {
  const startTime = Date.now();
  
  return Promise.all([
    promise,
    new Promise(resolve => setTimeout(resolve, minimumTime))
  ]).then(([result]) => {
    const elapsed = Date.now() - startTime;
    if (elapsed < minimumTime) {
      return new Promise(resolve => {
        setTimeout(() => resolve(result), minimumTime - elapsed);
      });
    }
    return result;
  });
}

/**
 * 로딩 상태 디바운싱
 */
export function debounceLoadingState(
  setLoading: (loading: boolean) => void,
  delay: number = 200
): (loading: boolean) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (loading: boolean) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 로딩 시작은 즉시
    if (loading) {
      setLoading(true);
      return;
    }

    // 로딩 종료는 디바운싱 (깜빡임 방지)
    timeoutId = setTimeout(() => {
      setLoading(false);
    }, delay);
  };
}

