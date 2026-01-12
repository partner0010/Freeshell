/**
 * API 연동 관리 페이지 (세심한 설정)
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Link, 
  Save, 
  TestTube,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedButton from '@/components/EnhancedButton';
import EnhancedCard from '@/components/EnhancedCard';
import PageHeader from '@/components/PageHeader';
import ScrollAnimation from '@/components/ScrollAnimation';

interface APIConfig {
  id: string;
  name: string;
  type: 'oauth' | 'api_key' | 'webhook' | 'custom';
  endpoint?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
  headers?: Record<string, string>;
  enabled: boolean;
  lastTested?: Date;
  status?: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

const apiTemplates = [
  {
    name: 'Google OAuth',
    type: 'oauth' as const,
    endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['openid', 'email', 'profile'],
  },
  {
    name: 'GitHub OAuth',
    type: 'oauth' as const,
    endpoint: 'https://github.com/login/oauth/authorize',
    scopes: ['user:email'],
  },
  {
    name: 'Facebook Login',
    type: 'oauth' as const,
    endpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['email', 'public_profile'],
  },
  {
    name: 'Twitter OAuth',
    type: 'oauth' as const,
    endpoint: 'https://twitter.com/i/oauth2/authorize',
    scopes: ['tweet.read', 'users.read'],
  },
  {
    name: 'Instagram Basic Display',
    type: 'oauth' as const,
    endpoint: 'https://api.instagram.com/oauth/authorize',
    scopes: ['user_profile', 'user_media'],
  },
  {
    name: 'LinkedIn OAuth',
    type: 'oauth' as const,
    endpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: ['r_liteprofile', 'r_emailaddress'],
  },
];

export default function APIIntegrationPage() {
  const [configs, setConfigs] = useState<APIConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<APIConfig | null>(null);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/admin/api-integration');
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (config: APIConfig) => {
    try {
      const response = await fetch('/api/admin/api-integration', {
        method: config.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        await loadConfigs();
        setShowAddModal(false);
        setEditingConfig(null);
      }
    } catch (error) {
      console.error('저장 실패:', error);
    }
  };

  const handleTest = async (configId: string) => {
    try {
      const response = await fetch(`/api/admin/api-integration/${configId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        await loadConfigs();
        alert(data.success ? '연결 테스트 성공!' : `연결 테스트 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('테스트 실패:', error);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/api-integration/${configId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadConfigs();
      }
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const toggleSecret = (configId: string) => {
    setShowSecrets(prev => {
      const next = new Set(prev);
      if (next.has(configId)) {
        next.delete(configId);
      } else {
        next.add(configId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <PageHeader
        title="API 연동 관리"
        description="외부 서비스 API를 세심하게 설정하고 관리하세요"
        icon={Link}
        action={
          <EnhancedButton
            variant="gradient"
            onClick={() => {
              setEditingConfig(null);
              setShowAddModal(true);
            }}
            icon={Plus}
          >
            새 연동 추가
          </EnhancedButton>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : configs.length === 0 ? (
          <ScrollAnimation direction="up">
            <EnhancedCard>
              <div className="text-center py-12">
                <Link className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">연동된 API가 없습니다</p>
                <EnhancedButton
                  variant="gradient"
                  onClick={() => setShowAddModal(true)}
                  icon={Plus}
                >
                  첫 연동 추가하기
                </EnhancedButton>
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configs.map((config, index) => (
              <ScrollAnimation key={config.id} direction="up" delay={index * 50}>
                <EnhancedCard hover>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">{config.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : config.status === 'error' ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : null}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => handleSave({ ...config, enabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-xs text-gray-500">타입</span>
                        <p className="text-sm font-medium text-gray-900 capitalize">{config.type}</p>
                      </div>
                      {config.endpoint && (
                        <div>
                          <span className="text-xs text-gray-500">엔드포인트</span>
                          <p className="text-sm font-mono text-gray-700 truncate">{config.endpoint}</p>
                        </div>
                      )}
                      {config.apiKey && (
                        <div>
                          <span className="text-xs text-gray-500">API 키</span>
                          <div className="flex items-center gap-2">
                            <input
                              type={showSecrets.has(config.id) ? 'text' : 'password'}
                              value={config.apiKey}
                              readOnly
                              className="flex-1 px-2 py-1 text-sm font-mono bg-gray-50 border border-gray-200 rounded"
                            />
                            <button
                              onClick={() => toggleSecret(config.id)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {showSecrets.has(config.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {config.lastTested && (
                        <div>
                          <span className="text-xs text-gray-500">마지막 테스트</span>
                          <p className="text-sm text-gray-700">
                            {new Date(config.lastTested).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingConfig(config);
                          setShowAddModal(true);
                        }}
                        fullWidth
                      >
                        수정
                      </EnhancedButton>
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(config.id)}
                        icon={TestTube}
                      >
                        테스트
                      </EnhancedButton>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </EnhancedCard>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>

      {/* 추가/수정 모달 */}
      {showAddModal && (
        <APIConfigModal
          config={editingConfig}
          templates={apiTemplates}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingConfig(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

function APIConfigModal({
  config,
  templates,
  onSave,
  onClose,
}: {
  config: APIConfig | null;
  templates: typeof apiTemplates;
  onSave: (config: APIConfig) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<APIConfig>>(
    config || {
      name: '',
      type: 'api_key',
      enabled: true,
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <EnhancedCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {config ? 'API 설정 수정' : '새 API 연동 추가'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="예: Google OAuth"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                타입
              </label>
              <select
                value={formData.type || 'api_key'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="api_key">API Key</option>
                <option value="oauth">OAuth 2.0</option>
                <option value="webhook">Webhook</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {formData.type === 'oauth' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    엔드포인트
                  </label>
                  <input
                    type="url"
                    value={formData.endpoint || ''}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="https://example.com/oauth/authorize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={formData.clientId || ''}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={formData.clientSecret || ''}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redirect URI
                  </label>
                  <input
                    type="url"
                    value={formData.redirectUri || ''}
                    onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="https://yoursite.com/callback"
                  />
                </div>
              </>
            )}

            {formData.type === 'api_key' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey || ''}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <EnhancedButton
                variant="gradient"
                onClick={() => onSave(formData as APIConfig)}
                icon={Save}
                fullWidth
              >
                저장
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                onClick={onClose}
                fullWidth
              >
                취소
              </EnhancedButton>
            </div>
          </div>
        </div>
      </EnhancedCard>
    </div>
  );
}
