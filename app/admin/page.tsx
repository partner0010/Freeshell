'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  FileSignature, 
  Activity, 
  Bug, 
  SearchCheck, 
  Cloud,
  ArrowLeft,
  Shield
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const adminTools = [
  {
    id: 'signature',
    title: '전자결재',
    description: '전자서명 및 문서 승인 관리 시스템',
    href: '/signature',
    icon: FileSignature,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'diagnostics',
    title: '시스템 진단',
    description: 'URL/코드 보안 분석, 취약점 검사, API 키 노출 검사',
    href: '/diagnostics',
    icon: Activity,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'debug',
    title: '디버그 도구',
    description: '코드 분석, 버그 검사, 성능 최적화 제안',
    href: '/debug',
    icon: Bug,
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 'site-check',
    title: '사이트 검사',
    description: '사이트 구성 분석, 모듈 감지, 모의해킹 시나리오',
    href: '/site-check',
    icon: SearchCheck,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'remote-solution',
    title: '원격 솔루션',
    description: '인터넷 전용 원격 접속 (프로그램 설치 불필요)',
    href: '/remote-solution',
    icon: Cloud,
    color: 'from-red-500 to-red-600',
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              관리자 페이지
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              시스템 관리 및 진단 도구에 접근할 수 있습니다
            </p>
          </div>

          {/* 관리 도구 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {adminTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {tool.description}
                  </p>

                  <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    접근하기
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <Settings className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              관리자 전용 기능
            </h3>
            <p className="text-gray-700 text-sm max-w-2xl mx-auto">
              이 페이지의 모든 도구는 시스템 관리 및 진단을 위한 것입니다. 
              일반 사용자에게는 표시되지 않습니다.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
