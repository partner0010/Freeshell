import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { FileText, Star, Heart, Trash2, Plus, Search } from 'lucide-react'
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
    if (token) {
      loadTemplates()
    }
  }, [token])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchTerm, selectedCategory])

  const loadTemplates = async () => {
    try {
      const response = await axios.get('/api/templates', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setTemplates(response.data.templates)
      }
    } catch (error) {
      console.error('템플릿 로드 실패:', error)
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

  const useTemplate = async (templateId: string) => {
    try {
      const response = await axios.post(`/api/templates/${templateId}/use`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        // 콘텐츠 생성 페이지로 이동
        navigate('/create', { state: { formData: response.data.contentForm } })
      }
    } catch (error) {
      console.error('템플릿 사용 실패:', error)
    }
  }

  const toggleFavorite = async (templateId: string) => {
    try {
      await axios.post(`/api/templates/${templateId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      loadTemplates()
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error)
    }
  }

  const categories = ['all', 'daily', 'trending', 'educational', 'entertainment', 'business']

  if (loading) {
    return <div className="text-white text-center">로딩 중...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <FileText className="w-8 h-8 mr-3" />
          템플릿 라이브러리
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          템플릿 저장
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-dark-800 rounded-lg p-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="템플릿 검색..."
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? '전체' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 템플릿 그리드 */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-dark-800 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">템플릿이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-dark-800 rounded-lg p-6 hover:bg-dark-700 transition-colors cursor-pointer"
              onClick={() => useTemplate(template.id)}
            >
              {template.thumbnail && (
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{template.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(template.id)
                  }}
                  className={`p-1 ${template.isFavorite ? 'text-yellow-400' : 'text-gray-400'}`}
                >
                  <Star className={`w-5 h-5 ${template.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              {template.description && (
                <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded">
                    {template.category}
                  </span>
                  <span className="text-gray-400 text-xs">
                    사용 {template.usageCount}회
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

