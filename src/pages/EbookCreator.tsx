import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BookOpen, Plus, Sparkles, Globe, Send, Loader, DollarSign } from 'lucide-react'

export default function EbookCreator() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState('일상대화')
  const [language, setLanguage] = useState('ko')
  const [chapterCount, setChapterCount] = useState(10)
  const [price, setPrice] = useState('9.99')
  const [loading, setLoading] = useState(false)
  const [generatedEbook, setGeneratedEbook] = useState<any>(null)

  const languages = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' },
  ]

  const contentTypes = [
    '일상대화',
    '기술 가이드',
    '자기계발',
    '비즈니스',
    '건강',
  ]

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('주제를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('/api/ebook/generate', {
        topic,
        contentType,
        language,
        chapterCount
      })

      if (response.data.success) {
        setGeneratedEbook(response.data.data)
        alert('전자책 생성 완료!')
      }
    } catch (error: any) {
      console.error('전자책 생성 실패:', error)
      alert(error.response?.data?.error || '전자책 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span className="text-lg font-bold text-white">전자책 생성</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white">
            전자책 자동 출판
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Kindle, 리디북스 등에 출판할 전자책을 자동으로 생성하세요
          </p>
        </div>

        {/* 생성 폼 */}
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
              placeholder="예: AI 시대의 부업 전략"
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              카테고리
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
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

          {/* 언어 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-400" />
              언어
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-6 py-4 border-2 rounded-2xl text-base font-bold transition-all ${
                    language === lang.code
                      ? 'bg-blue-500/20 border-blue-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                  }`}
                  disabled={loading}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* 챕터 수 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              챕터 수: <span className="text-blue-400">{chapterCount}개</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={chapterCount}
              onChange={(e) => setChapterCount(Number(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer"
              disabled={loading}
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((chapterCount - 5) / 25) * 100}%, rgba(255,255,255,0.1) ${((chapterCount - 5) / 25) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-3">
              <span>5개</span>
              <span>15개</span>
              <span>30개</span>
            </div>
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-400" />
              판매 가격
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              step="0.01"
              min="0"
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader className="w-6 h-6 animate-spin" />
                <span>전자책 생성 중...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <BookOpen className="w-6 h-6" />
                <span>전자책 생성하기</span>
              </div>
            )}
          </button>
        </div>

        {/* 생성 결과 */}
        {generatedEbook && (
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-10 animate-fade-in">
            <h2 className="text-3xl font-black text-white mb-6">{generatedEbook.title}</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/10 rounded-2xl p-6">
                <div className="text-4xl font-black text-white mb-2">{generatedEbook.chapters?.length || chapterCount}</div>
                <div className="text-base text-gray-300">챕터</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6">
                <div className="text-4xl font-black text-green-400 mb-2">${price}</div>
                <div className="text-base text-gray-300">판매 가격</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/revenue')}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-lg transition-all"
            >
              출판 플랫폼으로 배포
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
