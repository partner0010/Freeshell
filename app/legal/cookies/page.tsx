'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Cookie, Settings, Shield } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
              <Cookie className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              쿠키 정책
            </h1>
            <p className="text-gray-600">
              최종 업데이트: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* 본문 */}
          <div className="prose prose-gray max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Cookie className="w-6 h-6 text-blue-600" />
                1. 쿠키란?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                쿠키는 웹사이트가 사용자의 컴퓨터나 모바일 기기에 저장하는 작은 텍스트 파일입니다. 쿠키는 웹사이트가 사용자의 방문 정보를 기억하고, 사용자 경험을 개선하는 데 도움을 줍니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                2. 쿠키의 사용 목적
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 다음과 같은 목적으로 쿠키를 사용합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>필수 쿠키</strong>: 서비스의 기본 기능을 제공하기 위해 필요한 쿠키</li>
                <li><strong>성능 쿠키</strong>: 서비스의 성능을 분석하고 개선하기 위한 쿠키</li>
                <li><strong>기능 쿠키</strong>: 사용자 설정 및 선호도를 기억하기 위한 쿠키</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 사용하는 쿠키의 종류</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">필수 쿠키</h3>
                <p className="text-gray-700 text-sm mb-2">
                  이러한 쿠키는 서비스의 기본 기능을 제공하는 데 필수적입니다. 쿠키를 비활성화하면 일부 서비스를 이용할 수 없습니다.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                  <li>세션 관리 쿠키</li>
                  <li>보안 쿠키</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">선택적 쿠키</h3>
                <p className="text-gray-700 text-sm mb-2">
                  이러한 쿠키는 서비스의 성능을 향상시키고 사용자 경험을 개선하는 데 도움을 줍니다.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                  <li>분석 쿠키 (Google Analytics 등)</li>
                  <li>사용자 설정 쿠키</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                4. 쿠키 관리 방법
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                사용자는 웹 브라우저 설정을 통해 쿠키를 관리할 수 있습니다. 대부분의 브라우저는 쿠키를 자동으로 허용하도록 설정되어 있지만, 사용자는 쿠키 설정을 변경하여 쿠키를 차단하거나 삭제할 수 있습니다.
              </p>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">주요 브라우저 쿠키 설정 방법</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                  <li><strong>Chrome</strong>: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</li>
                  <li><strong>Firefox</strong>: 설정 &gt; 개인정보 보호 &gt; 쿠키 및 사이트 데이터</li>
                  <li><strong>Safari</strong>: 환경설정 &gt; 개인정보 보호 &gt; 쿠키 및 웹 사이트 데이터</li>
                  <li><strong>Edge</strong>: 설정 &gt; 쿠키 및 사이트 권한</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 쿠키 사용에 대한 동의</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스를 이용함으로써 사용자는 본 쿠키 정책에 명시된 대로 쿠키의 사용에 동의하는 것으로 간주됩니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                사용자는 언제든지 쿠키 설정을 변경하여 쿠키 사용을 거부할 수 있습니다. 다만, 필수 쿠키를 비활성화하면 일부 서비스를 이용할 수 없을 수 있습니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 쿠키 정책의 변경</h2>
              <p className="text-gray-700 leading-relaxed">
                서비스는 법령, 정책 또는 보안기술의 변경에 따라 본 쿠키 정책을 수정할 수 있습니다. 변경 사항은 본 페이지에 게시되며, 중요한 변경 사항의 경우 별도로 공지할 수 있습니다.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
