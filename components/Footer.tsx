'use client';

import Link from 'next/link';
import { Heart, Users, Code, Sparkles, Zap, Globe, Shield, FileText, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Shell 소개 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Shell</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              <strong className="text-white">코드 작성 없이</strong> 웹사이트와 앱을 쉽고 간단하게 만들 수 있는 플랫폼입니다. 
              AI의 도움을 받을 수도 있지만, <strong className="text-white">템플릿과 에디터만으로도 충분히</strong> 원하는 웹사이트를 만들 수 있습니다.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>완전 무료</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Code className="w-4 h-4 text-blue-400" />
                <span>코드 없이 제작</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Globe className="w-4 h-4 text-green-400" />
                <span>즉시 배포</span>
              </div>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              빠른 링크
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/build/step1" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span>웹사이트/앱 만들기</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/editor" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span>에디터</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/templates/website" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span>템플릿 갤러리</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span>콘텐츠 템플릿</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span>Shell 소개</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 문서 */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              법적 문서
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <FileText className="w-4 h-4" />
                  <span>개인정보 보호정책</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <FileText className="w-4 h-4" />
                  <span>이용약관</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <FileText className="w-4 h-4" />
                  <span>쿠키 정책</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/license" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <FileText className="w-4 h-4" />
                  <span>라이선스</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} Shell. All rights reserved. 
              <span className="ml-2 text-gray-500">모든 기능을 무료로 제공합니다.</span>
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>for everyone</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
