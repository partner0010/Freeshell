'use client';

import { Sparkles, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-white">Shell</span>
            </div>
            <p className="text-sm text-gray-400">
              혁신적인 AI 기반 검색 엔진으로 실시간 맞춤형 정보를 제공합니다.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">제품</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="hover:text-primary transition-colors">기능</Link></li>
              <li><Link href="#search" className="hover:text-primary transition-colors">AI 검색</Link></li>
              <li><Link href="#spark" className="hover:text-primary transition-colors">Spark 워크스페이스</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">가격</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">회사</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">소개</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">블로그</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">연락처</Link></li>
              <li><Link href="/help" className="hover:text-primary transition-colors">도움말</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">법적 고지</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">개인정보 보호정책</Link></li>
              <li><Link href="/legal/terms" className="hover:text-primary transition-colors">이용약관</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-primary transition-colors">쿠키 정책</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2024 Shell. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

