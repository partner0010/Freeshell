/**
 * 마이페이지 (보안 강화)
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Shield, 
  Key, 
  Bell,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedButton from '@/components/EnhancedButton';
import EnhancedCard from '@/components/EnhancedCard';
import PageHeader from '@/components/PageHeader';
import ScrollAnimation from '@/components/ScrollAnimation';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'settings'>('profile');
  
  // 프로필 수정
  const [editName, setEditName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');
  
  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditName(data.profile.name);
        setTwoFactorEnabled(data.profile.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateName = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, name: editName } : null);
        setIsEditingName(false);
      }
    } catch (error) {
      console.error('이름 업데이트 실패:', error);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('비밀번호가 변경되었습니다.');
      } else {
        const data = await response.json();
        setPasswordError(data.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const handleToggle2FA = async () => {
    try {
      const response = await fetch('/api/user/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !twoFactorEnabled }),
      });

      if (response.ok) {
        setTwoFactorEnabled(!twoFactorEnabled);
        if (!twoFactorEnabled) {
          setTwoFactorSetup(true);
        }
      }
    } catch (error) {
      console.error('2FA 설정 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <PageHeader
        title="마이페이지"
        description="프로필 및 보안 설정을 관리하세요"
        icon={User}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* 탭 */}
        <ScrollAnimation direction="down">
          <div className="flex items-center gap-2 mb-8 border-b border-gray-200">
            {[
              { id: 'profile', label: '프로필', icon: User },
              { id: 'security', label: '보안', icon: Shield },
              { id: 'settings', label: '설정', icon: Bell },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </ScrollAnimation>

        {/* 프로필 탭 */}
        {activeTab === 'profile' && (
          <ScrollAnimation direction="up">
            <EnhancedCard>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        이메일은 변경할 수 없습니다.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={!isEditingName}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {isEditingName ? (
                          <div className="flex items-center gap-2">
                            <EnhancedButton
                              variant="gradient"
                              size="sm"
                              onClick={handleUpdateName}
                              icon={Save}
                            >
                              저장
                            </EnhancedButton>
                            <EnhancedButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEditingName(false);
                                setEditName(profile?.name || '');
                              }}
                            >
                              취소
                            </EnhancedButton>
                          </div>
                        ) : (
                          <EnhancedButton
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingName(true)}
                          >
                            수정
                          </EnhancedButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">가입일</span>
                      <span className="text-sm font-medium text-gray-900">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">마지막 로그인</span>
                      <span className="text-sm font-medium text-gray-900">
                        {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">이메일 인증</span>
                      <div className="flex items-center gap-2">
                        {profile?.emailVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">인증됨</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">미인증</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        )}

        {/* 보안 탭 */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <ScrollAnimation direction="up">
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        현재 비밀번호
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        새 비밀번호
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        최소 8자 이상, 대소문자, 숫자, 특수문자 포함
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        새 비밀번호 확인
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {passwordError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{passwordError}</p>
                      </div>
                    )}
                    <EnhancedButton
                      variant="gradient"
                      onClick={handleChangePassword}
                      icon={Lock}
                      fullWidth
                    >
                      비밀번호 변경
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCard>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={100}>
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">2단계 인증 (2FA)</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 mb-1">
                        추가 보안을 위해 2단계 인증을 활성화하세요
                      </p>
                      <p className="text-xs text-gray-500">
                        로그인 시 비밀번호와 함께 인증 코드가 필요합니다
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={handleToggle2FA}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </EnhancedCard>
            </ScrollAnimation>
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <ScrollAnimation direction="up">
            <EnhancedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
                <p className="text-sm text-gray-500">설정 기능은 곧 추가될 예정입니다.</p>
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        )}
      </div>

      <Footer />
    </div>
  );
}
