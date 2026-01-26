"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";
import { PLATFORM_NAV_ITEMS } from "@/components/Navigation";
import { Gift, CheckCircle, XCircle, Calendar, Loader2, Search } from "lucide-react";

interface CouponUsage {
  id: string;
  coupon_code: string;
  coupon_name: string;
  used_at: string;
  applied_value: number;
  result_type: string;
  result_data?: any;
}

export default function CouponsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [myCoupons, setMyCoupons] = useState<CouponUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsing, setIsUsing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadMyCoupons();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadMyCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/coupon/my-coupons", {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyCoupons(data.usages || []);
      }
    } catch (error) {
      console.error("Failed to load coupons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      alert("쿠폰 코드를 입력해주세요");
      return;
    }

    setIsUsing(true);
    try {
      const response = await fetch("/api/coupon/use", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "쿠폰이 성공적으로 사용되었습니다");
        setCouponCode("");
        loadMyCoupons();
      } else {
        alert(data.detail || "쿠폰 사용에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to use coupon:", error);
      alert("쿠폰 사용 중 오류가 발생했습니다");
    } finally {
      setIsUsing(false);
    }
  };

  const getResultTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      subscription_extended: "구독 연장",
      credit_added: "크레딧 추가",
      discount_applied: "할인 적용",
      plan_upgraded: "플랜 업그레이드",
    };
    return labels[type] || type;
  };

  if (authLoading) {
    return (
      <DashboardLayout navItems={PLATFORM_NAV_ITEMS} title="쿠폰">
        <div className="space-y-6">
          <Skeleton height={60} />
          <SkeletonCard />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={PLATFORM_NAV_ITEMS} title="쿠폰">
      <div className="space-y-6">
        {/* 쿠폰 사용 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>쿠폰 사용</CardTitle>
            <CardDescription>쿠폰 코드를 입력하여 사용하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUseCoupon} className="flex gap-2">
              <Input
                placeholder="쿠폰 코드 입력 (예: WELCOME2024)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 font-mono"
                disabled={isUsing}
              />
              <Button type="submit" disabled={isUsing || !couponCode.trim()}>
                {isUsing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    사용 중...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    사용하기
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 내 쿠폰 사용 내역 */}
        <Card>
          <CardHeader>
            <CardTitle>사용 내역</CardTitle>
            <CardDescription>사용한 쿠폰 내역을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : myCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">사용한 쿠폰이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myCoupons.map((usage) => (
                  <Card key={usage.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold font-mono">{usage.coupon_code}</h3>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{usage.coupon_name}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(usage.used_at).toLocaleString("ko-KR")}</span>
                            </div>
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">
                              {getResultTypeLabel(usage.result_type)}
                            </span>
                          </div>
                          {usage.result_data?.message && (
                            <p className="text-sm text-primary-600 mt-2">
                              {usage.result_data.message}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary-600">
                            {usage.applied_value > 0 && (
                              <>
                                {usage.result_type === "credit_added" && "+"}
                                {usage.result_type === "discount_applied" && "-"}
                                {usage.result_type === "subscription_extended" && "+"}
                                {usage.applied_value.toLocaleString()}
                                {usage.result_type === "credit_added" && " 크레딧"}
                                {usage.result_type === "discount_applied" && "원"}
                                {usage.result_type === "subscription_extended" && "일"}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
