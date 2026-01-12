/**
 * 관리자 설정 페이지
 * SNS API, 광고/배너/팝업 관리
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Facebook,
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Image,
  MessageSquare,
  Bell,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedButton from '@/components/EnhancedButton';
import EnhancedInput from '@/components/EnhancedInput';
import EnhancedCard from '@/components/EnhancedCard';
import ScrollAnimation from '@/components/ScrollAnimation';
import PageHeader from '@/components/PageHeader';

interface SNSConfig {
  provider: string;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface AdConfig {
  type: 'banner' | 'popup';
  enabled: boolean;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  position?: string;
  frequency?: 'always' | 'once' | 'daily';
}

export default function AdminSettingsPage() {
  const [snsConfigs, setSnsConfigs] = useState<SNSConfig[]>([]);
  const [adConfigs, setAdConfigs] = useState<AdConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSnsConfigs(data.snsConfigs || getDefaultSNSConfigs());
        setAdConfigs(data.adConfigs || getDefaultAdConfigs());
      } else {
        // 기본값 로드
        setSnsConfigs(getDefaultSNSConfigs());
        setAdConfigs(getDefaultAdConfigs());
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
      setSnsConfigs(getDefaultSNSConfigs());
      setAdConfigs(getDefaultAdConfigs());
    }
  };

  const getDefaultSNSConfigs = (): SNSConfig[] => [
    {
      provider: 'google',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback/google`,
      scopes: ['openid', 'profile', 'email'],
    },
    {
      provider: 'facebook',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback/facebook`,
      scopes: ['email', 'public_profile'],
    },
    {
      provider: 'github',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback/github`,
      scopes: ['user:email'],
    },
    {
      provider: 'twitter',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback/twitter`,
      scopes: ['tweet.read', 'users.read'],
    },
    {
      provider: 'instagram',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback/instagram`,
      scopes: ['user_profile', 'user_media'],
    },
    {
      provider: 'linkedin',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback/linkedin`,
      scopes: ['openid', 'profile', 'email'],
    },
  ];

  const getDefaultAdConfigs = (): AdConfig[] => [
    {
      type: 'banner',
      enabled: false,
      title: '상단 배너',
      content: '배너 내용을 입력하세요',
      imageUrl: '',
      linkUrl: '',
      position: 'top',
      frequency: 'always',
    },
    {
      type: 'banner',
      enabled: false,
      title: '하단 배너',
      content: '배너 내용을 입력하세요',
      imageUrl: '',
      linkUrl: '',
      position: 'bottom',
      frequency: 'always',
    },
    {
      type: 'popup',
      enabled: false,
      title: '팝업 알림',
      content: '팝업 내용을 입력하세요',
      imageUrl: '',
      linkUrl: '',
      frequency: 'once',
    },
  ];

  const getSNSIcon = (provider: string) => {
    switch (provider) {
      case 'google': return Globe; // Google 아이콘이 없으므로 Globe로 대체
      case 'facebook': return Facebook;
      case 'github': return Github;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      default: return Settings;
    }
  };

  const getSNSName = (provider: string) => {
    const names: { [key: string]: string } = {
      google: 'Google',
      facebook: 'Facebook',
      github: 'GitHub',
      twitter: 'Twitter',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
    };
    return names[provider] || provider;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snsConfigs,
          adConfigs,
        }),
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', text: '설정이 저장되었습니다.' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: '설정 저장에 실패했습니다.' });
      }
    } catch (error) {
      console.error('설정 저장 실패:', error);
      setSaveMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSNSConfig = (index: number, field: keyof SNSConfig, value: any) => {
    const updated = [...snsConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setSnsConfigs(updated);
  };

  const updateAdConfig = (index: number, field: keyof AdConfig, value: any) => {
    const updated = [...adConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setAdConfigs(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <PageHeader
        title="관리자 설정"
        description="SNS API 및 광고/배너/팝업 관리"
        icon={Settings}
        action={
          <EnhancedButton
            variant="gradient"
            onClick={handleSave}
            loading={isSaving}
            icon={Save}
          >
            저장하기
          </EnhancedButton>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* 저장 메시지 */}
        {saveMessage && (
          <ScrollAnimation direction="down">
            <div className={`mb-6 p-4 rounded-xl border-2 ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                {saveMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="font-semibold">{saveMessage.text}</span>
              </div>
            </div>
          </ScrollAnimation>
        )}

        {/* SNS API 설정 */}
        <ScrollAnimation direction="up" delay={100}>
          <EnhancedCard className="mb-8" title="SNS 회원가입 API 설정" icon={Settings}>
            <p className="text-gray-600 mb-6 text-sm">
              SNS 소셜 로그인을 위한 API 키를 설정하세요. 각 플랫폼의 개발자 콘솔에서 발급받을 수 있습니다.
            </p>
            
            <div className="space-y-6">
              {snsConfigs.map((config, index) => {
                const Icon = getSNSIcon(config.provider);
                return (
                  <div
                    key={config.provider}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{getSNSName(config.provider)}</h3>
                      </div>
                      <button
                        onClick={() => updateSNSConfig(index, 'enabled', !config.enabled)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          config.enabled ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            config.enabled ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {config.enabled && (
                      <div className="space-y-4 mt-4">
                        <EnhancedInput
                          label="Client ID"
                          value={config.clientId}
                          onChange={(e) => updateSNSConfig(index, 'clientId', e.target.value)}
                          placeholder={`${getSNSName(config.provider)} Client ID`}
                          type="password"
                        />
                        <EnhancedInput
                          label="Client Secret"
                          value={config.clientSecret}
                          onChange={(e) => updateSNSConfig(index, 'clientSecret', e.target.value)}
                          placeholder={`${getSNSName(config.provider)} Client Secret`}
                          type="password"
                        />
                        <EnhancedInput
                          label="Redirect URI"
                          value={config.redirectUri}
                          onChange={(e) => updateSNSConfig(index, 'redirectUri', e.target.value)}
                          placeholder="Redirect URI"
                          helperText="각 플랫폼의 개발자 콘솔에 이 URI를 등록해야 합니다"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Scopes</label>
                          <div className="flex flex-wrap gap-2">
                            {config.scopes.map((scope, scopeIndex) => (
                              <span
                                key={scopeIndex}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm"
                              >
                                {scope}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </EnhancedCard>
        </ScrollAnimation>

        {/* 광고/배너/팝업 설정 */}
        <ScrollAnimation direction="up" delay={200}>
          <EnhancedCard className="mb-8" title="광고/배너/팝업 관리" icon={Bell}>
            <p className="text-gray-600 mb-6 text-sm">
              사이트에 표시될 광고, 배너, 팝업을 관리하세요. 각 항목을 개별적으로 On/Off 할 수 있습니다.
            </p>

            <div className="space-y-6">
              {adConfigs.map((config, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {config.type === 'banner' ? (
                        <Image className="w-6 h-6 text-purple-600" />
                      ) : (
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
                        <p className="text-sm text-gray-500">
                          {config.type === 'banner' ? '배너' : '팝업'} • {config.position || '전체'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateAdConfig(index, 'enabled', !config.enabled)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        config.enabled ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          config.enabled ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {config.enabled && (
                    <div className="space-y-4 mt-4">
                      <EnhancedInput
                        label="제목"
                        value={config.title}
                        onChange={(e) => updateAdConfig(index, 'title', e.target.value)}
                        placeholder="제목을 입력하세요"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                        <textarea
                          value={config.content}
                          onChange={(e) => updateAdConfig(index, 'content', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                          rows={3}
                          placeholder="내용을 입력하세요"
                        />
                      </div>
                      <EnhancedInput
                        label="이미지 URL (선택사항)"
                        value={config.imageUrl || ''}
                        onChange={(e) => updateAdConfig(index, 'imageUrl', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        icon={Image}
                      />
                      <EnhancedInput
                        label="링크 URL (선택사항)"
                        value={config.linkUrl || ''}
                        onChange={(e) => updateAdConfig(index, 'linkUrl', e.target.value)}
                        placeholder="https://example.com"
                      />
                      {config.type === 'banner' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                          <select
                            value={config.position}
                            onChange={(e) => updateAdConfig(index, 'position', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                          >
                            <option value="top">상단</option>
                            <option value="bottom">하단</option>
                            <option value="sidebar">사이드바</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">표시 빈도</label>
                        <select
                          value={config.frequency}
                          onChange={(e) => updateAdConfig(index, 'frequency', e.target.value as any)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                        >
                          <option value="always">항상 표시</option>
                          <option value="once">한 번만 표시</option>
                          <option value="daily">하루에 한 번</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </EnhancedCard>
        </ScrollAnimation>

        {/* 저장 버튼 */}
        <div className="text-center">
          <EnhancedButton
            variant="gradient"
            size="lg"
            onClick={handleSave}
            loading={isSaving}
            icon={Save}
            fullWidth
            className="max-w-md mx-auto"
          >
            모든 설정 저장
          </EnhancedButton>
        </div>
      </div>

      <Footer />
    </div>
  );
}
