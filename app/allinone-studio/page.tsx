/**
 * 올인원 스튜디오 메인 페이지
 * 숏폼 스튜디오로 리다이렉트
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AllInOneStudioPage() {
  const router = useRouter();

  useEffect(() => {
    // 숏폼 스튜디오로 리다이렉트
    router.push('/studio/shortform');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
        <p className="text-white">올인원 스튜디오로 이동 중...</p>
      </div>
    </div>
  );
}
