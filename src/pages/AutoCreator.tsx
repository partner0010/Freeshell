import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, CheckCircle, XCircle, Loader, Zap, Sparkles, Rocket } from 'lucide-react'
import axios from 'axios'
import { ContentType } from '../types'

interface AutomationStep {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message?: string
  data?: any
  error?: string
}

interface AutomationResult {
  success: boolean
  steps: AutomationStep[]
  totalTime: number
  revenue?: {
    estimated: number
    platforms: Record<string, number>
  }
}

export default function AutoCreator() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState<ContentType>('일상대화')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AutomationResult | null>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)

  const contentTypes: ContentType[] = [
    '일상대화',
    '오늘의 이슈',
    '영화 이야기',
    '드라마 이야기',
    '재미',
    '기쁨',
    '슬픔',
    '분노'
  ]

  const handleAutoCreate = async () => {
    if (!topic.trim()) {
      alert('주제를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setResult(null)

      const response = await axios.post('/api/automation/one-click', {
        topic,
        contentType,
        text: text || `${topic}에 대한 콘텐츠를 생성합니다.`,
        platforms: ['youtube', 'tiktok', 'instagram'],
        autoUpload: true
      })

      if (response.data.success) {
        setResult(response.data)
        setTimeout(() => {
          navigate('/revenue')
        }, 3000)
      }
    } catch (error: any) {
      console.error('자동화 실패:', error)
      alert(error.response?.data?.error || '자동화 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
            <Zap className="w-6 h-6 text-orange-400" />
            <span className="text-lg font-bold text-white">즉시 시작</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white">
            원클릭 자동화
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            주제만 입력하면 생성부터 배포까지 모든 과정이 자동으로 진행됩니다
          </p>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 space-y-8">
          {/* 주제 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              주제 *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 2024년 AI 트렌드"
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>

          {/* 콘텐츠 유형 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              카테고리
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg focus:border-blue-500 focus:outline-none appearance-none cursor-pointer transition-colors"
              disabled={loading}
            >
              {contentTypes.map(type => (
                <option key={type} value={type} className="bg-gray-900 text-white py-2">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 추가 정보 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              추가 정보 (선택사항)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="콘텐츠에 포함될 추가 정보를 입력하세요..."
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none transition-colors"
              rows={4}
              disabled={loading}
            />
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={handleAutoCreate}
            disabled={loading || !topic.trim()}
            className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader className="w-6 h-6 animate-spin" />
                <span>자동화 진행 중...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Rocket className="w-6 h-6" />
                <span>지금 시작하기</span>
              </div>
            )}
          </button>
        </div>

        {/* 진행 상황 */}
        {result && (
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-3xl p-10 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-black text-white">자동화 완료!</h2>
            </div>
            <div className="space-y-4">
              {result.steps?.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-white/10 rounded-2xl">
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : step.status === 'failed' ? (
                    <XCircle className="w-6 h-6 text-red-400" />
                  ) : (
                    <Loader className="w-6 h-6 text-blue-400 animate-spin" />
                  )}
                  <span className="text-lg text-white font-medium">{step.name}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-lg text-green-400 font-medium mt-8">
              수익 대시보드로 이동 중...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
