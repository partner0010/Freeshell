'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { errorReporter } from '@/lib/error/error-reporter';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // 에러 리포팅
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 에러 로깅 (에러 리포터 사용)
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // 에러 리포터로 전송
    if (errorReporter) {
      errorReporter.report({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack || undefined,
        severity: 'high',
      });
    }

    // Sentry가 있는 경우에도 전송
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack || undefined,
          },
        },
      });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">오류가 발생했습니다</h1>
                <p className="text-gray-500 mt-1">
                  예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">오류 정보</div>
                <div className="text-xs font-mono text-red-600 bg-white p-3 rounded border overflow-x-auto">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo && this.state.errorInfo.componentStack && (
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer">상세 정보</summary>
                    <pre className="text-xs text-gray-600 mt-2 bg-white p-3 rounded border overflow-x-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={18} />
                다시 시도
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={18} />
                새로고침
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2 transition-colors"
              >
                <Home size={18} />
                홈으로
              </button>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-xs text-gray-500">
                문제가 계속되면 고객지원팀에 문의해주세요
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC로 에러 바운더리 래핑
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

