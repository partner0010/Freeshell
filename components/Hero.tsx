'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">완전 무료 - 모든 기능 무료 제공</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Shell</span>
            <br />
            올인원 AI 플랫폼
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 완전 무료 AI 솔루션
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary-dark transition-all transform hover:scale-105 flex items-center">
              지금 바로 시작하기
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <div className="px-6 py-3 bg-green-50 text-green-700 rounded-lg text-base font-semibold border-2 border-green-200">
              💯 완전 무료
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16"
          >
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-pink-500 rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="무엇을 검색하고 싶으신가요?"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg text-gray-900"
                    />
                  </div>
                  <button className="px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                    검색
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  예: &quot;파리 여행 계획&quot;, &quot;최신 AI 기술 동향&quot;, &quot;건강한 식단 계획&quot;
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

