'use client';

import { useState } from 'react';
import { Phone, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceCall() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'scheduled' | 'error'>('idle');

  const handleScheduleCall = async () => {
    if (!phoneNumber.trim() || !purpose.trim()) return;

    setIsCalling(true);
    setCallStatus('idle');

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          purpose,
        }),
      });

      if (!response.ok) {
        throw new Error('전화 예약 실패');
      }

      const data = await response.json();
      setCallStatus('scheduled');
    } catch (err) {
      setCallStatus('error');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Phone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI 기반 전화 통화</h2>
          <p className="text-gray-600 dark:text-gray-400">현실적인 음성으로 자동 통화</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            전화번호
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="010-1234-5678"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isCalling}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            통화 목적
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="예: 레스토랑 예약, 고객 문의 응답"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isCalling}
          />
        </div>

        <button
          onClick={handleScheduleCall}
          disabled={isCalling || !phoneNumber.trim() || !purpose.trim()}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isCalling ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>통화 예약 중...</span>
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              <span>통화 예약</span>
            </>
          )}
        </button>

        <AnimatePresence>
          {callStatus === 'scheduled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-600 dark:text-green-400">통화가 예약되었습니다!</span>
            </motion.div>
          )}

          {callStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2"
            >
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-600 dark:text-red-400">통화 예약 중 오류가 발생했습니다.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

