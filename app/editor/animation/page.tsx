/**
 * 애니메이션 에디터 페이지
 */
'use client';

import { AuthRequired } from '@/components/AuthRequired';
import { useAuth } from '@/lib/hooks/useAuth';
import AnimationEditor from '@/components/AnimationEditor';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnimationEditorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/editor/animation');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthRequired />;
  }

  return (
    <div className="h-screen flex flex-col">
      <AnimationEditor />
    </div>
  );
}
