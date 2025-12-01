import { Link } from 'react-router-dom'
import { useContentStore } from '../store/contentStore'
import { Plus, Sparkles, Upload, Eye, Clock, TrendingUp, Eye as EyeIcon, Heart, Share2, MoreVertical, Zap } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const { allContents } = useContentStore()
  const [filter, setFilter] = useState<'all' | 'draft' | 'generated' | 'uploaded' | 'published'>('all')

  const filteredContents = filter === 'all' 
    ? allContents 
    : allContents.filter(content => content.status === filter)

  const stats = {
    total: allContents.length,
    draft: allContents.filter(c => c.status === 'draft').length,
    generated: allContents.filter(c => c.status === 'generated').length,
    uploaded: allContents.filter(c => c.status === 'uploaded').length,
    published: allContents.filter(c => c.status === 'published').length,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '오늘'
    if (days === 1) return '어제'
    if (days < 7) return `${days}일 전`
    if (days < 30) return `${Math.floor(days / 7)}주 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status?: string) => {
    const badges = {
      draft: { label: '초안', color: 'bg-gray-500' },
      generated: { label: '생성됨', color: 'bg-blue-500' },
      uploaded: { label: '업로드됨', color: 'bg-yellow-500' },
      published: { label: '게시됨', color: 'bg-green-500' },
    }
    const badge = badges[status as keyof typeof badges] || badges.draft
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color} text-white`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          올인원 콘텐츠 AI
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          AI가 여러분의 아이디어를 5가지 버전의 숏폼 콘텐츠로 자동 생성하고 업로드합니다
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/auto"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            <Zap className="w-5 h-5" />
            <span>원클릭 자동화 시작</span>
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center space-x-2 btn-primary text-lg px-8 py-4"
          >
            <Plus className="w-5 h-5" />
            <span>콘텐츠 생성</span>
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-gray-400">전체</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">{stats.generated}</div>
          <div className="text-sm text-gray-400">생성됨</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.uploaded}</div>
          <div className="text-sm text-gray-400">업로드됨</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{stats.published}</div>
          <div className="text-sm text-gray-400">게시됨</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-400 mb-1">{stats.draft}</div>
          <div className="text-sm text-gray-400">초안</div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">AI 자동 생성</h3>
          </div>
          <p className="text-gray-400">
            입력한 내용을 바탕으로 AI가 5가지 버전의 콘텐츠를 자동으로 생성합니다.
            각 버전마다 제작 이유와 설명을 제공합니다.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Eye className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">실시간 미리보기</h3>
          </div>
          <p className="text-gray-400">
            생성된 콘텐츠를 업로드 전에 미리 확인하고, 원하는 버전을 선택할 수 있습니다.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Upload className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">자동 업로드</h3>
          </div>
          <p className="text-gray-400">
            선택한 플랫폼에 자동으로 로그인하고 콘텐츠를 업로드하는 올인원 솔루션입니다.
          </p>
        </div>
      </div>

      {/* 생성된 콘텐츠 목록 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">내 콘텐츠</h2>
          <div className="flex space-x-2">
            {(['all', 'generated', 'uploaded', 'published', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                {status === 'all' ? '전체' : 
                 status === 'generated' ? '생성됨' :
                 status === 'uploaded' ? '업로드됨' :
                 status === 'published' ? '게시됨' : '초안'}
              </button>
            ))}
          </div>
        </div>

        {filteredContents.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-white">아직 생성된 콘텐츠가 없습니다</h3>
            <p className="text-gray-400 mb-6">
              첫 번째 콘텐츠를 생성해보세요!
            </p>
            <Link
              to="/create"
              className="inline-flex items-center space-x-2 btn-primary"
            >
              <Plus className="w-5 h-5" />
              <span>콘텐츠 생성하기</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <Link
                key={content.id}
                to={`/preview?content=${content.id}`}
                className="card hover:border-primary-500 transition-colors group"
              >
                {/* 썸네일 */}
                <div className="relative aspect-[9/16] bg-dark-700 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(content.status)}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EyeIcon className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* 정보 */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {content.description}
                    </p>
                  </div>

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{content.duration}초</span>
                    </div>
                    <span>{formatDate(content.createdAt)}</span>
                  </div>

                  {/* 통계 (있는 경우) */}
                  {(content.views || content.likes) && (
                    <div className="flex items-center space-x-4 pt-2 border-t border-dark-700">
                      {content.views && (
                        <div className="flex items-center space-x-1 text-gray-400">
                          <EyeIcon className="w-4 h-4" />
                          <span className="text-sm">{content.views.toLocaleString()}</span>
                        </div>
                      )}
                      {content.likes && (
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{content.likes.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 플랫폼 (있는 경우) */}
                  {content.platforms && content.platforms.length > 0 && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-dark-700">
                      {content.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-dark-700 rounded text-xs text-gray-400"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
