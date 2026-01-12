/**
 * 스켈레톤 로더 컴포넌트
 * 로딩 상태를 위한 스켈레톤 UI
 */
'use client';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'circle' | 'rect';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export default function SkeletonLoader({
  variant = 'rect',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonLoaderProps) {
  const baseClasses = 'skeleton rounded';

  const variantClasses = {
    text: 'h-4',
    card: 'h-48',
    circle: 'rounded-full',
    rect: '',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: width || (variant === 'circle' ? height : '100%'),
        height: height || (variant === 'circle' ? width : undefined),
      }}
    />
  ));

  return <>{items}</>;
}
