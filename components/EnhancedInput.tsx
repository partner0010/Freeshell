/**
 * 향상된 입력 필드 컴포넌트
 * 플로팅 라벨, 포커스 효과, 검증 상태 등 최신 트렌드 반영
 */
'use client';

import { InputHTMLAttributes, useState, ReactNode } from 'react';
import { LucideIcon, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: LucideIcon;
  helperText?: string;
  floatingLabel?: boolean;
}

export default function EnhancedInput({
  label,
  error,
  success,
  icon: Icon,
  helperText,
  floatingLabel = false,
  type = 'text',
  className = '',
  ...props
}: EnhancedInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  const baseClasses = `
    w-full px-4 py-3
    border-2 rounded-xl
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : success
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
    }
    ${Icon ? 'pl-12' : ''}
    ${isPassword ? 'pr-12' : ''}
  `;

  return (
    <div className="relative">
      {floatingLabel && (
        <label
          className={`
            absolute left-4 transition-all duration-300 pointer-events-none
            ${isFocused || hasValue
              ? 'top-2 text-xs text-purple-600'
              : 'top-1/2 -translate-y-1/2 text-gray-500'
            }
          `}
        >
          {label}
        </label>
      )}
      {!floatingLabel && label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={inputType}
          className={`${baseClasses} ${className}`}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={handleChange}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {success && !isPassword && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        )}
        {error && !isPassword && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
            <XCircle className="w-5 h-5" />
          </div>
        )}
      </div>
      {(error || helperText) && (
        <div className="mt-2 flex items-center gap-1 text-sm">
          {error && (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-500">{error}</span>
            </>
          )}
          {!error && helperText && (
            <span className="text-gray-500">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}
