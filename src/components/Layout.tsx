import { Link, useLocation } from 'react-router-dom'
import { 
  Home, Plus, Settings, Video, BookOpen, FileText, TrendingUp, 
  Zap, User, Calendar, FileText as TemplateIcon, Globe, MessageSquare, Cpu, Sparkles
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'
import AIChatWindow from './AIChatWindow'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const [showAIChat, setShowAIChat] = useState(false)

  const navItems = [
    { path: '/', icon: Home, label: '홈', publicAccess: true },
    { path: '/auto-creation', icon: Sparkles, label: '🎬 자동 창작', highlight: true, new: true },
    { path: '/remote-support', icon: Cpu, label: '🔧 원격 지원', highlight: true, new: true },
    { path: '/advanced-ai', icon: Cpu, label: '🚀 AI 스튜디오', highlight: true },
    { path: '/auto', icon: Zap, label: '마법처럼', highlight: true },
    { path: '/global', icon: Globe, label: '글로벌 진출', highlight: true },
    { path: '/create', icon: Plus, label: '창작하기' },
    { path: '/templates', icon: TemplateIcon, label: '프로 템플릿' },
    { path: '/schedules', icon: Calendar, label: '스마트 예약' },
    { path: '/ebook', icon: BookOpen, label: '킨들 출판' },
    { path: '/blog', icon: FileText, label: '블로그 자동화' },
    { path: '/revenue', icon: TrendingUp, label: '수익 분석' },
    { path: '/admin', icon: User, label: '마스터 컨트롤', adminOnly: true },
    { path: '/settings', icon: Settings, label: '내 설정' },
  ]

  const handleNavClick = (e: React.MouseEvent, path: string, publicAccess?: boolean) => {
    if (!isAuthenticated && !publicAccess) {
      e.preventDefault()
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* 현대적인 헤더 */}
      <header className="bg-black/20 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* 로고 - 크고 화려하게 */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl">
                  <Video className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FreeShell
                </h1>
                <p className="text-xs text-gray-400 font-medium">무엇이든 가능합니다</p>
              </div>
            </Link>

            {/* AI 대화 버튼 - 메인 상단에 큰 버튼 */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = '/login'
                  return
                }
                setShowAIChat(true)
              }}
              className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-base">대화하기</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-lg text-xs font-black">⚡</span>
            </button>

            {/* 마이페이지 & 로그아웃 */}
            {isAuthenticated && user && (
              <>
              <Link
                to="/mypage"
                className="flex items-center space-x-3 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                  {user.username}
                </span>
              </Link>
              <button
                onClick={() => logout()}
                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-all"
              >
                로그아웃
              </button>
              </>
            )}
          </div>

          {/* 네비게이션 - 큰 글씨, 여유로운 간격 */}
          <nav className="hidden lg:flex items-center space-x-2 pb-4 overflow-x-auto">
            {navItems.filter(item => !item.adminOnly || (user?.role === 'admin')).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center space-x-2.5 px-5 py-3 rounded-xl font-medium text-base transition-all duration-200 ${
                    isActive
                      ? item.highlight 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                        : item.adminOnly
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white border border-white/20 shadow-md'
                      : item.highlight 
                        ? 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300' 
                        : item.adminOnly
                        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`${isActive ? 'w-5 h-5' : 'w-5 h-5'} transition-transform group-hover:scale-110`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Mobile Navigation - 현대적으로 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-2xl border-t border-white/10 z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* AI 대화창 */}
      <AIChatWindow isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </div>
  )
}
