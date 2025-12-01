/**
 * 로딩 컴포넌트
 * 다양한 로딩 상태 표시
 */

import { Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export default function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin`} />
      {text && (
        <p className="text-gray-400 text-sm">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  )
}

/**
 * 스켈레톤 로딩 (콘텐츠 카드용)
 */
export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-[9/16] bg-dark-700 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-dark-700 rounded w-3/4"></div>
        <div className="h-3 bg-dark-700 rounded w-full"></div>
        <div className="h-3 bg-dark-700 rounded w-2/3"></div>
      </div>
    </div>
  )
}

/**
 * 스켈레톤 로딩 (리스트용)
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-dark-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-dark-700 rounded w-3/4"></div>
              <div className="h-3 bg-dark-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

