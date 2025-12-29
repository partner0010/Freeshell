'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            개인정보 <span className="gradient-text">보호정책</span>
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
            <h2 className="text-2xl font-bold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Shell은 서비스 제공을 위해 다음과 같은 개인정보를 수집 및 이용합니다:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>서비스 제공 및 계약 이행</li>
              <li>회원 관리 및 본인 확인</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
              <li>고객 문의 및 불만 처리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. 수집하는 개인정보 항목</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              회원가입 및 서비스 이용 시 다음 정보를 수집합니다:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>필수 항목: 이메일, 비밀번호, 이름</li>
              <li>선택 항목: 프로필 사진, 연락처</li>
              <li>자동 수집: IP 주소, 쿠키, 접속 로그</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Shell은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

