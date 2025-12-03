/**
 * 마이페이지
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Smartphone, Lock, Save, Shield, Calendar, Award } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import axios from 'axios'

export default function MyPage() {
  const navigate = useNavigate()
  const { user, token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile')

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    setProfile({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
    })
  }, [user, navigate])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.put(
        '/api/user/profile',
        profile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.success) {
        setSuccess('프로필이 업데이트되었습니다!')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '프로필 업데이트 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // 비밀번호 검증
    const checks = {
      length: passwordData.newPassword.length >= 11,
      lowercase: /[a-z]/.test(passwordData.newPassword),
      uppercase: /[A-Z]/.test(passwordData.newPassword),
      number: /[0-9]/.test(passwordData.newPassword),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword),
    }

    const allChecksPassed = Object.values(checks).every(Boolean)

    if (!allChecksPassed) {
      setError('비밀번호가 보안 요구사항을 충족하지 않습니다')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다')
      return
    }

    try {
      setLoading(true)
      const response = await axios.put(
        '/api/user/password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.success) {
        setSuccess('비밀번호가 변경되었습니다!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '비밀번호 변경 실패')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-3">마이페이지</h1>
        <p className="text-lg text-gray-300">회원 정보를 관리하세요</p>
      </div>

      {/* 사용자 정보 카드 */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.username}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user.isEmailVerified && (
              <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-xl">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">이메일 인증</span>
              </div>
            )}
            {user.isApproved && (
              <div className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-xl">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">승인 완료</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">가입일</p>
            <p className="text-white font-bold">
              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <Shield className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-sm text-gray-400">계정 상태</p>
            <p className="text-white font-bold">
              {user.isActive ? '활성' : '비활성'}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <Award className="w-5 h-5 text-pink-400 mb-2" />
            <p className="text-sm text-gray-400">등급</p>
            <p className="text-white font-bold">
              {user.role === 'admin' ? '관리자' : '일반 회원'}
            </p>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex space-x-2 mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          프로필 수정
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
            activeTab === 'password'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          비밀번호 변경
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          보안 설정
        </button>
      </div>

      {/* 알림 */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl">
          <p className="text-green-400 font-medium">{success}</p>
        </div>
      )}

      {/* 프로필 수정 */}
      {activeTab === 'profile' && (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">프로필 정보</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                사용자명
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                이메일은 변경할 수 없습니다
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                핸드폰 번호
              </label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white"
                  placeholder="010-1234-5678"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? '저장 중...' : '변경사항 저장'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 비밀번호 변경 */}
      {activeTab === 'password' && (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">비밀번호 변경</h3>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                현재 비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                새 비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white"
                  required
                />
              </div>
              {passwordData.newPassword && (
                <div className="mt-4">
                  <PasswordStrengthMeter password={passwordData.newPassword} />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              <Lock className="w-5 h-5" />
              <span>{loading ? '변경 중...' : '비밀번호 변경'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 보안 설정 */}
      {activeTab === 'security' && (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">보안 설정</h3>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold mb-1">이메일 인증</h4>
                  <p className="text-sm text-gray-400">
                    이메일 인증 상태를 확인하세요
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl font-bold ${
                    user.isEmailVerified
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {user.isEmailVerified ? '인증 완료' : '미인증'}
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold mb-1">SMS 인증</h4>
                  <p className="text-sm text-gray-400">
                    핸드폰 번호 인증 상태를 확인하세요
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl font-bold ${
                    user.isPhoneVerified
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {user.isPhoneVerified ? '인증 완료' : '미인증'}
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
              <p className="text-sm text-blue-400 font-medium mb-3">
                💡 보안 팁
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• 비밀번호는 정기적으로 변경하세요</li>
                <li>• 다른 사이트와 동일한 비밀번호를 사용하지 마세요</li>
                <li>• 이메일과 SMS 인증을 완료하세요</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

