"use client";

import * as React from "react";

type NavLink = {
  label: string;
  href: string;
};

type LandingLayoutProps = {
  brand?: string;
  navLinks?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  hero: React.ReactNode;
  features: React.ReactNode;
  pricing: React.ReactNode;
  footer: React.ReactNode;
};

export default function LandingLayout({
  brand = "Freeshell",
  navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ],
  ctaLabel = "시작하기",
  ctaHref = "#",
  hero,
  features,
  pricing,
  footer,
}: LandingLayoutProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 투명 헤더 (스크롤 시 배경색) */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-shadow duration-normal ease-out ${
          scrolled ? "bg-white/95 shadow-sm backdrop-blur-sm" : "bg-transparent"
        }`}
        role="banner"
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#"
            className="text-heading font-heading font-bold text-neutral-900 transition-colors duration-fast hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2"
          >
            {brand}
          </a>
          <nav
            className="hidden items-center gap-6 md:flex"
            role="navigation"
            aria-label="주요 네비게이션"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-body text-neutral-600 transition-colors duration-fast hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href={ctaHref}
            className="rounded-sm bg-primary-500 px-4 py-2 text-body font-semibold text-white shadow-sm transition-colors duration-fast hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2"
          >
            {ctaLabel}
          </a>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main role="main">
        {/* Hero 섹션 */}
        <section
          className="px-4 py-20 sm:px-6 lg:px-8"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto max-w-content">{hero}</div>
        </section>

        {/* Feature 섹션 */}
        <section
          id="features"
          className="bg-neutral-50 px-4 py-20 sm:px-6 lg:px-8"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-content">{features}</div>
        </section>

        {/* Pricing 섹션 */}
        <section
          id="pricing"
          className="px-4 py-20 sm:px-6 lg:px-8"
          aria-labelledby="pricing-heading"
        >
          <div className="mx-auto max-w-content">{pricing}</div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="border-t border-neutral-200 bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8"
        role="contentinfo"
      >
        <div className="mx-auto max-w-content">{footer}</div>
      </footer>
    </div>
  );
}
