'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
  threshold?: number;
}

export default function InfiniteScroll({
  children,
  loadMore,
  hasMore,
  loader,
  endMessage,
  threshold = 100,
}: InfiniteScrollProps) {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          loadMore().finally(() => setIsLoading(false));
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
      }
    };
  }, [hasMore, isLoading, loadMore, threshold]);

  return (
    <>
      {children}
      <div ref={sentinelRef} className="h-4" />
      {isLoading && (loader || <div className="text-center py-4">로딩 중...</div>)}
      {!hasMore && !isLoading && endMessage && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">{endMessage}</div>
      )}
    </>
  );
}

