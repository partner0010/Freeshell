"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getSubscription, getInvoices, cancelSubscription, Invoice } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SubscriptionManagementPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sub, invs] = await Promise.all([
        getSubscription().catch(() => null),
        getInvoices().catch(() => []),
      ]);
      setSubscription(sub);
      setInvoices(invs);
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("정말 구독을 취소하시겠습니까? 취소 후에도 현재 결제 기간까지는 사용할 수 있습니다.")) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelSubscription();
      alert("구독이 취소되었습니다.");
      await loadData();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("구독 취소에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="구독 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            구독 관리
          </h1>
          <p className="text-neutral-600">
            현재 구독 정보와 결제 내역을 확인하세요
          </p>
        </div>

        {/* 현재 구독 정보 */}
        {subscription ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{subscription.plan.name} 플랜</CardTitle>
                  <CardDescription className="mt-1">
                    {subscription.plan.price > 0
                      ? `$${subscription.plan.price}/월`
                      : "무료"}
                  </CardDescription>
                </div>
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    subscription.status === "active"
                      ? "bg-success-100 text-success-700"
                      : "bg-neutral-100 text-neutral-700"
                  )}
                >
                  {subscription.status === "active" ? "활성" : subscription.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">시작일</p>
                  <p className="font-medium">
                    {formatDate(subscription.started_at)}
                  </p>
                </div>
                {subscription.expires_at && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">만료일</p>
                    <p className="font-medium">
                      {formatDate(subscription.expires_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* 플랜 기능 */}
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  포함된 기능:
                </p>
                <ul className="space-y-1 text-sm text-neutral-600">
                  <li>
                    {subscription.plan.video_limit === null
                      ? "무제한 영상"
                      : `월 ${subscription.plan.video_limit}개 영상`}
                  </li>
                  <li>최대 {subscription.plan.max_resolution} 해상도</li>
                  <li>
                    {subscription.plan.watermark
                      ? "워터마크 포함"
                      : "워터마크 없음"}
                  </li>
                  {subscription.plan.priority_processing && (
                    <li>우선 처리</li>
                  )}
                  {subscription.plan.api_access && <li>API 접근</li>}
                  {subscription.plan.dedicated_support && (
                    <li>전담 지원</li>
                  )}
                </ul>
              </div>

              {/* 구독 취소 버튼 */}
              {subscription.status === "active" &&
                subscription.plan.price > 0 && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? "처리 중..." : "구독 취소"}
                    </Button>
                  </div>
                )}

              {/* 플랜 업그레이드 */}
              {subscription.plan.type !== "business" && (
                <div className="pt-4 border-t">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => router.push("/pricing")}
                  >
                    플랜 업그레이드
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-600 mb-4">
                활성 구독이 없습니다.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push("/pricing")}
              >
                플랜 선택하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 결제 내역 */}
        <Card>
          <CardHeader>
            <CardTitle>결제 내역</CardTitle>
            <CardDescription>
              지난 결제 내역을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-md"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">
                        {formatCurrency(
                          invoice.amount_paid,
                          invoice.currency
                        )}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {formatDate(invoice.created)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          invoice.status === "paid"
                            ? "bg-success-100 text-success-700"
                            : "bg-error-100 text-error-700"
                        )}
                      >
                        {invoice.status === "paid" ? "완료" : invoice.status}
                      </span>
                      {invoice.hosted_invoice_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(invoice.hosted_invoice_url, "_blank")
                          }
                        >
                          영수증 보기
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-600 py-8">
                결제 내역이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
