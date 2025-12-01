import { useState, useEffect } from 'react'
import axios from 'axios'

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

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    // TODO: 실제 API 연동
    setPosts([])
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
      }, {
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY || ''
        }
      })

      if (response.data.success) {
        setGeneratedPost(response.data.data)
        alert('블로그 포스트 생성 완료!')
      }
    } catch (error: any) {
      console.error('블로그 포스트 생성 실패:', error)
      alert(error.response?.data?.error || '블로그 포스트 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleTranslate = async (targetLanguage: string) => {
    if (!generatedPost) {
      alert('먼저 블로그 포스트를 생성해주세요')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('/api/blog/translate', {
        blogPost: generatedPost,
        targetLanguage
      }, {
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY || ''
        }
      })

      if (response.data.success) {
        setGeneratedPost(response.data.data)
        alert('번역 완료!')
      }
    } catch (error: any) {
      console.error('번역 실패:', error)
      alert(error.response?.data?.error || '번역 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (platform: string) => {
    if (!generatedPost) {
      alert('먼저 블로그 포스트를 생성해주세요')
      return
    }

    try {
      setLoading(true)
      let credentials: any = {}

      if (platform === 'wordpress') {
        credentials = {
          siteUrl: prompt('WordPress 사이트 URL:'),
          username: prompt('사용자명:'),
          password: prompt('비밀번호:')
        }
      } else if (platform === 'medium') {
        credentials = {
          accessToken: prompt('Medium Access Token:'),
          userId: prompt('User ID:')
        }
      } else if (platform === 'blogger') {
        credentials = {
          blogId: prompt('Blog ID:'),
          accessToken: prompt('Access Token:')
        }
      }

      const response = await axios.post('/api/blog/publish', {
        blogPost: generatedPost,
        platform,
        credentials
      }, {
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY || ''
        }
      })

      if (response.data.success) {
        alert(`${platform}에 게시 완료!`)
        fetchPosts()
      }
    } catch (error: any) {
      console.error('블로그 게시 실패:', error)
      alert(error.response?.data?.error || '블로그 게시 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">블로그 자동화</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 생성 폼 */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-bold">새 블로그 포스트 생성</h2>

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
                단어 수
              </label>
              <input
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value) || 1000)}
                min="500"
                max="5000"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '생성 중...' : '블로그 포스트 생성'}
          </button>
        </div>

        {/* 생성된 포스트 */}
        {generatedPost && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-bold">생성된 포스트</h2>
            
            <div className="space-y-2">
              <div>
                <span className="font-medium">제목:</span> {generatedPost.title}
              </div>
              <div>
                <span className="font-medium">요약:</span> {generatedPost.excerpt}
              </div>
              <div>
                <span className="font-medium">태그:</span> {generatedPost.tags?.join(', ')}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="text-sm font-medium">다국어 번역:</div>
              <div className="flex flex-wrap gap-2">
                {languages.filter(l => l.code !== generatedPost.language).map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleTranslate(lang.code)}
                    disabled={loading}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm disabled:bg-gray-100"
                  >
                    {lang.name}로 번역
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="text-sm font-medium">게시 플랫폼:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePublish('wordpress')}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  WordPress
                </button>
                <button
                  onClick={() => handlePublish('medium')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Medium
                </button>
                <button
                  onClick={() => handlePublish('blogger')}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
                >
                  Blogger
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 게시된 포스트 목록 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">게시된 포스트</h2>
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            아직 게시된 포스트가 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <div key={post.id} className="border-b pb-2">
                <div className="font-medium">{post.title}</div>
                <div className="text-sm text-gray-500">{post.excerpt}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

