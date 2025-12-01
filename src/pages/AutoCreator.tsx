import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, CheckCircle, XCircle, Loader, TrendingUp } from 'lucide-react'
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
      setCurrentStep('시작 중...')

      const response = await axios.post('/api/automation/run', {
        topic,
        contentType,
        text: text || undefined,
        // 모든 기능 활성화
        enableYouTube: true,
        enableEbook: true,
        enableBlog: true,
        // 기본 플랫폼
        youtubePlatforms: ['youtube'],
        ebookPlatforms: ['gumroad'],
        blogPlatforms: ['wordpress'],
        blogLanguages: ['ko', 'en']
      })

      if (response.data.success) {
        setResult(response.data.data)
        setCurrentStep(null)
        
        // 수익 대시보드로 이동
        setTimeout(() => {
          navigate('/revenue')
        }, 3000)
      } else {
        alert('자동화 실행 중 오류가 발생했습니다')
      }
    } catch (error: any) {
      console.error('자동화 실행 실패:', error)
      alert(error.response?.data?.error || '자동화 실행 중 오류가 발생했습니다')
      setCurrentStep(null)
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (status: AutomationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
    }
  }

  const getStepColor = (status: AutomationStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      case 'running':
        return 'bg-blue-500'
      default:
        return 'bg-gray-400'
    }
  }

  const completedSteps = result?.steps.filter(s => s.status === 'completed').length || 0
  const totalSteps = result?.steps.length || 0
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">원클릭 자동화</h1>
        <p className="text-xl text-gray-400">
          주제만 입력하면 모든 플랫폼에 자동으로 콘텐츠를 생성하고 배포합니다
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주제 * (예: AI로 시작하는 부업 가이드)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="주제를 입력하세요"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            콘텐츠 유형
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={loading}
          >
            {contentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추가 설명 (선택)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="추가로 설명할 내용이 있다면 입력하세요"
            rows={3}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleAutoCreate}
          disabled={loading || !topic.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>자동화 실행 중...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span>원클릭 자동화 시작</span>
            </>
          )}
        </button>

        {loading && currentStep && (
          <div className="text-center text-blue-600 font-medium">
            {currentStep}
          </div>
        )}
      </div>

      {/* 진행 상황 */}
      {result && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">진행 상황</h2>
            <div className="text-right">
              <div className="text-sm text-gray-500">완료율</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* 진행 바 */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 단계별 진행 상황 */}
          <div className="space-y-3">
            {result.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg border"
              >
                <div className="mt-1">{getStepIcon(step.status)}</div>
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  {step.message && (
                    <div className="text-sm text-gray-600 mt-1">{step.message}</div>
                  )}
                  {step.error && (
                    <div className="text-sm text-red-600 mt-1">{step.error}</div>
                  )}
                  {step.data?.url && (
                    <a
                      href={step.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-1"
                    >
                      보기 →
                    </a>
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full ${getStepColor(step.status)}`} />
              </div>
            ))}
          </div>

          {/* 수익 추정 */}
          {result.revenue && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-bold">예상 수익</h3>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${result.revenue.estimated.toLocaleString()}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(result.revenue.platforms).map(([platform, amount]) => (
                  <div key={platform} className="flex justify-between">
                    <span className="text-gray-600">{platform}:</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 완료 메시지 */}
          {result.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">
                    자동화 완료! ({Math.round(result.totalTime / 1000)}초 소요)
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    수익 대시보드로 이동합니다...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">자동화 내용</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ YouTube Shorts 생성 및 업로드</li>
          <li>✅ E-book 자동 제작 및 Gumroad 판매</li>
          <li>✅ 블로그 포스트 생성 및 다국어 번역</li>
          <li>✅ WordPress/Medium/Blogger 자동 게시</li>
          <li>✅ 모든 플랫폼에 자동 배포</li>
        </ul>
      </div>
    </div>
  )
}

