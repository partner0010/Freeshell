/**
 * 향상된 카드 컴포넌트
 * 글래스모피즘, 호버 효과, 그라데이션 등 최신 트렌드 반영
 */
'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EnhancedCardProps {
  children?: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  gradient?: boolean;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  onClick?: () => void;
}

export default function EnhancedCard({
  children,
  className = '',
  hover = true,
  glass = false,
  gradient = false,
  icon: Icon,
  title,
  description,
  onClick,
}: EnhancedCardProps) {
  const baseClasses = `
    rounded-2xl p-6 transition-all duration-300
    ${glass ? 'bg-white/10 backdrop-blur-xl border border-white/20' : 'bg-white shadow-lg border border-gray-200'}
    ${gradient ? 'bg-gradient-to-br from-purple-50 to-pink-50' : ''}
    ${hover ? 'hover:shadow-2xl hover:scale-105 hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {(Icon || title || description) && (
        <div className="mb-4">
          {Icon && (
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-3 shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          {title && (
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-gray-600 text-sm">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
