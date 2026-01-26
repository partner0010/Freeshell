"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="로딩 중..." />
      </div>
    );
  }

  // 인증 필요 시 인증되지 않았으면 null (리다이렉트 중)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // 인증 불필요 시 인증되었으면 null (리다이렉트 중)
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
