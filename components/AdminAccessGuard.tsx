/**
 * 관리자 기능 접근 가드 컴포넌트
 * 플랜 제한 확인 및 업그레이드 프롬프트 표시
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UpgradePrompt from './UpgradePrompt';
import { PRICING_PLANS } from '@/lib/models/PricingPlan';
import { Loader2 } from 'lucide-react';

interface AdminAccessGuardProps {
  toolId: 'systemDiagnostics' | 'debugTools' | 'siteCheck' | 'remoteSolution';
  children: React.ReactNode;
  toolName: string;
  requiredPlan?: 'personal' | 'pro' | 'enterprise';
}

export default function AdminAccessGuard({
  toolId,
  children,
  toolName,
  requiredPlan = 'personal',
}: AdminAccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // 세션 확인
      const sessionResponse = await fetch('/api/auth/session');
      if (!sessionResponse.ok) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      const sessionData = await sessionResponse.json();
      if (!sessionData.authenticated || !sessionData.user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      const userPlan = sessionData.user.plan;
      setCurrentPlan(userPlan);

      // 플랜 제한 확인
      const accessResponse = await fetch(`/api/admin/check-access?toolId=${toolId}`);
      if (accessResponse.ok) {
        const accessData = await accessResponse.json();
        if (accessData.hasAccess) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setShowUpgradePrompt(true);
        }
      } else {
        setHasAccess(false);
        setShowUpgradePrompt(true);
      }
    } catch (error) {
      console.error('접근 확인 실패:', error);
      setHasAccess(false);
      setShowUpgradePrompt(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">접근 권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <UpgradePrompt
          title={`${toolName} 사용 권한 필요`}
          message={`${toolName} 기능은 ${PRICING_PLANS[requiredPlan].name} 플랜 이상에서만 사용할 수 있습니다. 현재 플랜: ${PRICING_PLANS[currentPlan as 'free' | 'personal' | 'pro' | 'enterprise'].name}`}
          requiredPlan={requiredPlan}
          onClose={() => router.push('/pricing')}
          showComparison={true}
        />
      </div>
      </>
    );
  }

  return <>{children}</>;
}

