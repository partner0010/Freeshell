'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            이용 <span className="gradient-text">약관</span>
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
            <h2 className="text-2xl font-bold mb-4">제1조 (목적)</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              본 약관은 Shell(이하 &quot;회사&quot;)가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">제2조 (정의)</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>&quot;서비스&quot;란 회사가 제공하는 AI 기반 검색 엔진 및 관련 서비스를 의미합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</li>
              <li>&quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">제3조 (약관의 효력 및 변경)</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.
              회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 전항과 같은 방법으로 공지함으로써 효력을 발생합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">제4조 (서비스의 제공 및 변경)</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              회사는 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>AI 기반 검색 서비스</li>
              <li>Spark 워크스페이스</li>
              <li>AI 드라이브</li>
              <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 일체의 서비스</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

