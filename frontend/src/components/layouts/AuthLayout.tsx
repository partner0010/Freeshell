"use client";

import * as React from "react";

type AuthLayoutProps = {
  title?: string;
  subtitle?: string;
  illustrationSlot?: React.ReactNode;
  children: React.ReactNode;
  footerSlot?: React.ReactNode;
};

export default function AuthLayout({
  title = "환영합니다",
  subtitle = "계정에 로그인하거나 새 계정을 만들어 주세요.",
  illustrationSlot,
  children,
  footerSlot,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto grid min-h-screen max-w-content grid-cols-1 lg:grid-cols-2">
        {/* 좌측: 일러스트레이션 영역 */}
        <aside
          className="hidden items-center justify-center bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-transparent p-8 lg:flex"
          aria-label="일러스트레이션"
        >
          <div className="w-full max-w-md space-y-6 text-center">
            {illustrationSlot ?? (
              <div className="rounded-xl border border-dashed border-primary-200 bg-white/80 p-12 text-sm text-neutral-500 shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-primary-500/20" />
                  <p>Illustration Placeholder</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-heading font-heading font-bold text-neutral-900">Freeshell Update</h2>
              <p className="text-body text-neutral-600">보안과 편의성을 동시에 제공합니다.</p>
            </div>
          </div>
        </aside>

        {/* 우측: 폼 영역 */}
        <section className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-heading font-heading font-bold text-neutral-900">{title}</h1>
              <p className="text-body text-neutral-600">{subtitle}</p>
            </div>
            <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-md">
              {children}
            </div>
            {footerSlot ? (
              <div className="text-center text-body text-neutral-500">{footerSlot}</div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
