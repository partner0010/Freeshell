import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Play, CheckCircle, Loader, TrendingUp, Languages } from 'lucide-react'
import axios from 'axios'
import { ContentType } from '../types'

interface Language {
  code: string
  name: string
  region: string
}

interface GenerationResult {
  [language: string]: any[]
}

export default function GlobalCreator() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState<ContentType>('일상대화')
  const [duration, setDuration] = useState(600) // 10분 기본값
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['Asia', 'North America', 'Europe'])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)

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

  const regions = [
    { code: 'Asia', name: '아시아', languages: ['ko', 'ja', 'zh-CN', 'hi', 'th', 'vi', 'id'] },
    { code: 'North America', name: '북미', languages: ['en-US', 'es-MX'] },
    { code: 'Europe', name: '유럽', languages: ['en-GB', 'fr', 'de', 'it', 'nl', 'pl', 'ru'] },
    { code: 'Latin America', name: '라틴 아메리카', languages: ['es', 'pt-BR'] },
    { code: 'Middle East', name: '중동', languages: ['ar', 'tr'] }
  ]

  const allLanguages: Language[] = [
    { code: 'ko', name: '한국어', region: 'Asia' },
    { code: 'en-US', name: 'English (US)', region: 'North America' },
    { code: 'en-GB', name: 'English (UK)', region: 'Europe' },
    { code: 'ja', name: '日本語', region: 'Asia' },
    { code: 'zh-CN', name: '中文 (简体)', region: 'Asia' },
    { code: 'es', name: 'Español', region: 'Latin America' },
    { code: 'pt-BR', name: 'Português (Brasil)', region: 'Latin America' },
    { code: 'fr', name: 'Français', region: 'Europe' },
    { code: 'de', name: 'Deutsch', region: 'Europe' },
    { code: 'ru', name: 'Русский', region: 'Europe' },
    { code: 'ar', name: 'العربية', region: 'Middle East' },
    { code: 'hi', name: 'हिन्दी', region: 'Asia' },
    { code: 'th', name: 'ไทย', region: 'Asia' },
    { code: 'vi', name: 'Tiếng Việt', region: 'Asia' },
    { code: 'id', name: 'Bahasa Indonesia', region: 'Asia' }
  ]

  const handleRegionToggle = (regionCode: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(regionCode)) {
        return prev.filter(r => r !== regionCode)
      } else {
        return [...prev, regionCode]
      }
    })
  }

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(l => l !== langCode)
      } else {
        return [...prev, langCode]
      }
    })
  }

  const handleGlobalCreate = async () => {
    if (!topic.trim()) {
      alert('주제를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setResult(null)

      // 선택된 지역의 언어 자동 선택 (언어를 수동으로 선택하지 않은 경우)
      const languagesToUse = selectedLanguages.length > 0
        ? selectedLanguages
        : regions
            .filter(r => selectedRegions.includes(r.code))
            .flatMap(r => r.languages)

      const response = await axios.post('/api/multilingual/global', {
        topic,
        contentType,
        duration,
        regions: selectedRegions,
        languages: languagesToUse,
        generateVideos: true
      }, {
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY || ''
        }
      })

      if (response.data.success) {
        setResult(response.data.data)
        
        // 수익 대시보드로 이동
        setTimeout(() => {
          navigate('/revenue')
        }, 3000)
      } else {
        alert('전세계 콘텐츠 생성 중 오류가 발생했습니다')
      }
    } catch (error: any) {
      console.error('전세계 콘텐츠 생성 실패:', error)
      alert(error.response?.data?.error || '전세계 콘텐츠 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}초`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return secs > 0 ? `${minutes}분 ${secs}초` : `${minutes}분`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`
    }
  }

  const totalLanguages = selectedLanguages.length > 0
    ? selectedLanguages.length
    : regions
        .filter(r => selectedRegions.includes(r.code))
        .reduce((sum, r) => sum + r.languages.length, 0)

  const estimatedRevenue = result
    ? Object.values(result).reduce((sum, arr) => sum + arr.length, 0) * 10
    : totalLanguages * 10

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Globe className="w-8 h-8 text-blue-500" />
          <h1 className="text-4xl font-bold text-white">전세계 수익화</h1>
        </div>
        <p className="text-xl text-gray-400">
          하나의 주제로 전세계 여러 언어로 콘텐츠를 자동 생성하여 수익을 극대화하세요
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
            영상 길이: {formatTime(duration)} {duration >= 600 && '(광고 수익 최적화)'}
          </label>
          <input
            type="range"
            min="15"
            max="3600"
            step="15"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            disabled={loading}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>15초</span>
            <span>10분 (600초)</span>
            <span>1시간 (3600초)</span>
          </div>
        </div>

        {/* 지역 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Globe className="w-5 h-5 inline mr-2" />
            대상 지역 선택
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {regions.map(region => (
              <label
                key={region.code}
                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition ${
                  selectedRegions.includes(region.code)
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region.code)}
                  onChange={() => handleRegionToggle(region.code)}
                  className="w-4 h-4 text-blue-600"
                  disabled={loading}
                />
                <span className="text-sm font-medium">{region.name}</span>
                <span className="text-xs text-gray-500">({region.languages.length}개 언어)</span>
              </label>
            ))}
          </div>
        </div>

        {/* 언어 선택 (선택사항) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Languages className="w-5 h-5 inline mr-2" />
            특정 언어 선택 (선택사항 - 비워두면 선택한 지역의 모든 언어)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
            {allLanguages.map(lang => (
              <label
                key={lang.code}
                className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition text-sm ${
                  selectedLanguages.includes(lang.code)
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(lang.code)}
                  onChange={() => handleLanguageToggle(lang.code)}
                  className="w-3 h-3 text-blue-600"
                  disabled={loading}
                />
                <span>{lang.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 예상 수익 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-medium">생성될 언어 수</div>
              <div className="text-2xl font-bold text-blue-900">{totalLanguages}개 언어</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700 font-medium">예상 수익</div>
              <div className="text-2xl font-bold text-green-600">${estimatedRevenue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGlobalCreate}
          disabled={loading || !topic.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>전세계 콘텐츠 생성 중...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span>전세계 콘텐츠 생성 시작</span>
            </>
          )}
        </button>
      </div>

      {/* 결과 표시 */}
      {result && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-bold">생성 완료</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(result).map(([language, contents]) => (
              <div key={language} className="border rounded-lg p-4">
                <div className="font-bold text-lg mb-2">{language}</div>
                <div className="text-sm text-gray-600">{contents.length}개 콘텐츠</div>
                <div className="text-xs text-green-600 mt-1">${contents.length * 10} 예상</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">전세계 수익화 기능</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ 다국어 자동 번역 (25개 이상 언어 지원)</li>
          <li>✅ 지역별 최적화된 콘텐츠 생성</li>
          <li>✅ 다국어 음성 생성 (SUPERTONE AI)</li>
          <li>✅ 다국어 자막 자동 생성</li>
          <li>✅ 지역별 트렌드 분석</li>
          <li>✅ 여러 YouTube 채널 자동 업로드</li>
          <li>✅ 지역별 수익 추적</li>
        </ul>
      </div>
    </div>
  )
}

