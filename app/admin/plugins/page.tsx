/**
 * 플러그인 관리 페이지
 */
'use client';

import { AuthRequired } from '@/components/AuthRequired';
import { useAuth } from '@/lib/hooks/useAuth';
import PluginManager from '@/components/PluginManager';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PluginsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <AuthRequired />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <PluginManager />
      </div>
    </div>
  );
}
