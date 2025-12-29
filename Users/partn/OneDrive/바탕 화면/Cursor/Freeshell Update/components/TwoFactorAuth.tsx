'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { showSuccess, showError } from './ToastNotifications';

export default function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');

  const handleEnable = async () => {
    setIsSettingUp(true);
    try {
      // 실제로는 API 호출하여 QR 코드 생성
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQrCode('data:image/png;base64,placeholder'); // 실제 QR 코드
      setStep('verify');
    } catch (error) {
      showError('2FA 설정에 실패했습니다.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;

    try {
      // 실제로는 API 호출하여 코드 검증
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEnabled(true);
      setStep('complete');
      showSuccess('2단계 인증이 활성화되었습니다.');
    } catch (error) {
      showError('인증 코드가 올바르지 않습니다.');
    }
  };

  const handleDisable = async () => {
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEnabled(false);
      setStep('setup');
      setQrCode(null);
      setVerificationCode('');
      showSuccess('2단계 인증이 비활성화되었습니다.');
    } catch (error) {
      showError('2FA 비활성화에 실패했습니다.');
    }
  };

  if (isEnabled && step === 'complete') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">2단계 인증 활성화됨</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">계정 보안이 강화되었습니다</p>
            </div>
          </div>
          <button
            onClick={handleDisable}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
          >
            비활성화
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-xl font-bold">2단계 인증 (2FA)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            추가 보안 계층으로 계정을 보호하세요
          </p>
        </div>
      </div>

      {step === 'setup' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-semibold mb-2">2단계 인증이란?</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 로그인 시 비밀번호 외 추가 인증 코드 필요</li>
              <li>• 인증 앱(Google Authenticator 등) 사용</li>
              <li>• 계정 보안 강화</li>
            </ul>
          </div>
          <button
            onClick={handleEnable}
            disabled={isSettingUp}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isSettingUp ? '설정 중...' : '2FA 활성화'}
          </button>
        </div>
      )}

      {step === 'verify' && qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              1. 인증 앱에서 QR 코드를 스캔하세요
            </p>
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <span className="text-gray-400 text-sm">QR 코드</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              2. 인증 앱에 표시된 6자리 코드를 입력하세요
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={verificationCode.length !== 6}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            인증 확인
          </button>
        </motion.div>
      )}
    </div>
  );
}

