/**
 * 관리자 전용 네비게이션 링크
 * 관리자로 로그인한 경우에만 표시
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { checkAuth } from '@/lib/utils/auth-check';

export default function AdminNavLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(authState => {
      setIsAdmin(authState.user?.role === 'admin');
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
    >
      <Settings className="w-5 h-5" />
      <span>관리자</span>
    </Link>
  );
}
