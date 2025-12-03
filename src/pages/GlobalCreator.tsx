import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Play, CheckCircle, Loader, TrendingUp, Languages, Sparkles } from 'lucide-react'
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
  const [duration, setDuration] = useState(600)
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
      })

      if (response.data.success) {
        setResult(response.data.data)
        
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
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
            <Globe className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold text-white">전 세계 배포</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white">
            전 세계로 배포하세요
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            하나의 주제로 여러 언어의 콘텐츠를 자동 생성하여 전 세계에서 수익을 창출하세요
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-blue-400 mb-3">🌍 전세계 배포란?</h3>
            <p className="text-base text-gray-300 leading-relaxed">
              하나의 아이디어로 <span className="text-white font-semibold">100개 이상의 언어</span>로 자동 번역 및 최적화된 콘텐츠를 생성합니다. 
              각 지역의 문화와 트렌드를 반영하여 <span className="text-white font-semibold">YouTube, TikTok, Instagram</span> 등 
              전 세계 플랫폼에 동시 배포하고 <span className="text-green-400 font-semibold">글로벌 수익</span>을 창출할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 space-y-8">
          {/* 주제 입력 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              주제 *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: AI로 시작하는 부업 가이드"
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>

          {/* 콘텐츠 유형 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              콘텐츠 유형
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg focus:border-blue-500 focus:outline-none appearance-none cursor-pointer transition-colors"
              disabled={loading}
            >
              {contentTypes.map(type => (
                <option key={type} value={type} className="bg-gray-900 text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 영상 길이 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              영상 길이: <span className="text-blue-400">{formatTime(duration)}</span>
              {duration >= 600 && <span className="text-green-400 ml-2">(광고 수익 최적화)</span>}
            </label>
            <input
              type="range"
              min="15"
              max="3600"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
              disabled={loading}
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(duration / 3600) * 100}%, rgba(255,255,255,0.1) ${(duration / 3600) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-3">
              <span>15초</span>
              <span>10분</span>
              <span>1시간</span>
            </div>
          </div>

          {/* 지역 선택 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-400" />
              대상 지역 선택
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {regions.map(region => (
                <label
                  key={region.code}
                  className={`flex items-center space-x-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                    selectedRegions.includes(region.code)
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(region.code)}
                    onChange={() => handleRegionToggle(region.code)}
                    className="w-6 h-6 rounded accent-blue-500"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <span className="block text-lg font-bold text-white">{region.name}</span>
                    <span className="text-sm text-gray-400">{region.languages.length}개 언어</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 언어 선택 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4 flex items-center">
              <Languages className="w-6 h-6 mr-2 text-purple-400" />
              특정 언어 선택
              <span className="ml-2 text-sm text-gray-400 font-normal">(선택사항 - 비워두면 선택한 지역의 모든 언어)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {allLanguages.map(lang => (
                <label
                  key={lang.code}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    selectedLanguages.includes(lang.code)
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang.code)}
                    onChange={() => handleLanguageToggle(lang.code)}
                    className="w-5 h-5 rounded accent-purple-500"
                    disabled={loading}
                  />
                  <span className="text-base font-medium text-white">{lang.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 통계 및 생성 버튼 */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {totalLanguages}
                </div>
                <div className="text-sm text-gray-400 font-medium mt-1">언어</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-400">
                  ${estimatedRevenue}
                </div>
                <div className="text-sm text-gray-400 font-medium mt-1">예상 수익</div>
              </div>
            </div>
            
            <button
              onClick={handleGlobalCreate}
              disabled={loading || !topic.trim()}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>생성 중...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Play className="w-6 h-6" />
                  <span>전 세계로 배포</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 결과 */}
        {result && (
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-3xl p-10 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-black text-white">생성 완료!</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(result).map(([lang, contents]) => (
                <div key={lang} className="bg-white/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-white mb-2">{contents.length}</div>
                  <div className="text-base text-gray-300 font-medium">{lang}</div>
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
