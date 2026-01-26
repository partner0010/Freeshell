"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
};

type NavigationProps = {
  items: NavItem[];
  className?: string;
};

export default function Navigation({ items, className }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className={cn("space-y-1", className)} role="navigation" aria-label="주요 네비게이션">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors duration-fast w-full text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60",
              isActive
                ? "bg-primary-500 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            {item.icon && <span className="text-base" aria-hidden="true">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// 플랫폼 표준 네비게이션 아이템
export const PLATFORM_NAV_ITEMS: NavItem[] = [
  { label: "대시보드", href: "/dashboard", icon: "📊" },
  { label: "스튜디오", href: "/create", icon: "🎨" },
  { label: "라이브러리", href: "/library", icon: "📚" },
  { label: "피드", href: "/feed", icon: "🌐" },
  { label: "전문가", href: "/experts", icon: "👥" },
  { label: "쿠폰", href: "/coupons", icon: "🎁" },
];
