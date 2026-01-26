"use client";

import * as React from "react";
import Navigation, { type NavItem } from "@/components/Navigation";

type DashboardLayoutProps = {
  title?: string;
  navItems: NavItem[];
  userMenuSlot?: React.ReactNode;
  notificationSlot?: React.ReactNode;
  children: React.ReactNode;
};

export default function DashboardLayout({
  title = "Dashboard",
  navItems,
  userMenuSlot,
  notificationSlot,
  children,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        {/* 데스크탑 사이드바 */}
        <aside
          className="hidden w-64 flex-col border-r border-neutral-200 bg-white p-6 lg:flex"
          aria-label="주요 네비게이션"
        >
          <div className="mb-6 text-lg font-heading font-bold text-neutral-900">{title}</div>
          <Navigation items={navItems} />
        </aside>

        {/* 모바일 사이드바 오버레이 */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-overlay bg-neutral-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              className="fixed left-0 top-0 z-modal h-full w-64 bg-white p-6 shadow-lg lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="모바일 메뉴"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="text-lg font-heading font-bold text-neutral-900">{title}</div>
                <button
                  type="button"
                  className="rounded-sm p-2 text-sm text-neutral-500 transition-colors duration-fast hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
                  onClick={() => setMobileOpen(false)}
                  aria-label="사이드바 닫기"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
              <nav className="space-y-1" role="navigation" aria-label="대시보드 메뉴">
                <Navigation items={navItems} />
              </nav>
            </aside>
          </>
        )}

        {/* 메인 콘텐츠 영역 */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* 헤더 */}
          <header
            className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 shadow-sm lg:px-6"
            role="banner"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-sm p-2 text-sm text-neutral-500 transition-colors duration-fast hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="사이드바 열기"
                aria-expanded={mobileOpen}
                aria-controls="mobile-sidebar"
              >
                <span aria-hidden="true">☰</span>
              </button>
              <span className="text-body font-semibold text-neutral-900">{title}</span>
            </div>
            <div className="flex items-center gap-3" role="toolbar" aria-label="사용자 메뉴">
              {notificationSlot}
              {userMenuSlot}
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 px-4 py-6 lg:px-6" role="main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
