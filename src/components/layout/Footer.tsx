'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Shield, Mail, Github, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* 브랜드 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">Freeshell</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
              AI로 만드는 수익형 콘텐츠. 숏폼, 영상, 이미지, 전자책, 글쓰기까지 완전 자동화
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:admin@freeshell.co.kr"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="이메일"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* 법적 문서 */}
          <div>
            <h4 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Shield size={16} className="sm:w-[18px] sm:h-[18px]" />
              법적 문서
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                  aria-label="개인정보 처리방침"
                >
                  <FileText size={12} className="sm:w-[14px] sm:h-[14px]" />
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                  aria-label="이용약관"
                >
                  <FileText size={12} className="sm:w-[14px] sm:h-[14px]" />
                  이용약관
                </Link>
              </li>
            </ul>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/creator" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded" aria-label="콘텐츠 생성">
                  콘텐츠 생성
                </Link>
              </li>
              <li>
                <Link href="/editor" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded" aria-label="에디터">
                  에디터
                </Link>
              </li>
              <li>
                <Link href="/signature" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded" aria-label="전자서명">
                  전자서명
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded" aria-label="도움말">
                  도움말
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
              <p>© {currentYear} Freeshell. All rights reserved.</p>
              <p className="mt-1 text-xs">
                본 서비스는 OpenAI API를 사용합니다. 
                <a
                  href="https://openai.com/policies/terms-of-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 ml-1 inline-flex items-center gap-1"
                >
                  OpenAI 약관 <ExternalLink size={12} />
                </a>
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>문의: admin@freeshell.co.kr</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

