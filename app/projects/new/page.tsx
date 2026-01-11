/**
 * 프로젝트 생성 화면
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Youtube, Twitter, Instagram, Sparkles, ArrowRight, Loader2, X, LayoutTemplate } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UpgradePrompt from '@/components/UpgradePrompt';
import TemplateSelector from '@/components/TemplateSelector';
import { planLimitService } from '@/lib/services/planLimitService';

type ContentType = 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';
type PurposeType = 'traffic' | 'conversion' | 'branding';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectTitle, setProjectTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [purpose, setPurpose] = useState<PurposeType>('traffic');
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState<ContentType>('blog-post');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<{
    title: string;
    message: string;
    requiredPlan: 'personal' | 'pro' | 'enterprise';
    feature?: string;
  } | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // URL 파라미터에서 템플릿 정보 가져오기
  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      try {
        const templateData = JSON.parse(decodeURIComponent(templateParam));
        setSelectedTemplate(templateData);
        if (templateData.content_type) {
          setContentType(templateData.content_type);
        }
        if (templateData.platform) {
          setPlatform(templateData.platform);
        }
        if (templateData.title) {
          setProjectTitle(templateData.title);
        }
      } catch (error) {
        console.error('템플릿 데이터 파싱 실패:', error);
      }
    }
  }, [searchParams]);

  // 세션에서 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUserId(data.user.id);
          } else {
            // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
            router.push('/auth/login?redirect=/projects/new');
          }
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        router.push('/auth/login?redirect=/projects/new');
      }
    };
    fetchUser();
  }, [router]);

  const contentTypes = [
    { id: 'youtube-script' as ContentType, name: '유튜브 스크립트', icon: Youtube, description: '5분 영상 스크립트 생성' },
    { id: 'blog-post' as ContentType, name: '블로그 포스트', icon: FileText, description: 'SEO 최적화된 블로그 글' },
    { id: 'sns-post' as ContentType, name: 'SNS 게시물', icon: Twitter, description: '페이스북/링크드인 게시물' },
    { id: 'instagram-caption' as ContentType, name: '인스타그램 캡션', icon: Instagram, description: '트렌디한 인스타 캡션' },
    { id: 'twitter-thread' as ContentType, name: '트위터 스레드', icon: Twitter, description: '바이럴 가능한 스레드' },
  ];

  const purposeTypes = [
    { id: 'traffic' as PurposeType, name: '유입', description: '트래픽 증가 목적', icon: Sparkles },
    { id: 'conversion' as PurposeType, name: '전환', description: '판매/회원가입 목적', icon: Sparkles },
    { id: 'branding' as PurposeType, name: '브랜딩', description: '브랜드 인지도 향상', icon: Sparkles },
  ];

  const handleCreateProject = async () => {
    // 필수 필드 확인
    if (!projectTitle.trim()) {
      setError('프로젝트 제목을 입력해주세요.');
      return;
    }
    if (!targetAudience.trim()) {
      setError('타겟 독자를 입력해주세요.');
      return;
    }
    if (!platform.trim()) {
      setError('플랫폼을 입력해주세요.');
      return;
    }

    // 프로젝트 생성 제한 확인
    // TODO: 실제 프로젝트 수 확인
    if (!userId) {
      return;
    }
    const projectLimitCheck = planLimitService.checkProjectCreationLimit(userId, 0);
    if (!projectLimitCheck.allowed) {
      const upgradePlan = projectLimitCheck.upgradePlan;
      const validPlan = (upgradePlan === 'personal' || upgradePlan === 'pro' || upgradePlan === 'enterprise') 
        ? upgradePlan 
        : 'personal';
      setUpgradeInfo({
        title: '프로젝트 생성 한도 초과',
        message: projectLimitCheck.reason || '프로젝트를 더 생성하려면 업그레이드가 필요합니다.',
        requiredPlan: validPlan,
        feature: 'contentCreation',
      });
      setShowUpgradePrompt(true);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          user_id: userId,
          title: projectTitle,
          target_audience: targetAudience,
          purpose,
          platform,
          content_type: contentType,
          template_id: selectedTemplate?.id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '프로젝트 생성 실패');
      }

      const data = await response.json();
      
      // 프로젝트 상세 페이지로 이동
      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || '프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              새 프로젝트 만들기
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              AI 콘텐츠 제작 프로젝트를 시작하세요
            </p>
          </div>

          {/* 프로젝트 생성 폼 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* 프로젝트 제목 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  프로젝트 제목 *
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="예: 2024 마케팅 콘텐츠"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
                />
              </div>

              {/* 타겟 독자 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  타겟 독자 *
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="예: 20-30대 직장인, 마케터"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
                />
              </div>

              {/* 목적 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  목적 선택 *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {purposeTypes.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPurpose(p.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          purpose === p.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 mx-auto ${purpose === p.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className={`text-sm font-semibold ${purpose === p.id ? 'text-blue-900' : 'text-gray-900'}`}>
                          {p.name}
                        </div>
                        <div className={`text-xs mt-1 ${purpose === p.id ? 'text-blue-700' : 'text-gray-600'}`}>
                          {p.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 플랫폼 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  플랫폼 *
                </label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="예: 유튜브, 블로그, 인스타그램"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
                />
              </div>

              {/* 콘텐츠 타입 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  콘텐츠 타입 *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          contentType === type.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 mx-auto ${contentType === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className={`text-sm font-semibold ${contentType === type.id ? 'text-blue-900' : 'text-gray-900'}`}>
                          {type.name}
                        </div>
                        <div className={`text-xs mt-1 ${contentType === type.id ? 'text-blue-700' : 'text-gray-600'}`}>
                          {type.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 템플릿 선택 (선택사항) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  템플릿 선택 (선택사항)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowTemplateSelector(true)}
                    className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-700"
                  >
                    <LayoutTemplate className="w-5 h-5" />
                    <span className="font-medium">
                      {selectedTemplate ? selectedTemplate.title : '템플릿 선택하기'}
                    </span>
                  </button>
                  {selectedTemplate && (
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="템플릿 제거"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {selectedTemplate && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">선택된 템플릿:</span> {selectedTemplate.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{selectedTemplate.description}</p>
                  </div>
                )}
              </div>

              {/* 생성 버튼 */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleCreateProject}
                  disabled={isCreating || !projectTitle.trim() || !targetAudience.trim() || !platform.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>프로젝트 생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>프로젝트 생성하기</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-700">
              프로젝트를 생성하면 5단계 AI 콘텐츠 제작 워크플로우를 시작할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <Footer />

      {/* 업그레이드 프롬프트 */}
      {showUpgradePrompt && upgradeInfo && (
        <UpgradePrompt
          title={upgradeInfo.title}
          message={upgradeInfo.message}
          requiredPlan={upgradeInfo.requiredPlan}
          feature={upgradeInfo.feature}
          onClose={() => setShowUpgradePrompt(false)}
          showComparison={true}
        />
      )}

      {/* 템플릿 선택기 */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={(template) => {
          setSelectedTemplate(template);
          // 템플릿의 contentType과 platform에 맞게 자동 설정
          if (template.contentType) {
            const matchingType = contentTypes.find(t => t.id === template.contentType);
            if (matchingType) {
              setContentType(matchingType.id);
            }
          }
          if (template.platform) {
            setPlatform(template.platform);
          }
        }}
        contentType={contentType}
        platform={platform}
      />
    </div>
  );
}

