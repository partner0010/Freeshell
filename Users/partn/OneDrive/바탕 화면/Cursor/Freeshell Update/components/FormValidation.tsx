'use client';

import { useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean | string;
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  validation?: ValidationRule;
  error?: string;
  placeholder?: string;
  icon?: ReactNode;
}

export function FormField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  validation,
  error,
  placeholder,
  icon,
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = (val: string): string | null => {
    if (!validation) return null;

    if (validation.required && !val.trim()) {
      return `${label}은(는) 필수입니다.`;
    }

    if (validation.minLength && val.length < validation.minLength) {
      return `${label}은(는) 최소 ${validation.minLength}자 이상이어야 합니다.`;
    }

    if (validation.maxLength && val.length > validation.maxLength) {
      return `${label}은(는) 최대 ${validation.maxLength}자까지 입력 가능합니다.`;
    }

    if (validation.pattern && !validation.pattern.test(val)) {
      return `${label} 형식이 올바르지 않습니다.`;
    }

    if (validation.custom) {
      const result = validation.custom(val);
      if (typeof result === 'string') return result;
      if (!result) return `${label}이(가) 유효하지 않습니다.`;
    }

    return null;
  };

  const handleBlur = () => {
    setTouched(true);
    const error = validate(value);
    setLocalError(error);
  };

  const handleChange = (val: string) => {
    onChange(val);
    if (touched) {
      const error = validate(val);
      setLocalError(error);
    }
  };

  const displayError = error || (touched ? localError : null);
  const isValid = !displayError && value.length > 0;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            icon ? 'pl-10' : ''
          } ${
            displayError
              ? 'border-red-500 focus:ring-red-500'
              : isValid
              ? 'border-green-500 focus:ring-green-500'
              : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
          }`}
        />
        {isValid && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>
      {displayError && (
        <div className="flex items-center space-x-1 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

