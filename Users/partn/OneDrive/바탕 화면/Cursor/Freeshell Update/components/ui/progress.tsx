'use client';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export function Progress({ value, max = 100, className = '' }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
      <div
        className="bg-primary h-2 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

