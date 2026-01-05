'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 mb-8 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>완전 무료</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shell
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI 검색, 콘텐츠 생성, 원격 지원까지<br />
            모든 것을 하나로 통합한 무료 AI 플랫폼
          </p>
        </motion.div>
      </div>
    </section>
  );
}
