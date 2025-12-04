/**
 * 회원가입 (Google OTP 필수)
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, User, Lock, Eye, EyeOff, Smartphone } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function RegisterWithOTP() {
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1) // 1: 정보입력, 2: OTP 등록
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [otpSecret, setOtpSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [otpToken, setOtpToken] = useState('')
  
  const [loading, setLoading] = useState(false)

  /**
   * 1단계: 정보 입력 & OTP 생성
   */
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다')
      return
    }

    if (password.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다')
      return
    }

    setLoading(true)

    try {
      // OTP Secret 생성
      const otpResponse = await api.post('/api/otp/generate', { username })
      
      setOtpSecret(otpResponse.data.secret)
      setQrCode(otpResponse.data.qrCode)
      setBackupCodes(otpResponse.data.backupCodes)
      
      toast.success('Google Authenticator로 QR 코드를 스캔하세요!')
      setStep(2)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'OTP 생성 실패')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 2단계: OTP 검증 & 회원가입 완료
   */
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otpToken.length !== 6) {
      toast.error('6자리 OTP 코드를 입력하세요')
      return
    }

    setLoading(true)

    try {
      // OTP 검증
      await api.post('/api/otp/verify', {
        secret: otpSecret,
        token: otpToken
      })

      // 회원가입
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password,
        otpSecret // OTP Secret 저장
      })

      toast.success('회원가입 완료! 관리자 승인 후 로그인하세요')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.response?.data?.error || '회원가입 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 1 ? '회원가입' : 'Google OTP 등록'}
            </h1>
            <p className="text-gray-400">
              {step === 1 ? '정보를 입력하세요' : 'Authenticator로 QR 스캔'}
            </p>
          </div>

          {/* 단계 표시 */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                1
              </div>
              <span className="ml-2 text-sm">정보입력</span>
            </div>
            <div className="w-16 h-0.5 mx-4 bg-gray-700"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'} flex items-center justify-center text-white font-bold`}>
                2
              </div>
              <span className="ml-2 text-sm">OTP등록</span>
            </div>
          </div>

          {/* 1단계: 정보 입력 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  아이디
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일 (선택사항)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {loading ? '처리 중...' : '다음 단계 (OTP 등록)'}
              </button>
            </form>
          )}

          {/* 2단계: OTP 등록 */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-6">
              {/* QR 코드 */}
              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  Google Authenticator 앱으로<br />
                  아래 QR 코드를 스캔하세요
                </p>
                
                {qrCode && (
                  <div className="bg-white p-4 rounded-2xl inline-block mb-4">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-2">또는 수동 입력:</p>
                <code className="text-sm bg-gray-800 px-4 py-2 rounded-lg text-yellow-400">
                  {otpSecret}
                </code>
              </div>

              {/* OTP 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                  <Smartphone className="inline w-4 h-4 mr-2" />
                  Google Authenticator에서 6자리 코드 입력
                </label>
                <input
                  type="text"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white text-center text-3xl tracking-widest font-mono"
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>

              {/* 백업 코드 */}
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                <p className="text-yellow-400 font-bold mb-2">⚠️ 백업 코드 (안전하게 보관!)</p>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="bg-gray-800 px-3 py-1 rounded text-yellow-300">
                      {code}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  OTP를 분실했을 때 이 코드로 복구할 수 있습니다
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-bold"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={loading || otpToken.length !== 6}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl font-bold hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? '검증 중...' : '회원가입 완료'}
                </button>
              </div>
            </form>
          )}

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <span className="text-gray-400">이미 계정이 있으신가요? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              로그인
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

