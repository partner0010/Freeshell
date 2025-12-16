'use client';

import React, { useState } from 'react';
import { Shield, Plus, Key, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { ssoManager, type SSOConfig, type SSOProvider } from '@/lib/auth/sso-manager';
import { useToast } from '@/components/ui/Toast';

export function SSOPanel() {
  const [configs, setConfigs] = useState<SSOConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SSOConfig | null>(null);
  const [configName, setConfigName] = useState('');
  const [provider, setProvider] = useState<SSOProvider>('saml');
  const { showToast } = useToast();

  React.useEffect(() => {
    setConfigs(ssoManager.getAllConfigs());
  }, []);

  const providerOptions = [
    { value: 'saml', label: 'SAML 2.0' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'oidc', label: 'OpenID Connect' },
    { value: 'ldap', label: 'LDAP' },
    { value: 'azure-ad', label: 'Azure AD' },
    { value: 'google-workspace', label: 'Google Workspace' },
  ];

  const handleCreateConfig = () => {
    if (!configName.trim()) {
      showToast('warning', '구성 이름을 입력해주세요');
      return;
    }

    const config = ssoManager.createConfig(configName, provider);
    setConfigs([...configs, config]);
    setSelectedConfig(config);
    setConfigName('');
    showToast('success', 'SSO 구성이 생성되었습니다');
  };

  const handleToggleSSO = (id: string, enabled: boolean) => {
    ssoManager.toggleSSO(id, enabled);
    setConfigs(ssoManager.getAllConfigs());
    if (selectedConfig?.id === id) {
      setSelectedConfig(ssoManager.getConfig(id) || null);
    }
    showToast('success', enabled ? 'SSO가 활성화되었습니다' : 'SSO가 비활성화되었습니다');
  };

  const handleTestSSO = async (provider: SSOProvider) => {
    try {
      const result = await ssoManager.login(provider);
      if (result.success) {
        showToast('success', 'SSO 로그인 성공');
      }
    } catch (error) {
      showToast('error', 'SSO 로그인 실패');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">SSO (Single Sign-On)</h2>
            <p className="text-sm text-gray-500">통합 인증 설정 및 관리</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* SSO 구성 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 SSO 구성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="구성 이름 (예: 회사 SSO)"
              />
              <Dropdown
                options={providerOptions}
                value={provider}
                onChange={(val) => setProvider(val as SSOProvider)}
                placeholder="인증 제공자"
              />
              <Button variant="primary" onClick={handleCreateConfig} className="w-full">
                <Plus size={18} className="mr-2" />
                구성 생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SSO 구성 목록 */}
        {configs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>SSO 구성 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedConfig?.id === config.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedConfig(config)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800">{config.name}</h4>
                            <Badge variant="outline">{config.provider}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            생성일: {new Date(config.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.enabled ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : (
                          <XCircle className="text-gray-400" size={20} />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSSO(config.id, !config.enabled);
                          }}
                        >
                          {config.enabled ? '비활성화' : '활성화'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestSSO(config.provider);
                          }}
                        >
                          테스트
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 구성 상세 */}
        {selectedConfig && (
          <Card>
            <CardHeader>
              <CardTitle>구성 상세: {selectedConfig.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">제공자</label>
                  <Badge variant="outline" className="mt-1">{selectedConfig.provider}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">상태</label>
                  <div className="mt-1">
                    {selectedConfig.enabled ? (
                      <Badge variant="success">활성화됨</Badge>
                    ) : (
                      <Badge variant="outline">비활성화됨</Badge>
                    )}
                  </div>
                </div>
                {selectedConfig.provider === 'saml' && (
                  <div className="space-y-3">
                    <Input placeholder="Entity ID" />
                    <Input placeholder="SSO URL" />
                    <textarea
                      placeholder="Certificate (PEM)"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                )}
                {(selectedConfig.provider === 'oauth2' || selectedConfig.provider === 'oidc') && (
                  <div className="space-y-3">
                    <Input placeholder="Client ID" />
                    <Input placeholder="Client Secret" type="password" />
                    <Input placeholder="Redirect URI" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

