/**
 * 비밀번호 찾기
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import axios from 'axios'

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'sent'>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      
      if (response.data.success) {
        setStep('sent')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '비밀번호 재설정 이메일 발송 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            비밀번호 찾기
          </h1>
          <p className="text-lg text-gray-300">
            가입 시 사용한 이메일을 입력하세요
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          {step === 'email' ? (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl">
                  <p className="text-red-400 text-center font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    이메일 주소
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? '발송 중...' : '재설정 이메일 발송'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                이메일이 발송되었습니다!
              </h2>
              <p className="text-gray-300 mb-8">
                {email}로 비밀번호 재설정 링크를 보내드렸습니다.<br />
                이메일을 확인해주세요.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                <p className="text-sm text-blue-400 font-medium mb-3">
                  💡 이메일이 보이지 않나요?
                </p>
                <ul className="text-sm text-gray-300 space-y-2 text-left">
                  <li>• 스팸 메일함을 확인하세요</li>
                  <li>• 이메일 설정이 없으면 백엔드 콘솔을 확인하세요</li>
                  <li>• 링크는 1시간 동안 유효합니다</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>로그인으로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

