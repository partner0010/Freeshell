import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogIn, Mail, Lock, User } from 'lucide-react'
import axios from 'axios'
import { sanitizeInput, validateEmail, sanitizeErrorMessage } from '../utils/security'

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 입력 검증
    if (!validateEmail(email)) {
      setError('유효한 이메일 주소를 입력해주세요')
      setLoading(false)
      return
    }

    // 입력 Sanitization
    const sanitizedEmail = sanitizeInput(email)

    try {
      const response = await axios.post('/api/auth/login', {
        email: sanitizedEmail,
        password // 비밀번호는 서버에서 검증
      })

      if (response.data.success) {
        setUser(response.data.user)
        setToken(response.data.token)
        navigate('/')
      } else {
        setError(response.data.error || '로그인에 실패했습니다')
      }
    } catch (err: any) {
      setError(sanitizeErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">올인원 콘텐츠 AI</h1>
          <p className="text-gray-400">로그인하여 시작하세요</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                '로그인 중...'
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  로그인
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              계정이 없으신가요?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

