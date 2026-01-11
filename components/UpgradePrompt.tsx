/**
 * 업그레이드 프롬프트 컴포넌트
 * 유료 기능 접근 시 업그레이드 안내
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Crown, X, ArrowRight, Check } from 'lucide-react';
import { PRICING_PLANS, type PlanType } from '@/lib/models/PricingPlan';

interface UpgradePromptProps {
  title: string;
  message: string;
  requiredPlan?: PlanType;
  feature?: string;
  onClose?: () => void;
  showComparison?: boolean;
}

export default function UpgradePrompt({
  title,
  message,
  requiredPlan = 'personal',
  feature,
  onClose,
  showComparison = true,
}: UpgradePromptProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const requiredPlanData = PRICING_PLANS[requiredPlan];
  const plans = ['free', 'personal', 'pro', 'enterprise'] as PlanType[];
  const planIndex = plans.indexOf(requiredPlan);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-sm opacity-90">{message}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6">
          {/* 필수 플랜 정보 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {requiredPlanData.name} 플랜 필요
                </h3>
                <p className="text-gray-700">{requiredPlanData.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  ₩{requiredPlanData.price.monthly.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">/월</div>
                {requiredPlanData.price.yearly && (
                  <div className="text-sm text-green-600 mt-1">
                    연간: ₩{requiredPlanData.price.yearly.toLocaleString()} (17% 할인)
                  </div>
                )}
              </div>
            </div>
            <Link
              href={`/pricing?plan=${requiredPlan}&feature=${feature || ''}`}
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-center hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>업그레이드하기</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* 플랜 비교 */}
          {showComparison && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">플랜 비교</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {plans.slice(0, planIndex + 2).map((planId) => {
                  const plan = PRICING_PLANS[planId];
                  const isRequired = planId === requiredPlan;
                  const isCurrent = false; // TODO: 현재 플랜 확인
                  
                  return (
                    <div
                      key={planId}
                      className={`rounded-xl p-4 border-2 ${
                        isRequired
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">{plan.name}</h4>
                        {isCurrent && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            현재
                          </span>
                        )}
                        {isRequired && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                            권장
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        ₩{plan.price.monthly.toLocaleString()}
                        <span className="text-sm text-gray-600 font-normal">/월</span>
                      </div>
                      {feature && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm">
                            {plan.features.contentCreation[feature as keyof typeof plan.features.contentCreation] ? (
                              <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">포함</span>
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 text-red-600" />
                                <span className="text-gray-500">미포함</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 주요 기능 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{requiredPlanData.name} 플랜 주요 기능</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 콘텐츠 제작 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">콘텐츠 제작</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>프로젝트 {requiredPlanData.features.contentCreation.maxProjects === -1 ? '무제한' : `${requiredPlanData.features.contentCreation.maxProjects}개`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>AI 단계 {requiredPlanData.features.contentCreation.maxStepsPerProject}단계</span>
                  </li>
                  {requiredPlanData.features.contentCreation.platformConversion && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>플랫폼 변환</span>
                    </li>
                  )}
                  {requiredPlanData.features.contentCreation.premiumAIModels && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>프리미엄 AI 모델</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* 관리자 도구 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">관리자 도구</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {requiredPlanData.features.adminTools.electronicSignature && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>전자결재</span>
                    </li>
                  )}
                  {requiredPlanData.features.adminTools.systemDiagnostics && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>시스템 진단 ({requiredPlanData.features.adminTools.maxScans === -1 ? '무제한' : `${requiredPlanData.features.adminTools.maxScans}회/월`})</span>
                    </li>
                  )}
                  {requiredPlanData.features.adminTools.debugTools && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>디버그 도구</span>
                    </li>
                  )}
                  {requiredPlanData.features.adminTools.siteCheck && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>사이트 검사 ({requiredPlanData.features.adminTools.maxScans === -1 ? '무제한' : `${requiredPlanData.features.adminTools.maxScans}회/월`})</span>
                    </li>
                  )}
                  {requiredPlanData.features.adminTools.remoteSolution && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>원격 솔루션 ({requiredPlanData.features.adminTools.maxRemoteSessions === -1 ? '무제한' : `${requiredPlanData.features.adminTools.maxRemoteSessions}회/월`})</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              질문이 있으신가요? <Link href="/contact" className="text-blue-600 hover:underline">고객 지원팀</Link>에 문의하세요.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                나중에
              </button>
              <Link
                href={`/pricing?plan=${requiredPlan}`}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                업그레이드하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

