import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogIn, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../services/api'
import { sanitizeInput, validateEmail, sanitizeErrorMessage } from '../utils/security'

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // 입력 검증
    if (!username || username.length < 3) {
      setError('아이디는 3자 이상이어야 합니다')
      setLoading(false)
      return
    }

    if (!password || password.length < 8) {
      setError('비밀번호를 확인해주세요')
      setLoading(false)
      return
    }

    // 입력 Sanitization
    const sanitizedUsername = sanitizeInput(username)

    try {
      console.log('🔐 로그인 시도:', sanitizedUsername)
      
      const response = await api.post('/api/auth/login', {
        username: sanitizedUsername,
        password // 비밀번호는 서버에서 검증
      })

      console.log('📥 로그인 응답:', response.data)

      if (response.data.success) {
        const { user, token, message } = response.data
        
        // 상태 저장
        setUser(user)
        setToken(token)
        
        // 성공 메시지 표시
        setSuccess(message || '로그인 성공!')
        
        console.log('✅ 로그인 성공:', {
          userId: user.id,
          username: user.username,
          role: user.role,
          isAdmin: user.role === 'admin'
        })

        // 역할에 따라 리다이렉트
        setTimeout(() => {
          if (user.role === 'admin') {
            console.log('👑 관리자로 리다이렉트')
            navigate('/admin')
          } else {
            navigate('/')
          }
        }, 500)
      } else {
        setError(response.data.error || '로그인에 실패했습니다')
      }
    } catch (err: any) {
      console.error('❌ 로그인 오류:', err)
      
      const errorMessage = err.response?.data?.error || err.message || '로그인에 실패했습니다'
      setError(sanitizeErrorMessage(errorMessage))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-white">F</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Freeshell</h1>
          <p className="text-gray-400">올인원 콘텐츠 AI 플랫폼</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* 아이디 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="admin"
              />
              <p className="mt-1 text-xs text-gray-500">
                아이디 또는 이메일로 로그인 가능합니다
              </p>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  로그인
                </>
              )}
            </button>
          </form>

          {/* 추가 링크 */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400">
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                비밀번호를 잊으셨나요?
              </Link>
            </p>
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400">
                계정이 없으신가요?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 관리자 계정 안내 (개발 환경) */}
        {import.meta.env.DEV && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm">
            <p className="text-gray-400 mb-2">🔐 <strong>관리자 테스트 계정</strong></p>
            <p className="text-gray-500 font-mono">
              아이디: admin<br />
              비밀번호: Admin123!@#
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
