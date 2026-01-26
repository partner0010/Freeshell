"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LandingLayout from "@/components/layouts/LandingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <LandingLayout
      brand="Freeshell"
      navLinks={[
        { label: "기능", href: "#features" },
        { label: "요금제", href: "#pricing" },
        { label: "문의", href: "#contact" },
      ]}
      ctaLabel={isAuthenticated ? "대시보드" : "시작하기"}
      ctaHref={isAuthenticated ? "/dashboard" : "/login"}
      hero={
        <div className="text-center space-y-8 py-12">
          <div className="space-y-4 animate-fade-in">
            <h1
              id="hero-heading"
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 leading-tight"
            >
              차세대
              <br />
              <span className="text-primary-600">콘텐츠 플랫폼</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto">
              생성부터 유통, 전문가 도움, 수익화까지
              <br />
              모든 것이 하나의 생태계로 연결됩니다
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-6 h-auto"
            >
              무료로 시작하기
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/create")}
              className="text-lg px-8 py-6 h-auto"
            >
              스튜디오 둘러보기
            </Button>
          </div>
        </div>
      }
      features={
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 id="features-heading" className="text-4xl font-bold text-neutral-900">
              완전한 콘텐츠 생태계
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              단순한 AI 도구가 아닌, 콘텐츠 제작부터 수익화까지의 완전한 플랫폼
            </p>
          </div>

          {/* 생태계 흐름 */}
          <div className="relative py-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
              {[
                { icon: "🎬", title: "생성", desc: "AI 기반 콘텐츠 제작" },
                { icon: "📤", title: "유통", desc: "커뮤니티와 공유" },
                { icon: "👨‍💼", title: "전문가", desc: "도움받기" },
                { icon: "💰", title: "수익", desc: "콘텐츠로 수익 창출" },
              ].map((step, index) => (
                <React.Fragment key={step.title}>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="text-5xl mb-2">{step.icon}</div>
                    <h3 className="text-xl font-semibold text-neutral-900">{step.title}</h3>
                    <p className="text-sm text-neutral-600 max-w-[150px]">{step.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block text-2xl text-neutral-300 mx-2">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 주요 기능 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🎨",
                title: "스튜디오",
                description: "AI Orchestrator 기반의 강력한 콘텐츠 제작 도구",
                features: ["프롬프트 분석", "자동 계획 생성", "다양한 콘텐츠 타입"],
                href: "/create",
              },
              {
                icon: "📚",
                title: "라이브러리",
                description: "내 콘텐츠를 체계적으로 관리하고 분석",
                features: ["프로젝트 관리", "에셋 라이브러리", "성능 분석"],
                href: "/library",
              },
              {
                icon: "🌐",
                title: "피드",
                description: "커뮤니티와 콘텐츠를 공유하고 발견",
                features: ["인기 콘텐츠", "팔로우 시스템", "댓글 및 좋아요"],
                href: "/feed",
              },
              {
                icon: "👥",
                title: "전문가",
                description: "필요할 때 전문가의 도움을 받으세요",
                features: ["전문가 매칭", "원격 지원", "커스텀 서비스"],
                href: "/experts",
              },
              {
                icon: "💵",
                title: "수익화",
                description: "콘텐츠로 수익을 창출하고 성장",
                features: ["구독 모델", "광고 수익", "전문가 수수료"],
                href: "/dashboard",
              },
              {
                icon: "🔄",
                title: "순환 생태계",
                description: "모든 기능이 하나로 연결된 생태계",
                features: ["자동 공유", "추천 시스템", "성장 지원"],
                href: "/dashboard",
              },
            ].map((feature) => (
              <Card 
                key={feature.title} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => feature.href && router.push(feature.href)}
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="text-sm text-neutral-600 flex items-center gap-2">
                        <span className="text-primary-500">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {feature.href && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(feature.href!);
                        }}
                      >
                        바로가기 →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
      pricing={
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 id="pricing-heading" className="text-4xl font-bold text-neutral-900">
              간단한 요금제
            </h2>
            <p className="text-lg text-neutral-600">
              필요에 맞는 플랜을 선택하세요
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/pricing")}
            >
              전체 요금제 보기
            </Button>
          </div>
        </div>
      }
      footer={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Freeshell</h3>
            <p className="text-sm text-neutral-600">
              차세대 콘텐츠 플랫폼
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">제품</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <a href="/create" className="hover:text-primary-600">
                  스튜디오
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-primary-600">
                  대시보드
                </a>
              </li>
              <li>
                <a href="/feed" className="hover:text-primary-600">
                  피드
                </a>
              </li>
              <li>
                <a href="/experts" className="hover:text-primary-600">
                  전문가
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-primary-600">
                  요금제
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">리소스</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <a href="#" className="hover:text-primary-600">
                  문서
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  지원
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">회사</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <a href="#" className="hover:text-primary-600">
                  소개
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  블로그
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  문의
                </a>
              </li>
            </ul>
          </div>
        </div>
      }
    />
  );
}
