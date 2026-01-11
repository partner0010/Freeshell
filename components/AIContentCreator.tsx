'use client';

import { useState } from 'react';
import { Youtube, FileText, Twitter, Instagram, Sparkles, Copy, Download, RefreshCw, CheckCircle, ChevronRight, ChevronLeft, Check, X, Image as ImageIcon } from 'lucide-react';
import type { ContentPlan } from '@/lib/content-planner';
import type { ContentStructure } from '@/lib/content-structurer';
import type { ContentDraft } from '@/lib/content-drafter';
import type { ImprovedContent } from '@/lib/content-improver';
import type { PlatformContent } from '@/lib/content-converter';

type ContentType = 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';
type PurposeType = 'traffic' | 'conversion' | 'branding';
type StepType = 1 | 2 | 3 | 4 | 5;

interface StepResult {
  step: StepType;
  data: any;
  approved: boolean;
}

export default function AIContentCreator() {
  const [contentType, setContentType] = useState<ContentType>('youtube-script');
  const [targetAudience, setTargetAudience] = useState('');
  const [purpose, setPurpose] = useState<PurposeType>('traffic');
  const [platform, setPlatform] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 단계별 결과 저장
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCoreMessage, setSelectedCoreMessage] = useState<string | null>(null);
  const [structure, setStructure] = useState<ContentStructure | null>(null);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [improved, setImproved] = useState<ImprovedContent | null>(null);
  const [converted, setConverted] = useState<PlatformContent | null>(null);
  
  const [copied, setCopied] = useState(false);

  const contentTypes = [
    { id: 'youtube-script' as ContentType, name: '유튜브 스크립트', icon: Youtube, description: '5분 영상 스크립트 생성' },
    { id: 'blog-post' as ContentType, name: '블로그 포스트', icon: FileText, description: 'SEO 최적화된 블로그 글' },
    { id: 'sns-post' as ContentType, name: 'SNS 게시물', icon: Twitter, description: '페이스북/링크드인 게시물' },
    { id: 'instagram-caption' as ContentType, name: '인스타그램 캡션', icon: Instagram, description: '트렌디한 인스타 캡션' },
    { id: 'twitter-thread' as ContentType, name: '트위터 스레드', icon: Twitter, description: '바이럴 가능한 스레드' },
  ];

  const purposeTypes = [
    { id: 'traffic' as PurposeType, name: '유입', description: '트래픽 증가 목적' },
    { id: 'conversion' as PurposeType, name: '전환', description: '판매/회원가입 목적' },
    { id: 'branding' as PurposeType, name: '브랜딩', description: '브랜드 인지도 향상' },
  ];

  // 1단계: 콘텐츠 기획
  const handlePlan = async () => {
    if (!targetAudience.trim() || !platform.trim()) {
      setError('타겟 독자와 플랫폼을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAudience,
          purpose,
          platform,
          additionalInfo: additionalInfo || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '기획 실패');
      }

      const data = await response.json();
      setPlan(data.plan);
    } catch (err: any) {
      setError(err.message || '콘텐츠 기획 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 콘텐츠 구조
  const handleStructure = async () => {
    if (!selectedTopic || !selectedCoreMessage) {
      setError('주제와 핵심 메시지를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          coreMessage: selectedCoreMessage,
          platform,
          contentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '구조 작성 실패');
      }

      const data = await response.json();
      setStructure(data.structure);
    } catch (err: any) {
      setError(err.message || '콘텐츠 구조 작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3단계: 초안 생성
  const handleDraft = async () => {
    if (!structure || !plan) {
      setError('구조와 기획 정보가 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structure,
          plan,
          contentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '초안 생성 실패');
      }

      const data = await response.json();
      setDraft(data.draft);
    } catch (err: any) {
      setError(err.message || '초안 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4단계: 품질 개선
  const handleImprove = async () => {
    if (!draft || !plan) {
      setError('초안과 기획 정보가 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft,
          plan,
          contentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '품질 개선 실패');
      }

      const data = await response.json();
      setImproved(data.improved);
    } catch (err: any) {
      setError(err.message || '품질 개선 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5단계: 플랫폼 변환
  const handleConvert = async () => {
    if (!improved) {
      setError('개선된 콘텐츠가 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          improvedContent: improved,
          targetPlatform: contentType,
          originalPlatform: platform,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '플랫폼 변환 실패');
      }

      const data = await response.json();
      setConverted(data.converted);
    } catch (err: any) {
      setError(err.message || '플랫폼 변환 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (converted?.formatted) {
      navigator.clipboard.writeText(converted.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (converted?.formatted) {
      const blob = new Blob([converted.formatted], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentType}-${selectedTopic}-${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return plan !== null;
      case 2: return structure !== null;
      case 3: return draft !== null;
      case 4: return improved !== null;
      case 5: return converted !== null;
      default: return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep < 5 && canProceedToNext()) {
      setCurrentStep((currentStep + 1) as StepType);
      setError(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as StepType);
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
          AI 콘텐츠 제작 보조 (5단계)
        </h2>
        <p className="text-sm text-gray-600">
          단계별로 확인하며 고품질 콘텐츠를 제작하세요
        </p>
      </div>

      {/* 단계 표시 */}
      <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex flex-col items-center flex-1 ${step < 5 ? 'mr-2' : ''}`}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : currentStep > step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-600 text-center">
                  {step === 1 && '기획'}
                  {step === 2 && '구조'}
                  {step === 3 && '초안'}
                  {step === 4 && '개선'}
                  {step === 5 && '변환'}
                </div>
              </div>
              {step < 5 && (
                <ChevronRight
                  className={`w-5 h-5 mx-2 ${
                    currentStep > step ? 'text-green-600' : 'text-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 영역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            {currentStep === 1 && '1단계: 콘텐츠 기획'}
            {currentStep === 2 && '2단계: 콘텐츠 구조'}
            {currentStep === 3 && '3단계: 초안 생성'}
            {currentStep === 4 && '4단계: 품질 개선'}
            {currentStep === 5 && '5단계: 플랫폼 변환'}
          </h3>

          {currentStep === 1 && (
            <>
              {/* 콘텐츠 유형 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  콘텐츠 유형
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={`p-4 rounded-lg border transition-all ${
                          contentType === type.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${contentType === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="text-sm font-semibold text-gray-900">{type.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 목적 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  목적
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {purposeTypes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPurpose(p.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        purpose === p.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 타겟 독자 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  타겟 독자 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="예: 20-30대 직장인"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* 플랫폼 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플랫폼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="예: YouTube, 네이버 블로그, 인스타그램"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* 추가 정보 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추가 정보
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="예: 특정 키워드 포함, 톤앤매너 등"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <button
                onClick={handlePlan}
                disabled={isLoading || !targetAudience.trim() || !platform.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>기획 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>기획 시작</span>
                  </>
                )}
              </button>
            </>
          )}

          {currentStep === 2 && plan && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  주제 선택 (기획된 주제 중 하나를 선택하세요)
                </label>
                <div className="space-y-3">
                  {plan.topics.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedTopic(topic.title);
                        setSelectedCoreMessage(topic.coreMessage);
                      }}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedTopic === topic.title
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{topic.title}</div>
                      <div className="text-sm text-gray-600">{topic.coreMessage}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStructure}
                disabled={isLoading || !selectedTopic}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>구조 작성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>구조 작성</span>
                  </>
                )}
              </button>
            </>
          )}

          {currentStep === 3 && structure && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  구조가 작성되었습니다. 초안 생성을 시작하세요.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  <div className="font-semibold mb-2">구조 요약:</div>
                  <div>제목: {structure.title}</div>
                  <div>섹션 수: {structure.bodyStructure.length}개</div>
                  <div>예상 길이: {structure.estimatedLength}자</div>
                </div>
              </div>

              <button
                onClick={handleDraft}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>초안 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>초안 생성</span>
                  </>
                )}
              </button>
            </>
          )}

          {currentStep === 4 && draft && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  초안이 생성되었습니다. 품질 개선을 시작하세요.
                </p>
                {draft.issues.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="font-semibold text-yellow-900 mb-2">발견된 문제점:</div>
                    <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                      {draft.issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  <div className="font-semibold mb-2">초안 요약:</div>
                  <div>단어 수: {draft.wordCount}개</div>
                  <div>가독성: {draft.readability === 'high' ? '높음' : draft.readability === 'medium' ? '보통' : '낮음'}</div>
                  <div>문제점 수: {draft.issues.length}개</div>
                </div>
              </div>

              <button
                onClick={handleImprove}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>품질 개선 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>품질 개선</span>
                  </>
                )}
              </button>
            </>
          )}

          {currentStep === 5 && improved && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  품질이 개선되었습니다. 플랫폼 변환을 시작하세요.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 mb-4">
                  <div className="font-semibold mb-2">개선 요약:</div>
                  <div>품질 점수: {improved.qualityScore}/100</div>
                  <div>정책 준수: {improved.policyCompliant ? '예' : '아니오'}</div>
                  <div>개선 사항: {improved.improvements.length}개</div>
                </div>
                {improved.improvements.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="font-semibold text-green-900 mb-2">개선 내역:</div>
                    <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                      {improved.improvements.slice(0, 5).map((improvement, idx) => (
                        <li key={idx}>{improvement.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={handleConvert}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>플랫폼 변환 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>플랫폼 변환</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* 네비게이션 */}
          {currentStep > 1 && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handlePrevStep}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전</span>
              </button>
              {currentStep < 5 && canProceedToNext() && (
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>다음</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 결과 영역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentStep === 1 && '기획 결과'}
              {currentStep === 2 && '구조 결과'}
              {currentStep === 3 && '초안 결과'}
              {currentStep === 4 && '개선 결과'}
              {currentStep === 5 && '최종 결과'}
            </h3>
            {converted && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                  title="복사"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                  title="다운로드"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 1단계 결과 */}
          {currentStep === 1 && plan && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-sm text-blue-700 mb-3">
                  <div className="font-semibold mb-2">기획 완료</div>
                  <div>플랫폼: {plan.platform}</div>
                  <div>목적: {plan.purpose}</div>
                  <div>타겟 독자: {plan.targetAudience}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="font-semibold text-gray-900 mb-2">제안된 주제 (5개):</div>
                {plan.topics.map((topic, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-1">{topic.title}</div>
                    <div className="text-sm text-gray-600">{topic.coreMessage}</div>
                  </div>
                ))}
              </div>
              {plan.forbiddenExpressions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold text-yellow-900 mb-2">금지 표현:</div>
                  <div className="text-sm text-yellow-800">
                    {plan.forbiddenExpressions.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2단계 결과 */}
          {currentStep === 2 && structure && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-sm text-blue-700 mb-3">
                  <div className="font-semibold mb-2">구조 작성 완료</div>
                  <div>제목: {structure.title}</div>
                  <div>예상 길이: {structure.estimatedLength}자</div>
                  <div>섹션 수: {structure.bodyStructure.length}개</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="font-semibold text-gray-900 mb-2">인트로 훅:</div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    {structure.introHook}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-2">본문 구조:</div>
                  {structure.bodyStructure.map((section, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="font-semibold text-gray-900 mb-2">{section.section}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="font-medium mb-1">주요 포인트:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {section.bullets.map((bullet, i) => (
                            <li key={i}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium mb-1">핵심 내용:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {section.keyPoints.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-2">CTA:</div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    위치: {structure.ctaLocation === 'end' ? '마무리' : structure.ctaLocation === 'middle' ? '중간' : '중간 + 마무리'}
                    <br />
                    텍스트: {structure.ctaText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3단계 결과 */}
          {currentStep === 3 && draft && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-sm text-blue-700 mb-3">
                  <div className="font-semibold mb-2">초안 생성 완료</div>
                  <div>단어 수: {draft.wordCount}개</div>
                  <div>가독성: {draft.readability === 'high' ? '높음' : draft.readability === 'medium' ? '보통' : '낮음'}</div>
                  <div>문제점: {draft.issues.length}개</div>
                </div>
              </div>
              {draft.issues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold text-yellow-900 mb-2">발견된 문제점:</div>
                  <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                    {draft.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {draft.content}
                </pre>
              </div>
            </div>
          )}

          {/* 4단계 결과 */}
          {currentStep === 4 && improved && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-sm text-blue-700 mb-3">
                  <div className="font-semibold mb-2">품질 개선 완료</div>
                  <div>품질 점수: {improved.qualityScore}/100</div>
                  <div>정책 준수: {improved.policyCompliant ? '✅ 예' : '❌ 아니오'}</div>
                  <div>개선 사항: {improved.improvements.length}개</div>
                </div>
              </div>
              {improved.improvements.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-900 mb-2">개선 내역:</div>
                  <div className="space-y-2">
                    {improved.improvements.map((improvement, idx) => (
                      <div key={idx} className="text-sm text-green-800 border-l-2 border-green-400 pl-3">
                        <div className="font-medium">
                          {improvement.type === 'removed' && '❌ 제거'}
                          {improvement.type === 'modified' && '✏️ 수정'}
                          {improvement.type === 'added' && '➕ 추가'}
                        </div>
                        <div className="mt-1">{improvement.reason}</div>
                        {improvement.before && improvement.after && (
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="text-red-600">수정 전: {improvement.before}</div>
                            <div className="text-green-600">수정 후: {improvement.after}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {improved.content}
                </pre>
              </div>
            </div>
          )}

          {/* 5단계 결과 */}
          {currentStep === 5 && converted && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="text-sm text-green-700 mb-3">
                  <div className="font-semibold mb-2">✅ 플랫폼 변환 완료</div>
                  <div>플랫폼: {converted.platform}</div>
                  <div>글자 수: {converted.characterCount}자</div>
                  <div>단어 수: {converted.wordCount}개</div>
                  <div>해시태그: {converted.hashtags.length}개</div>
                </div>
              </div>
              {converted.hashtags.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="font-semibold text-purple-900 mb-2">해시태그:</div>
                  <div className="flex flex-wrap gap-2">
                    {converted.hashtags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white border border-purple-300 rounded-full text-sm text-purple-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {converted.formatted}
                </pre>
              </div>
            </div>
          )}

          {currentStep === 1 && !plan && (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                1단계: 콘텐츠 기획을 시작하세요.
              </p>
            </div>
          )}

          {currentStep === 2 && !structure && (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                2단계: 주제를 선택하고 구조를 작성하세요.
              </p>
            </div>
          )}

          {currentStep === 3 && !draft && (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                3단계: 구조를 바탕으로 초안을 생성하세요.
              </p>
            </div>
          )}

          {currentStep === 4 && !improved && (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                4단계: 초안의 품질을 개선하세요.
              </p>
            </div>
          )}

          {currentStep === 5 && !converted && (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                5단계: 플랫폼에 맞게 최종 변환하세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
