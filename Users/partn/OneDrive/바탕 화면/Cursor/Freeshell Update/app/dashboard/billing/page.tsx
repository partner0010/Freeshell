'use client';

import { motion } from 'framer-motion';
import { CreditCard, Receipt, Calendar, Download } from 'lucide-react';

const invoices = [
  {
    id: 'INV-2024-001',
    date: '2024-01-15',
    amount: 29,
    status: 'paid',
    plan: '프로',
  },
  {
    id: 'INV-2024-002',
    date: '2023-12-15',
    amount: 29,
    status: 'paid',
    plan: '프로',
  },
];

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">청구</h1>
          <p className="text-gray-600 dark:text-gray-400">구독 및 결제 내역을 관리하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">현재 구독</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-semibold">프로 플랜</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">$29/월</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">다음 결제일</p>
                <p className="font-semibold">2024-02-15</p>
              </div>
            </div>
            <button className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              플랜 변경
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Receipt className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">결제 내역</h2>
          </div>
          <div className="space-y-4">
            {invoices.map((invoice, index) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold">{invoice.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">${invoice.amount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.plan}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

