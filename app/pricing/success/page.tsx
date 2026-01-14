/**
 * 결제 성공 페이지
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PricingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradedPlan, setUpgradedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('세션 ID가 없습니다.');
      setIsVerifying(false);
      return;
    }

    // 결제 확인
    verifyPayment();
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyPayment = async () => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '결제 확인에 실패했습니다.');
      }

      setIsSuccess(true);
      setUpgradedPlan(data.user?.plan || null);
      
      // 세션 새로고침을 위해 페이지 리다이렉트
      setTimeout(() => {
        router.push('/projects');
        router.refresh();
      }, 3000);
    } catch (err: any) {
      setError(err.message || '결제 확인 중 오류가 발생했습니다.');
      setIsSuccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 확인 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
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
        <div className="max-w-2xl mx-auto">
          {isSuccess ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-green-500 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                결제가 완료되었습니다! 🎉
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {upgradedPlan && (
                  <span className="font-semibold text-blue-600">
                    {upgradedPlan === 'personal' ? '개인' : upgradedPlan === 'pro' ? '프로' : '엔터프라이즈'} 플랜
                  </span>
                )}으로 업그레이드되었습니다.
              </p>
              <p className="text-gray-600 mb-8">
                이제 모든 기능을 이용하실 수 있습니다.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/projects"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>내 프로젝트로 이동</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/admin"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  관리자 페이지
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                3초 후 자동으로 프로젝트 페이지로 이동합니다...
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-red-500 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                결제 확인 실패
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {error || '결제 확인 중 오류가 발생했습니다.'}
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/pricing"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>가격 페이지로 돌아가기</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  고객 지원
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

