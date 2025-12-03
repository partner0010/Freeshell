import { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, Plus, Sparkles, Globe, Send, Loader } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  language: string
  status: string
  createdAt: string
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState('일상대화')
  const [language, setLanguage] = useState('ko')
  const [wordCount, setWordCount] = useState(1000)
  const [loading, setLoading] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<any>(null)

  const languages = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' },
  ]

  const contentTypes = [
    '일상대화',
    '오늘의 이슈',
    '기술 리뷰',
    '여행 가이드',
    '건강 팁',
  ]

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/blog/posts')
      if (response.data.success) {
        setPosts(response.data.data || [])
      }
    } catch (error: any) {
      console.error('블로그 포스트 조회 실패:', error)
      setPosts([])
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('주제를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('/api/blog/generate', {
        topic,
        contentType,
        language,
        wordCount
      })

      if (response.data.success) {
        setGeneratedPost(response.data.data)
        await fetchPosts()
      }
    } catch (error) {
      console.error('블로그 생성 실패:', error)
      alert('블로그 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
            <FileText className="w-6 h-6 text-green-400" />
            <span className="text-lg font-bold text-white">블로그 자동화</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white">
            블로그 포스트 생성
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            SEO 최적화된 블로그 포스트를 자동으로 생성하세요
          </p>
        </div>

        {/* 생성 폼 */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 space-y-6">
          {/* 주제 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              주제 *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="블로그 포스트 주제를 입력하세요"
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

          {/* 언어 선택 */}
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

          {/* 글자 수 */}
          <div>
            <label className="block text-lg font-bold text-white mb-4">
              글자 수: <span className="text-blue-400">{wordCount.toLocaleString()}자</span>
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer"
              disabled={loading}
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(wordCount / 5000) * 100}%, rgba(255,255,255,0.1) ${(wordCount / 5000) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-3">
              <span>500자</span>
              <span>3,000자</span>
              <span>5,000자</span>
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader className="w-6 h-6 animate-spin" />
                <span>생성 중...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Send className="w-6 h-6" />
                <span>블로그 포스트 생성</span>
              </div>
            )}
          </button>
        </div>

        {/* 생성된 포스트 */}
        {generatedPost && (
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-3xl p-10 animate-fade-in">
            <h2 className="text-3xl font-black text-white mb-6">{generatedPost.title}</h2>
            <div className="prose prose-invert max-w-none">
              <div className="text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
                {generatedPost.content}
              </div>
            </div>
          </div>
        )}

        {/* 포스트 목록 */}
        {posts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">최근 포스트</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-xl font-black text-white mb-2">{post.title}</h3>
                  <p className="text-base text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg font-medium">
                      {post.language}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
