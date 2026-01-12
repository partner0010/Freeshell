/**
 * 페이지 헤더 컴포넌트
 * 일관된 페이지 헤더 디자인
 */
'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  gradient?: boolean;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  gradient = true,
}: PageHeaderProps) {
  return (
    <ScrollAnimation direction="down" delay={0}>
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* 배경 효과 */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        )}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              {Icon && (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
              )}
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 ${
                gradient
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
                  : 'text-gray-900'
              }`}>
                {title}
              </h1>
              {description && (
                <p className="text-xl text-gray-600 max-w-3xl">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollAnimation>
  );
}
