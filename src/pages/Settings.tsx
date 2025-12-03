import { useState } from 'react'
import { useContentStore } from '../store/contentStore'
import { useAuthStore } from '../store/authStore'
import { PlatformConfig } from '../types'
import { 
  Settings as SettingsIcon, Plus, Trash2, Youtube, 
  Instagram, User, Lock, Bell, Sparkles, Shield,
  Globe, Zap
} from 'lucide-react'

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { value: 'tiktok', label: 'TikTok', icon: Youtube, color: 'text-black' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
]

export default function Settings() {
  const { platformConfigs, addPlatformConfig } = useContentStore()
  const { user } = useAuthStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState('account')
  const [newConfig, setNewConfig] = useState<Partial<PlatformConfig>>({
    platform: 'youtube',
    credentials: {},
    autoUpload: false,
  })

  const handleAddPlatform = () => {
    if (newConfig.platform) {
      addPlatformConfig(newConfig as PlatformConfig)
      setNewConfig({
        platform: 'youtube',
        credentials: {},
        autoUpload: false,
      })
      setShowAddForm(false)
    }
  }

  const tabs = [
    { id: 'account', name: '계정 정보', icon: User },
    { id: 'platforms', name: '플랫폼 연동', icon: Globe },
    { id: 'preferences', name: '사용 환경', icon: SettingsIcon },
    { id: 'security', name: '보안', icon: Shield },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-500/20 to-slate-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
            <SettingsIcon className="w-6 h-6 text-gray-400" />
            <span className="text-lg font-bold text-white">내 설정</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white">
            설정
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            계정 및 플랫폼 설정을 관리하세요
          </p>
        </div>

        {/* 탭 */}
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold text-base whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
          {activeTab === 'account' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white mb-6">계정 정보</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-white mb-3">
                    사용자명
                  </label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold text-white mb-3">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xl font-black text-white mb-4">사용 현황</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-white mb-2">0</div>
                    <div className="text-base text-gray-300">오늘 생성</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-white mb-2">0</div>
                    <div className="text-base text-gray-300">이번 달</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-white mb-2">무제한</div>
                    <div className="text-base text-gray-300">남은 횟수</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'platforms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">플랫폼 연동</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>플랫폼 추가</span>
                </button>
              </div>

              {showAddForm && (
                <div className="bg-white/10 rounded-2xl p-8 mb-6 space-y-6">
                  <div>
                    <label className="block text-lg font-bold text-white mb-4">
                      플랫폼 선택
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {PLATFORMS.map((platform) => {
                        const Icon = platform.icon
                        return (
                          <button
                            key={platform.value}
                            onClick={() => setNewConfig({ ...newConfig, platform: platform.value as any })}
                            className={`flex flex-col items-center space-y-3 px-6 py-5 rounded-2xl border-2 transition-all ${
                              newConfig.platform === platform.value
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-white/10 bg-white/5 hover:border-white/30'
                            }`}
                          >
                            <Icon className={`w-8 h-8 ${platform.color}`} />
                            <span className="text-base font-bold text-white">{platform.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-white mb-3">
                      계정 정보
                    </label>
                    <input
                      type="text"
                      placeholder="이메일 또는 사용자명"
                      className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                    <input
                      type="checkbox"
                      id="autoUpload"
                      checked={newConfig.autoUpload}
                      onChange={(e) => setNewConfig({ ...newConfig, autoUpload: e.target.checked })}
                      className="w-6 h-6 rounded accent-blue-500"
                    />
                    <label htmlFor="autoUpload" className="text-base font-medium text-white">
                      자동 업로드 활성화
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      onClick={handleAddPlatform} 
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all"
                    >
                      추가하기
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-lg transition-all"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 등록된 플랫폼 */}
              <div className="space-y-4">
                {platformConfigs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-lg">
                    등록된 플랫폼이 없습니다
                  </div>
                ) : (
                  platformConfigs.map((config, index) => {
                    const platform = PLATFORMS.find((p) => p.value === config.platform)
                    const Icon = platform?.icon || SettingsIcon
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Icon className={`w-8 h-8 ${platform?.color || 'text-gray-400'}`} />
                          <div>
                            <h3 className="text-lg font-black text-white">{platform?.label}</h3>
                            <p className="text-base text-gray-300">
                              {config.credentials.email || config.credentials.username}
                              {config.autoUpload && (
                                <span className="ml-2 text-blue-400">• 자동 업로드</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors">
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white mb-6">사용 환경 설정</h2>
              
              <div>
                <label className="block text-lg font-bold text-white mb-4">
                  콘텐츠 생성 개수 (한 번에)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="flex-1 h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-2xl font-black text-blue-400 w-16 text-center">5개</span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-4">
                  기본 콘텐츠 길이
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="15"
                    max="180"
                    defaultValue="60"
                    className="flex-1 h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-2xl font-black text-blue-400 w-24 text-center">60초</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xl font-black text-white mb-4">알림 설정</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" defaultChecked className="w-6 h-6 rounded accent-blue-500" />
                    <div>
                      <div className="text-lg font-bold text-white">이메일 알림</div>
                      <div className="text-sm text-gray-400">콘텐츠 생성 완료 시 이메일로 알림</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" defaultChecked className="w-6 h-6 rounded accent-blue-500" />
                    <div>
                      <div className="text-lg font-bold text-white">수익 알림</div>
                      <div className="text-sm text-gray-400">수익 발생 시 알림 받기</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white mb-6">보안 설정</h2>
              
              <div>
                <label className="block text-lg font-bold text-white mb-4">
                  비밀번호 변경
                </label>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="현재 비밀번호"
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호"
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all">
                    비밀번호 변경
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xl font-black text-white mb-4">계정 관리</h3>
                <button className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl font-bold transition-colors">
                  회원 탈퇴
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
