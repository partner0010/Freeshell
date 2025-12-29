'use client';

import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Cookie className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            쿠키 <span className="gradient-text">정책</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">최종 업데이트: 2024년 1월 15일</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 space-y-6"
        >
          <section>
            <h2 className="text-2xl font-bold mb-4">쿠키란 무엇인가요?</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              쿠키는 웹사이트가 사용자의 컴퓨터에 저장하는 작은 텍스트 파일입니다. 
              쿠키를 통해 웹사이트는 사용자의 방문 기록, 선호도 등을 기억할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">우리가 사용하는 쿠키</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">필수 쿠키</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  서비스의 기본 기능을 제공하기 위해 필요한 쿠키입니다. 이 쿠키 없이는 서비스를 이용할 수 없습니다.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">성능 쿠키</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  서비스의 성능을 분석하고 개선하기 위해 사용하는 쿠키입니다.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">기능 쿠키</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  사용자의 선호도를 기억하여 더 나은 경험을 제공하기 위한 쿠키입니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">쿠키 관리</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              브라우저 설정을 통해 쿠키를 차단하거나 삭제할 수 있습니다. 
              다만, 필수 쿠키를 차단할 경우 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

