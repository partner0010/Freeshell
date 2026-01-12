/**
 * 제작 완료 후 다음 단계 안내 페이지
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Download,
  Globe,
  Code,
  Share2,
  Zap,
  ArrowRight,
  Sparkles,
  Rocket,
  ExternalLink,
} from 'lucide-react';

export default function BuildCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setProjectId(id);
    }
  }, [searchParams]);

  const nextSteps = [
    {
      title: '에디터에서 수정하기',
      description: '생성된 웹사이트를 더 세밀하게 편집하고 개선하세요',
      icon: Code,
      href: `/editor${projectId ? `?id=${projectId}` : ''}`,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: '다운로드하기',
      description: '완성된 웹사이트를 ZIP 파일로 다운로드하세요',
      icon: Download,
      href: '#',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: '배포하기',
      description: 'Netlify, Vercel 등으로 바로 배포하세요',
      icon: Rocket,
      href: '#',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: '공유하기',
      description: '친구들과 프로젝트를 공유하세요',
      icon: Share2,
      href: '#',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const recommendedSites = [
    {
      name: 'Vercel',
      description: '즉시 배포, 무료 호스팅',
      url: 'https://vercel.com',
      icon: Globe,
    },
    {
      name: 'Netlify',
      description: '간편한 정적 사이트 호스팅',
      url: 'https://netlify.com',
      icon: Globe,
    },
    {
      name: 'GitHub Pages',
      description: '무료 GitHub 호스팅',
      url: 'https://pages.github.com',
      icon: Code,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* 성공 메시지 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            웹사이트 생성 완료!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            축하합니다! AI가 요청하신 웹사이트를 성공적으로 생성했습니다.
            이제 다음 단계를 진행해보세요.
          </p>
        </div>

        {/* 다음 단계 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            다음 단계
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Link
                  key={index}
                  href={step.href}
                  className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${step.color} rounded-xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                    <span>시작하기</span>
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 추천 배포 사이트 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            추천 배포 사이트
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendedSites.map((site, index) => {
              const Icon = site.icon;
              return (
                <a
                  key={index}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {site.name}
                    </h3>
                    <p className="text-sm text-gray-600">{site.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </a>
              );
            })}
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="mt-12 text-center">
          <Link
            href="/build"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
          >
            <Zap className="w-5 h-5" />
            새로운 웹사이트 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
