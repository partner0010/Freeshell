'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Rocket } from 'lucide-react';

const plans = [
  {
    name: '무료',
    price: '0',
    period: '월',
    icon: Sparkles,
    description: '개인 사용자를 위한 기본 기능',
    features: [
      '일일 10회 검색',
      '기본 AI 생성',
      '5개 Spark 작업',
      '커뮤니티 지원',
    ],
    color: 'from-gray-400 to-gray-600',
  },
  {
    name: '프로',
    price: '29',
    period: '월',
    icon: Zap,
    description: '전문가를 위한 고급 기능',
    features: [
      '무제한 검색',
      '고급 AI 생성',
      '무제한 Spark 작업',
      '우선 지원',
      'API 접근',
      '고급 분석 도구',
    ],
    color: 'from-primary to-secondary',
    popular: true,
  },
  {
    name: '엔터프라이즈',
    price: '커스텀',
    period: '',
    icon: Rocket,
    description: '대규모 조직을 위한 맞춤 솔루션',
    features: [
      '모든 프로 기능',
      '전용 인프라',
      '맞춤형 통합',
      '전담 지원',
      'SLA 보장',
      '보안 감사',
      '맞춤형 교육',
    ],
    color: 'from-purple-500 to-pink-500',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            간단한 <span className="gradient-text">가격 정책</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            모든 요구사항에 맞는 플랜을 선택하세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 ${
                  plan.popular
                    ? 'border-primary scale-105 md:scale-110'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      인기
                    </span>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === '커스텀' ? plan.price : `$${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">/{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-blue-50 text-gray-900 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  시작하기
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

