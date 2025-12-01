/**
 * 에러 바운더리 컴포넌트
 * React 에러를 캐치하여 사용자에게 친화적인 에러 메시지 표시
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('에러 바운더리에서 에러 캐치:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // 에러 로깅 (선택적)
    if (import.meta.env.PROD) {
      // 프로덕션에서는 에러 추적 서비스로 전송
      // 예: Sentry, LogRocket 등
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">오류가 발생했습니다</h1>
              <p className="text-gray-400">
                예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 홈으로 돌아가주세요.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-dark-800 rounded-lg p-4 text-left">
                <p className="text-sm text-red-400 font-mono mb-2">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-500 overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>다시 시도</span>
              </button>
              
              <Link
                to="/"
                className="inline-flex items-center justify-center space-x-2 bg-dark-700 hover:bg-dark-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>홈으로</span>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

