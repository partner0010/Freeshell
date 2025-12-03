import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Send, CheckCircle, Smartphone } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import axios from 'axios'

export default function Register() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register) || (async () => {})
  const [step, setStep] = useState(1) // 1: 이메일 인증, 2: 정보 입력, 3: SMS 인증
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    emailCode: '',
    smsCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)

  const handleSendEmail = async () => {
    if (!formData.email) {
      setError('이메일을 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setError('')
      await axios.post('/api/verification/send-email', {
        email: formData.email,
      })
      setEmailSent(true)
      alert('인증 이메일이 발송되었습니다! 이메일을 확인해주세요.')
    } catch (error: any) {
      setError(error.response?.data?.error || '이메일 발송 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleSendSMS = async () => {
    if (!formData.phone) {
      setError('핸드폰 번호를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setError('')
      await axios.post('/api/verification/send-sms', {
        phone: formData.phone,
      })
      setSmsSent(true)
      alert('SMS 인증 코드가 발송되었습니다!')
    } catch (error: any) {
      setError(error.response?.data?.error || 'SMS 발송 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 비밀번호 보안 검증
    const checks = {
      length: formData.password.length >= 11,
      lowercase: /[a-z]/.test(formData.password),
      uppercase: /[A-Z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    }

    const allChecksPassed = Object.values(checks).every(Boolean)

    if (!allChecksPassed) {
      setError('비밀번호가 보안 요구사항을 충족하지 않습니다')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    try {
      setLoading(true)
      await register(formData.username, formData.email, formData.password)
      alert('회원가입이 완료되었습니다! 관리자 승인 후 사용하실 수 있습니다.')
      navigate('/login')
    } catch (error: any) {
      setError(error.response?.data?.error || '회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            회원가입
          </h1>
          <p className="text-lg text-gray-300">
            FreeShell과 함께 시작하세요
          </p>

          {/* 진행 단계 */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500' : 'bg-gray-700'}`}>
                1
              </div>
              <span className="text-sm font-medium">이메일 인증</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-700"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`}>
                2
              </div>
              <span className="text-sm font-medium">정보 입력</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-700"></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500' : 'bg-gray-700'}`}>
                3
              </div>
              <span className="text-sm font-medium">완료</span>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl">
              <p className="text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1단계: 이메일 인증 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    이메일 주소 *
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      disabled={loading || !formData.email}
                      className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold whitespace-nowrap disabled:opacity-50 transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  {emailSent && (
                    <p className="mt-2 text-sm text-green-400 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>이메일이 발송되었습니다! 받은편지함을 확인하세요.</span>
                    </p>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                  <p className="text-sm text-blue-400 font-medium mb-3">
                    💡 이메일을 확인할 수 없나요?
                  </p>
                  <p className="text-sm text-gray-300">
                    이메일 설정이 안되어 있으면 콘솔(백엔드 창)에 인증 링크가 표시됩니다.
                    또는 "다음 단계"를 눌러 진행하세요.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg transition-all"
                >
                  다음 단계
                </button>
              </div>
            )}

            {/* 2단계: 정보 입력 */}
            {step === 2 && (
              <div className="space-y-6">
                {/* 사용자명 */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    사용자명 *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="사용자명을 입력하세요"
                      required
                    />
                  </div>
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    비밀번호 *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="비밀번호 (11자 이상, 대소문자+숫자+특수문자)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* 비밀번호 강도 측정 */}
                  {formData.password && (
                    <div className="mt-4">
                      <PasswordStrengthMeter password={formData.password} />
                    </div>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    비밀번호 확인 *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="비밀번호를 다시 입력하세요"
                      required
                    />
                  </div>
                </div>

                {/* 핸드폰 (선택) */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    핸드폰 번호 (선택사항)
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="010-1234-5678"
                      />
                    </div>
                    {formData.phone && (
                      <button
                        type="button"
                        onClick={handleSendSMS}
                        disabled={loading}
                        className="px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold whitespace-nowrap disabled:opacity-50 transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {smsSent && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={formData.smsCode}
                        onChange={(e) => setFormData({ ...formData, smsCode: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        placeholder="인증 코드 6자리 입력"
                        maxLength={6}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all"
                  >
                    이전
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl"
                  >
                    {loading ? '가입 중...' : '회원가입 완료'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* 로그인 링크 */}
          <div className="mt-8 text-center">
            <p className="text-gray-300">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <p className="text-sm text-yellow-400 font-semibold mb-2">
            📌 회원가입 절차
          </p>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>1️⃣ 이메일 인증 (선택사항)</li>
            <li>2️⃣ 회원 정보 입력</li>
            <li>3️⃣ SMS 인증 (선택사항)</li>
            <li>4️⃣ 관리자 승인 대기</li>
            <li>5️⃣ 승인 완료 후 서비스 이용</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
