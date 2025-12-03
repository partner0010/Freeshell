/**
 * 광고 배너 컴포넌트
 * 법적 문제 없이 안전하게 광고를 표시
 */

import { X } from 'lucide-react'
import { useState } from 'react'

interface AdBannerProps {
  position?: 'top' | 'bottom' | 'sidebar'
  type?: 'image' | 'text' | 'video'
}

export default function AdBanner({ position = 'top', type = 'text' }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className={`relative ${
      position === 'top' ? 'mb-6' : position === 'bottom' ? 'mt-6' : ''
    }`}>
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400 font-medium">SPONSORED</span>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-bold text-white">
            더 많은 기능을 원하시나요?
          </p>
          <p className="text-base text-gray-300">
            프리미엄 플랜으로 업그레이드하고 무제한으로 사용하세요
          </p>
          <button className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all">
            자세히 보기
          </button>
        </div>
      </div>
    </div>
  )
}

