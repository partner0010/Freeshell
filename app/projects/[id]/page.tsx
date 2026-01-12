/**
 * 프로젝트 상세 및 5단계 콘텐츠 제작 페이지
 */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, Sparkles, Check, ChevronRight, RefreshCw, Loader2, 
  ArrowLeft, Download, Copy, AlertCircle, Crown, X, Edit2, Trash2, Share2, Settings
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UpgradePrompt from '@/components/UpgradePrompt';
import { planLimitService } from '@/lib/services/planLimitService';

type StepType = 1 | 2 | 3 | 4 | 5;
type StepStatus = 'pending' | 'processing' | 'completed' | 'error';

interface StepResult {
  step: StepType;
  status: StepStatus;
  data: any;
  error?: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 단계별 결과
  const [stepResults, setStepResults] = useState<Record<StepType, StepResult | null>>({
    1: null, 2: null, 3: null, 4: null, 5: null
  });

  // Step 1: Planning
  const [planningInput, setPlanningInput] = useState({
    targetAudience: '',
    purpose: 'traffic' as 'traffic' | 'conversion' | 'branding',
    platform: '',
    additionalInfo: ''
  });
  const [planningResult, setPlanningResult] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Step 2: Structure
  const [structureResult, setStructureResult] = useState<any>(null);

  // Step 3: Draft
  const [draftResult, setDraftResult] = useState<any>(null);

  // Step 4: Quality
  const [qualityResult, setQualityResult] = useState<any>(null);

  // Step 5: Platform
  const [platformResult, setPlatformResult] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('blog-post');

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'personal' | 'pro' | 'enterprise'>('free');

  // 세션에서 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUserId(data.user.id);
            setUserPlan(data.user.plan);
          } else {
            // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
            router.push('/auth/login?redirect=/projects/' + projectId);
          }
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        router.push('/auth/login?redirect=/projects/' + projectId);
      }
    };
    fetchUser();
  }, [projectId, router]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchStepResults();
    }
  }, [projectId]);

  useEffect(() => {
    if (project) {
      // 프로젝트 정보로 초기 입력값 설정
      setPlanningInput({
        targetAudience: project.target_audience || '',
        purpose: project.purpose || 'traffic',
        platform: project.platform || '',
        additionalInfo: ''
      });
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (err: any) {
      setError(err.message || '프로젝트를 불러올 수 없습니다.');
    }
  };

  const fetchStepResults = async () => {
    // 각 단계별 결과 조회
    const steps: StepType[] = [1, 2, 3, 4, 5];
    const stepNames = ['plan', 'structure', 'draft', 'quality', 'platform'];
    
    for (let i = 0; i < steps.length; i++) {
      try {
        const response = await fetch(`/api/ai/${stepNames[i]}?project_id=${projectId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.step_result && data.step_result.status === 'success') {
            setStepResults(prev => ({
              ...prev,
              [steps[i]]: {
                step: steps[i],
                status: 'completed',
                data: data.output
              }
            }));

            // 각 단계 결과를 해당 state에 저장
            if (steps[i] === 1) setPlanningResult(data.output);
            if (steps[i] === 2) setStructureResult(data.output);
            if (steps[i] === 3) setDraftResult(data.output);
            if (steps[i] === 4) setQualityResult(data.output);
            if (steps[i] === 5) setPlatformResult(data.output);
          }
        }
      } catch (err) {
        // 오류 무시 (결과가 없는 경우)
      }
    }
  };

  const executeStep = async (step: StepType) => {
    if (!userId) {
      router.push('/auth/login?redirect=/projects/' + projectId);
      return;
    }

    // 플랜 제한 확인
    const stepType = step === 1 ? 'PLAN' :
                     step === 2 ? 'STRUCTURE' :
                     step === 3 ? 'DRAFT' :
                     step === 4 ? 'QUALITY' : 'PLATFORM';

    const hasAccess = planLimitService.canAccessAIStep(userPlan, stepType);

    if (!hasAccess) {
      setUpgradeInfo({
        title: '업그레이드 필요',
        message: `현재 플랜(${userPlan === 'free' ? '무료' : userPlan === 'personal' ? '개인' : userPlan === 'pro' ? '프로' : '엔터프라이즈'})에서는 ${step}단계를 사용할 수 없습니다.`,
        requiredPlan: step >= 4 ? 'personal' : 'pro',
      });
      setShowUpgradePrompt(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;

      switch (step) {
        case 1:
          response = await fetch('/api/ai/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: projectId,
              userId: userId,
              target_audience: planningInput.targetAudience,
              purpose: planningInput.purpose,
              platform: planningInput.platform,
              additional_info: planningInput.additionalInfo || undefined,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setPlanningResult(data.output);
            setStepResults(prev => ({ ...prev, 1: { step: 1, status: 'completed', data: data.output } }));
            setCurrentStep(2);
          } else {
            throw new Error((await response.json()).error || '기획 실패');
          }
          break;

        case 2:
          if (!selectedTopic) throw new Error('주제를 선택해주세요.');
          response = await fetch('/api/ai/structure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              user_id: userId || '',
              topic: selectedTopic,
              core_message: planningResult?.topics?.find((t: any) => t.title === selectedTopic)?.message || '',
              platform: planningInput.platform,
              content_type: project?.content_type || 'blog-post',
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setStructureResult(data.output);
            setStepResults(prev => ({ ...prev, 2: { step: 2, status: 'completed', data: data.output } }));
            setCurrentStep(3);
          } else {
            throw new Error((await response.json()).error || '구조화 실패');
          }
          break;

        case 3:
          response = await fetch('/api/ai/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              user_id: userId || '',
              content_type: project?.content_type || 'blog-post',
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setDraftResult(data.output);
            setStepResults(prev => ({ ...prev, 3: { step: 3, status: 'completed', data: data.output } }));
            setCurrentStep(4);
          } else {
            throw new Error((await response.json()).error || '초안 생성 실패');
          }
          break;

        case 4:
          response = await fetch('/api/ai/quality', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              user_id: userId || '',
              content_type: project?.content_type || 'blog-post',
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setQualityResult(data.output);
            setStepResults(prev => ({ ...prev, 4: { step: 4, status: 'completed', data: data.output } }));
            setCurrentStep(5);
          } else {
            throw new Error((await response.json()).error || '품질 개선 실패');
          }
          break;

        case 5:
          response = await fetch('/api/ai/platform', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              user_id: userId || '',
              target_platform: selectedPlatform,
              original_platform: project?.content_type || 'blog-post',
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setPlatformResult(data.output);
            setStepResults(prev => ({ ...prev, 5: { step: 5, status: 'completed', data: data.output } }));
          } else {
            throw new Error((await response.json()).error || '플랫폼 변환 실패');
          }
          break;
      }
    } catch (err: any) {
      setError(err.message || `${step}단계 실행 중 오류가 발생했습니다.`);
      setStepResults(prev => ({ ...prev, [step]: { step, status: 'error', data: null, error: err.message } }));
    } finally {
      setIsLoading(false);
    }
  };

  const retryStep = (step: StepType) => {
    setError(null);
    setStepResults(prev => ({ ...prev, [step]: null }));
    executeStep(step);
  };

  const renderStepIndicator = (stepNum: StepType, stepName: string) => {
    const result = stepResults[stepNum];
    const isCompleted = result?.status === 'completed';
    const isCurrent = currentStep === stepNum;
    const prevStep = (stepNum - 1) as StepType;
    const isAccessible = stepNum <= currentStep || (stepNum === currentStep + 1 && stepResults[prevStep]?.status === 'completed');

    return (
      <button
        onClick={() => isAccessible && setCurrentStep(stepNum)}
        disabled={!isAccessible}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          isCurrent
            ? 'bg-blue-600 text-white shadow-lg'
            : isCompleted
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : isAccessible
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          isCurrent
            ? 'bg-white text-blue-600'
            : isCompleted
              ? 'bg-green-600 text-white'
              : 'bg-gray-300 text-gray-600'
        }`}>
          {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
        </div>
        <span className="font-semibold">{stepName}</span>
        {stepNum < 5 && <ChevronRight className="w-4 h-4" />}
      </button>
    );
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">프로젝트를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>프로젝트 목록으로</span>
            </button>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/project/${projectId}/export?format=json`);
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `project-${projectId}.json`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        } else {
                          const { toast } = await import('@/lib/utils/toast');
                          toast.error('프로젝트 내보내기 중 오류가 발생했습니다.');
                        }
                      } catch (error) {
                        console.error('프로젝트 내보내기 오류:', error);
                        const { toast } = await import('@/lib/utils/toast');
                        toast.error('프로젝트 내보내기 중 오류가 발생했습니다.');
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="프로젝트 내보내기"
                    title="프로젝트 내보내기"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/project/${projectId}/duplicate`, {
                          method: 'POST',
                        });
                        if (response.ok) {
                          const data = await response.json();
                          const { toast } = await import('@/lib/utils/toast');
                          toast.success(data.message || '프로젝트가 복제되었습니다.');
                          router.push(`/projects/${data.project.id}`);
                        } else {
                          const errorData = await response.json();
                          const { toast } = await import('@/lib/utils/toast');
                          toast.error(errorData.error || '프로젝트 복제 중 오류가 발생했습니다.');
                        }
                      } catch (error) {
                        console.error('프로젝트 복제 오류:', error);
                        const { toast } = await import('@/lib/utils/toast');
                        toast.error('프로젝트 복제 중 오류가 발생했습니다.');
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    aria-label="프로젝트 복제"
                    title="프로젝트 복제"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const newTitle = prompt('프로젝트 제목을 수정하세요:', project.title);
                      if (newTitle && newTitle !== project.title) {
                        // 실제로는 API 호출하여 업데이트
                        fetch(`/api/project/${projectId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: newTitle }),
                        }).then(() => {
                          setProject({ ...project, title: newTitle });
                        }).catch(async () => {
                          const { toast } = await import('@/lib/utils/toast');
                          toast.error('프로젝트 수정 중 오류가 발생했습니다.');
                        });
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="프로젝트 편집"
                    title="프로젝트 편집"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('정말 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                        return;
                      }
                      
                      try {
                        const response = await fetch(`/api/project/${projectId}`, {
                          method: 'DELETE',
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.error || '프로젝트 삭제 실패');
                        }

                        // 프로젝트 목록으로 이동
                        router.push('/projects');
                      } catch (err: any) {
                        setError(err.message || '프로젝트 삭제 중 오류가 발생했습니다.');
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="프로젝트 삭제"
                    title="프로젝트 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span><strong>타겟:</strong> {project.target_audience}</span>
                <span><strong>목적:</strong> {project.purpose === 'traffic' ? '유입' : project.purpose === 'conversion' ? '전환' : '브랜딩'}</span>
                <span><strong>플랫폼:</strong> {project.platform}</span>
                <span><strong>타입:</strong> {project.content_type}</span>
              </div>
            </div>
          </div>

          {/* 단계 표시기 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {renderStepIndicator(1, '기획')}
              {renderStepIndicator(2, '구조')}
              {renderStepIndicator(3, '초안')}
              {renderStepIndicator(4, '품질 개선')}
              {renderStepIndicator(5, '플랫폼 변환')}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold mb-1">오류 발생</p>
                <p>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 단계별 콘텐츠 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {/* Step 1: Planning */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">1단계: 콘텐츠 기획</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">타겟 독자 *</label>
                    <input
                      type="text"
                      value={planningInput.targetAudience}
                      onChange={(e) => setPlanningInput({ ...planningInput, targetAudience: e.target.value })}
                      placeholder="예: 20-30대 직장인, 마케터"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">목적 *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['traffic', 'conversion', 'branding'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setPlanningInput({ ...planningInput, purpose: p as any })}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            planningInput.purpose === p
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-semibold text-gray-900">
                            {p === 'traffic' ? '유입' : p === 'conversion' ? '전환' : '브랜딩'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">플랫폼 *</label>
                    <input
                      type="text"
                      value={planningInput.platform}
                      onChange={(e) => setPlanningInput({ ...planningInput, platform: e.target.value })}
                      placeholder="예: 유튜브, 블로그, 인스타그램"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
                    />
                  </div>
                  {planningResult && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">기획 결과</h3>
                      {planningResult.topics && (
                        <div className="space-y-2 mb-4">
                          {planningResult.topics.map((topic: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTopic(topic.title)}
                              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                selectedTopic === topic.title
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <p className="font-semibold text-gray-900">{topic.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{topic.message}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => executeStep(1)}
                    disabled={isLoading || !planningInput.targetAudience.trim() || !planningInput.platform.trim()}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>기획 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>{planningResult ? '다시 기획하기' : '기획 시작'}</span>
                      </>
                    )}
                  </button>
                  {planningResult && (
                    <button
                      onClick={() => retryStep(1)}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>재생성</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Structure */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">2단계: 콘텐츠 구조</h2>
                {!selectedTopic ? (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
                    <p>1단계에서 주제를 선택해주세요.</p>
                  </div>
                ) : structureResult ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">구조 결과</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-semibold">인트로 훅:</span>
                          <p className="text-gray-700 mt-1">{structureResult.introHook}</p>
                        </div>
                        {structureResult.contentFlow && (
                          <div>
                            <span className="font-semibold">콘텐츠 흐름:</span>
                            <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                              {structureResult.contentFlow.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => retryStep(2)}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>재생성</span>
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>3단계로 진행</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => executeStep(2)}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>구조화 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>구조화 시작</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Step 3: Draft */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">3단계: 초안 생성</h2>
                {draftResult ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">초안</h3>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed max-h-96 overflow-y-auto">
                        {draftResult.draft}
                      </pre>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(draftResult.draft)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        <span>복사</span>
                      </button>
                      <button
                        onClick={() => retryStep(3)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>재생성</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>4단계로 진행</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => executeStep(3)}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>초안 생성 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>초안 생성 시작</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Step 4: Quality */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">4단계: 품질 개선</h2>
                {qualityResult ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">개선된 콘텐츠</h3>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed max-h-96 overflow-y-auto">
                        {qualityResult.improvedText}
                      </pre>
                      {qualityResult.reasonsForModification && qualityResult.reasonsForModification.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">개선 사항</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {qualityResult.reasonsForModification.map((reason: string, idx: number) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(qualityResult.improvedText)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        <span>복사</span>
                      </button>
                      <button
                        onClick={() => retryStep(4)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>재생성</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>5단계로 진행</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => executeStep(4)}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>품질 개선 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>품질 개선 시작</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Step 5: Platform */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">5단계: 플랫폼 변환</h2>
                {platformResult ? (
                  <div className="space-y-6">
                    {platformResult.platformContent && platformResult.platformContent.map((pc: any, idx: number) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">{pc.platform}</h3>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed max-h-96 overflow-y-auto mb-3">
                          {pc.content}
                        </pre>
                        {pc.hashtags && pc.hashtags.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-sm font-semibold text-gray-900">해시태그: </span>
                            <span className="text-sm text-gray-600">{pc.hashtags.join(' ')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => retryStep(5)}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>재생성</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">변환 대상 플랫폼 *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { id: 'blog-post', name: '블로그' },
                          { id: 'youtube-script', name: '유튜브' },
                          { id: 'sns-post', name: 'SNS' },
                          { id: 'instagram-caption', name: '인스타그램' },
                          { id: 'twitter-thread', name: '트위터' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPlatform(p.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedPlatform === p.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="font-semibold text-gray-900">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => executeStep(5)}
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>플랫폼 변환 중...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>플랫폼 변환 시작</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* 업그레이드 프롬프트 */}
      {showUpgradePrompt && upgradeInfo && (
        <UpgradePrompt
          title={upgradeInfo.title || '업그레이드 필요'}
          message={upgradeInfo.message || '이 기능을 사용하려면 플랜 업그레이드가 필요합니다.'}
          requiredPlan={upgradeInfo.requiredPlan || 'personal'}
          onClose={() => setShowUpgradePrompt(false)}
          showComparison={true}
        />
      )}
    </div>
  );
}

