/**
 * 가격 페이지
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Crown, Zap, Loader2, AlertCircle, ArrowRight, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PRICING_PLANS, type PlanType } from '@/lib/models/PricingPlan';

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanFromUrl = searchParams.get('plan') as PlanType | null;
  const canceled = searchParams.get('canceled') === 'true';

  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(selectedPlanFromUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 현재 사용자 플랜 확인
    fetchUserPlan();
  }, []);

  useEffect(() => {
    // URL에서 플랜 선택
    if (selectedPlanFromUrl) {
      setSelectedPlan(selectedPlanFromUrl);
    }
  }, [selectedPlanFromUrl]);

  useEffect(() => {
    // 결제 취소 메시지 표시
    if (canceled) {
      setError('결제가 취소되었습니다.');
    }
  }, [canceled]);

  const fetchUserPlan = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          setCurrentPlan(data.user.plan);
        }
      }
    } catch (error) {
      console.error('사용자 플랜 조회 실패:', error);
    }
  };

  const handleSelectPlan = (planId: PlanType) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      setError('플랜을 선택해주세요.');
      return;
    }

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/pricing?plan=${selectedPlan}`);
      return;
    }

    if (selectedPlan === currentPlan) {
      setError('이미 해당 플랜을 사용 중입니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 결제 세션 생성
      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '결제 세션 생성에 실패했습니다.');
      }

      // Stripe 결제 페이지로 리다이렉트
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('결제 URL을 받을 수 없습니다.');
      }
    } catch (err: any) {
      setError(err.message || '결제 세션 생성 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const plans = Object.values(PRICING_PLANS);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 mb-6 text-sm font-medium">
              <Crown className="w-4 h-4" />
              <span>플랜 선택</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              가격 및 플랜
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              필요에 맞는 플랜을 선택하여 모든 기능을 이용하세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold mb-1">오류 발생</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 플랜 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const isSelected = selectedPlan === plan.id;
              const isEnterprise = plan.id === 'enterprise';

              return (
                <div
                  key={plan.id}
                  onClick={() => !isEnterprise && handleSelectPlan(plan.id)}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 shadow-xl scale-105'
                      : isCurrent
                        ? 'border-green-500 shadow-xl'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                  }`}
                >
                  {/* 현재 플랜 배지 */}
                  {isCurrent && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      현재 플랜
                    </div>
                  )}

                  {/* 선택 표시 */}
                  {isSelected && !isCurrent && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* 헤더 */}
                  <div className={`p-6 ${isSelected ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-50'} rounded-t-2xl`}>
                    <div className={`text-center ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className={`text-sm mb-4 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                        {plan.description}
                      </p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-4xl font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {plan.price.monthly === 0 ? '무료' : `₩${plan.price.monthly.toLocaleString()}`}
                        </span>
                        {plan.price.monthly > 0 && (
                          <span className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                            /월
                          </span>
                        )}
                      </div>
                      {plan.price.yearly && plan.price.yearly > 0 && (
                        <p className={`text-xs mt-2 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          연간: ₩{plan.price.yearly.toLocaleString()} (17% 할인)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 본문 */}
                  <div className="p-6">
                    {/* 콘텐츠 제작 기능 */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">콘텐츠 제작</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>
                            프로젝트 {plan.features.contentCreation.maxProjects === -1 ? '무제한' : `${plan.features.contentCreation.maxProjects}개`}
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>
                            AI 단계 {plan.features.contentCreation.maxStepsPerProject}단계
                          </span>
                        </li>
                        {plan.features.contentCreation.platformConversion && (
                          <li className="flex items-center gap-2 text-gray-700">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>플랫폼 변환</span>
                          </li>
                        )}
                        {plan.features.contentCreation.premiumAIModels && (
                          <li className="flex items-center gap-2 text-gray-700">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>프리미엄 AI 모델</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* 관리자 도구 */}
                    {plan.features.adminTools && (
                      <div className="mb-6 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">관리자 도구</h4>
                        <ul className="space-y-2 text-sm">
                          {plan.features.adminTools.electronicSignature && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>전자결재</span>
                            </li>
                          )}
                          {plan.features.adminTools.systemDiagnostics && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>시스템 진단 ({plan.features.adminTools.maxScans === -1 ? '무제한' : `${plan.features.adminTools.maxScans}회/월`})</span>
                            </li>
                          )}
                          {plan.features.adminTools.debugTools && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>디버그 도구</span>
                            </li>
                          )}
                          {plan.features.adminTools.siteCheck && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>사이트 검사</span>
                            </li>
                          )}
                          {plan.features.adminTools.remoteSolution && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>원격 솔루션</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* 바이럴 기능 */}
                    {plan.features.viralFeatures && (
                      <div className="mb-6 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">바이럴 기능</h4>
                        <ul className="space-y-2 text-sm">
                          {plan.features.viralFeatures.hashtagGenerator && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>해시태그 생성기</span>
                            </li>
                          )}
                          {plan.features.viralFeatures.snsScheduler && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>SNS 자동 포스팅</span>
                            </li>
                          )}
                          {plan.features.viralFeatures.shortFormContent && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>숏폼 콘텐츠 생성</span>
                            </li>
                          )}
                          {plan.features.viralFeatures.trendingTopics && (
                            <li className="flex items-center gap-2 text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>트렌딩 주제 추천</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    {isEnterprise ? (
                      <button
                        onClick={() => router.push('/contact')}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                      >
                        문의하기
                      </button>
                    ) : isCurrent ? (
                      <button
                        disabled
                        className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-semibold cursor-not-allowed"
                      >
                        현재 플랜
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? '선택됨' : '플랜 선택'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 업그레이드 버튼 */}
          {selectedPlan && selectedPlan !== currentPlan && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {PRICING_PLANS[selectedPlan].name} 플랜으로 업그레이드
                  </h3>
                  <p className="text-gray-600">
                    월 ₩{PRICING_PLANS[selectedPlan].price.monthly.toLocaleString()}로 모든 기능을 이용하세요
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>처리 중...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5" />
                      <span>업그레이드하기</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                {!isAuthenticated && (
                  <p className="mt-4 text-center text-sm text-gray-600">
                    로그인이 필요합니다. <span className="text-blue-600 font-semibold">로그인</span> 후 업그레이드하세요.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

