import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, Eye, Settings, Video, BookOpen, FileText, TrendingUp, Zap, User, Calendar, FileText as TemplateIcon, Globe } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()

  const navItems = [
    { path: '/', icon: Home, label: '홈' },
    { path: '/auto', icon: Zap, label: '원클릭 자동화', highlight: true },
    { path: '/global', icon: Globe, label: '전세계 수익화', highlight: true },
    { path: '/create', icon: Plus, label: '콘텐츠 생성' },
    { path: '/templates', icon: TemplateIcon, label: '템플릿' },
    { path: '/schedules', icon: Calendar, label: '스케줄' },
    { path: '/ebook', icon: BookOpen, label: 'E-book' },
    { path: '/blog', icon: FileText, label: '블로그' },
    { path: '/revenue', icon: TrendingUp, label: '수익' },
    { path: '/settings', icon: Settings, label: '설정' },
  ]

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Video className="w-8 h-8 text-primary-500" />
              <h1 className="text-xl font-bold text-white">올인원 콘텐츠 AI</h1>
            </div>
            {isAuthenticated && user && (
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>{user.username}</span>
              </Link>
            )}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? item.highlight ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-primary-600 text-white'
                        : item.highlight ? 'text-blue-400 hover:text-blue-300 hover:bg-dark-700' : 'text-gray-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-3 px-4 ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

