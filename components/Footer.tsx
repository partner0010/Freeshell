'use client';

import Link from 'next/link';
import { Heart, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* 브랜드 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Shell</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              개인의 것이기도 하지만<br />
              모두의 것이기도 합니다
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-4 h-4" />
              <span>모두를 위한 오픈 플랫폼</span>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">빠른 링크</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                  관리자
                </Link>
              </li>
              <li>
                <Link href="/content-guide" className="text-gray-600 hover:text-gray-900 transition-colors">
                  콘텐츠 제작 가이드
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 문서 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">법적 문서</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                  개인정보 보호정책
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-600 hover:text-gray-900 transition-colors">
                  쿠키 정책
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-gray-100 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} Shell. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>for everyone</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
