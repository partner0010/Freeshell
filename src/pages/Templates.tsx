import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { FileText, Star, Plus, Search, Sparkles, Zap } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface Template {
  id: string
  name: string
  description?: string
  category: string
  contentType: string
  thumbnail?: string
  usageCount: number
  isFavorite: boolean
  isPublic: boolean
  settings: any
}

export default function Templates() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchTerm, selectedCategory])

  const loadTemplates = async () => {
    try {
      // API 호출 시도
      if (token) {
        const response = await axios.get('/api/templates', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) {
          setTemplates(response.data.templates)
        }
      } else {
        // 토큰 없으면 샘플 데이터
        setTemplates([
          {
            id: '1',
            name: '유튜브 숏폼 템플릿',
            description: '바이럴 숏폼 영상을 위한 검증된 템플릿',
            category: 'shorts',
            contentType: '일상대화',
            usageCount: 1234,
            isFavorite: true,
            isPublic: true,
            settings: {}
          },
          {
            id: '2',
            name: '블로그 포스트 템플릿',
            description: 'SEO 최적화된 블로그 글 템플릿',
            category: 'blog',
            contentType: '오늘의 이슈',
            usageCount: 567,
            isFavorite: false,
            isPublic: true,
            settings: {}
          },
          {
            id: '3',
            name: '전자책 템플릿',
            description: '킨들 출판용 전자책 템플릿',
            category: 'ebook',
            contentType: '교육',
            usageCount: 890,
            isFavorite: true,
            isPublic: true,
            settings: {}
          }
        ])
      }
    } catch (error) {
      console.error('템플릿 로드 실패:', error)
      // 에러 발생 시에도 샘플 데이터 표시
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredTemplates(filtered)
  }

  const categories = ['all', 'shorts', 'blog', 'ebook', 'social']

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
            <FileText className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold text-white">템플릿</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white">
            템플릿 라이브러리
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            검증된 템플릿으로 빠르게 시작하세요
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 space-y-6">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="템플릿 검색..."
              className="w-full pl-16 pr-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* 카테고리 */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-base font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat === 'all' ? '전체' : cat === 'shorts' ? '숏폼' : cat === 'blog' ? '블로그' : cat === 'ebook' ? '전자책' : '소셜미디어'}
              </button>
            ))}
          </div>
        </div>

        {/* 템플릿 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-gray-300">로딩 중...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/create?templateId=${template.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-purple-400" />
                  <Star className={`w-6 h-6 ${template.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">{template.name}</h3>
                <p className="text-base text-gray-300 mb-4">{template.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{template.usageCount}회 사용</span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg font-medium">
                    {template.category}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">템플릿이 없습니다</p>
            </div>
          )}
        </div>

        {/* 새 템플릿 생성 */}
        <button
          onClick={() => navigate('/create')}
          className="fixed bottom-8 right-8 flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all"
        >
          <Plus className="w-6 h-6" />
          <span>새 템플릿</span>
        </button>
      </div>
    </div>
  )
}
