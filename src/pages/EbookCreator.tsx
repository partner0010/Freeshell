import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContentStore } from '../store/contentStore'
import axios from 'axios'

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
        alert('E-book 생성 완료!')
      }
    } catch (error: any) {
      console.error('E-book 생성 실패:', error)
      alert(error.response?.data?.error || 'E-book 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (platform: string) => {
    if (!generatedEbook) {
      alert('먼저 E-book을 생성해주세요')
      return
    }

    try {
      setLoading(true)
      const accessToken = prompt(`${platform} Access Token을 입력해주세요:`)
      if (!accessToken) return

      const response = await axios.post('/api/ebook/publish', {
        ebookId: generatedEbook.id || 'temp',
        platform,
        price: parseFloat(price),
        accessToken
      })

      if (response.data.success) {
        alert(`${platform}에 게시 완료!`)
        navigate('/revenue')
      }
    } catch (error: any) {
      console.error('E-book 게시 실패:', error)
      alert(error.response?.data?.error || 'E-book 게시 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">E-book 자동 제작</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주제 *
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: AI로 시작하는 부업 가이드"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            콘텐츠 유형
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="일상대화">일상대화</option>
            <option value="오늘의 이슈">오늘의 이슈</option>
            <option value="영화 이야기">영화 이야기</option>
            <option value="드라마 이야기">드라마 이야기</option>
            <option value="재미">재미</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              챕터 수
            </label>
            <input
              type="number"
              value={chapterCount}
              onChange={(e) => setChapterCount(parseInt(e.target.value) || 10)}
              min="5"
              max="50"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '생성 중...' : 'E-book 생성'}
        </button>
      </div>

      {generatedEbook && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-bold">생성된 E-book</h2>
          
          <div className="space-y-2">
            <div>
              <span className="font-medium">제목:</span> {generatedEbook.title}
            </div>
            <div>
              <span className="font-medium">작가:</span> {generatedEbook.author}
            </div>
            <div>
              <span className="font-medium">설명:</span> {generatedEbook.description}
            </div>
            <div>
              <span className="font-medium">챕터 수:</span> {generatedEbook.chapters?.length || 0}
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              판매 가격 (USD)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />

            <div className="flex gap-4">
              <button
                onClick={() => handlePublish('gumroad')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Gumroad에 게시
              </button>
              <button
                onClick={() => handlePublish('etsy')}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                Etsy에 게시
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

