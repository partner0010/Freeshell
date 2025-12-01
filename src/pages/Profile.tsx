import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { User, Mail, Lock, BarChart3, Save, LogOut } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface UserProfile {
  id: string
  email: string
  username: string
  createdAt: string
  _count?: {
    contents: number
  }
}

interface UserStats {
  totalContents: number
  totalUploads: number
  publishedContents: number
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 프로필 편집 상태
  const [editMode, setEditMode] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  // 비밀번호 변경 상태
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    loadProfile()
    loadStats()
  }, [token, navigate])

  const loadProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setProfile(response.data.user)
        setUsername(response.data.user.username)
        setEmail(response.data.user.email)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '프로필을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/user/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (err: any) {
      console.error('통계 로드 실패:', err)
    }
  }

  const handleSaveProfile = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await axios.put(
        '/api/user/profile',
        { username, email },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        setProfile(response.data.user)
        setEditMode(false)
        setSuccess('프로필이 업데이트되었습니다')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '프로필 업데이트에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다')
      return
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다')
      return
    }

    setSaving(true)

    try {
      const response = await axios.put(
        '/api/user/password',
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        setSuccess('비밀번호가 변경되었습니다')
        setShowPasswordChange(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '비밀번호 변경에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-dark-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <User className="w-6 h-6 mr-2" />
            프로필
          </h2>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              편집
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              사용자명
            </label>
            {editMode ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            ) : (
              <div className="text-white">{profile?.username}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              이메일
            </label>
            {editMode ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            ) : (
              <div className="text-white">{profile?.email}</div>
            )}
          </div>

          {editMode && (
            <div className="flex space-x-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false)
                  setUsername(profile?.username || '')
                  setEmail(profile?.email || '')
                  setError('')
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            통계
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm">총 콘텐츠</div>
              <div className="text-2xl font-bold text-white mt-2">{stats.totalContents}</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm">총 업로드</div>
              <div className="text-2xl font-bold text-white mt-2">{stats.totalUploads}</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm">게시된 콘텐츠</div>
              <div className="text-2xl font-bold text-white mt-2">{stats.publishedContents}</div>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 */}
      <div className="bg-dark-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            비밀번호 변경
          </h3>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {showPasswordChange ? '취소' : '변경'}
          </button>
        </div>

        {showPasswordChange && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                현재 비밀번호
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="최소 8자 이상"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        )}
      </div>

      {/* 로그아웃 */}
      <div className="bg-dark-800 rounded-lg p-6">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          <LogOut className="w-5 h-5 mr-2" />
          로그아웃
        </button>
      </div>
    </div>
  )
}

