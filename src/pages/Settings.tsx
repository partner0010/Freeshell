import { useState } from 'react'
import { useContentStore } from '../store/contentStore'
import { PlatformConfig } from '../types'
import { Youtube, Instagram, Settings as SettingsIcon, Plus, Trash2 } from 'lucide-react'

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { value: 'tiktok', label: 'TikTok', icon: Youtube, color: 'text-black' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
]

export default function Settings() {
  const { platformConfigs, addPlatformConfig } = useContentStore()
  const [showAddForm, setShowAddForm] = useState(false)
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">설정</h1>
          <p className="text-gray-400 mt-2">
            플랫폼 연동 및 자동 업로드 설정을 관리하세요
          </p>
        </div>
      </div>

      {/* 플랫폼 설정 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6" />
            <span>플랫폼 연동</span>
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>플랫폼 추가</span>
          </button>
        </div>

        {/* 추가 폼 */}
        {showAddForm && (
          <div className="bg-dark-700 rounded-lg p-6 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                플랫폼 선택
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() =>
                        setNewConfig({ ...newConfig, platform: platform.value as any })
                      }
                      className={`flex flex-col items-center space-y-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        newConfig.platform === platform.value
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-dark-600 bg-dark-800'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${platform.color}`} />
                      <span className="text-sm text-gray-300">{platform.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                이메일/사용자명
              </label>
              <input
                type="text"
                value={newConfig.credentials?.email || newConfig.credentials?.username || ''}
                onChange={(e) =>
                  setNewConfig({
                    ...newConfig,
                    credentials: {
                      ...newConfig.credentials,
                      email: e.target.value,
                      username: e.target.value,
                    },
                  })
                }
                className="input-field"
                placeholder="이메일 또는 사용자명"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={newConfig.credentials?.password || ''}
                onChange={(e) =>
                  setNewConfig({
                    ...newConfig,
                    credentials: {
                      ...newConfig.credentials,
                      password: e.target.value,
                    },
                  })
                }
                className="input-field"
                placeholder="비밀번호"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoUpload"
                checked={newConfig.autoUpload}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, autoUpload: e.target.checked })
                }
                className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="autoUpload" className="text-sm text-gray-300">
                자동 업로드 활성화
              </label>
            </div>

            <div className="flex space-x-3">
              <button onClick={handleAddPlatform} className="btn-primary flex-1">
                추가하기
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 등록된 플랫폼 목록 */}
        <div className="space-y-4">
          {platformConfigs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              등록된 플랫폼이 없습니다. 플랫폼을 추가해주세요.
            </div>
          ) : (
            platformConfigs.map((config, index) => {
              const platform = PLATFORMS.find((p) => p.value === config.platform)
              const Icon = platform?.icon || SettingsIcon
              return (
                <div
                  key={index}
                  className="bg-dark-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <Icon className={`w-8 h-8 ${platform?.color || 'text-gray-400'}`} />
                    <div>
                      <h3 className="text-white font-semibold">{platform?.label}</h3>
                      <p className="text-sm text-gray-400">
                        {config.credentials.email || config.credentials.username}
                        {config.autoUpload && (
                          <span className="ml-2 text-primary-500">• 자동 업로드</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* AI 설정 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">AI 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              생성 버전 수
            </label>
            <input
              type="number"
              min="1"
              max="10"
              defaultValue="5"
              className="input-field w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              기본 콘텐츠 길이 (초)
            </label>
            <input
              type="number"
              min="15"
              max="300"
              defaultValue="60"
              className="input-field w-32"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

