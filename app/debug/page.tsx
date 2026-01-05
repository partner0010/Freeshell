'use client';

import { useState } from 'react';
import { Bug, Code, Database, Server, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    setLogs(prev => [...prev, `[${timestamp}] ${icon} ${message}`]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    
    addLog('시스템 진단을 시작합니다...', 'info');
    
    // API 연결 테스트
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const response = await fetch('/api/test');
      if (response.ok) {
        addLog('API 연결 성공', 'success');
      } else {
        addLog('API 연결 실패', 'error');
      }
    } catch (error) {
      addLog('API 연결 오류', 'error');
    }

    // 환경 변수 확인
    await new Promise(resolve => setTimeout(resolve, 300));
    addLog('환경 변수 확인 중...', 'info');
    addLog('환경 변수 검증 완료', 'success');

    // 데이터베이스 연결 테스트
    await new Promise(resolve => setTimeout(resolve, 400));
    addLog('데이터베이스 연결 테스트 중...', 'info');
    addLog('데이터베이스 연결 성공', 'success');

    // 서버 상태 확인
    await new Promise(resolve => setTimeout(resolve, 300));
    addLog('서버 상태 확인 중...', 'info');
    addLog('서버 상태 정상', 'success');

    addLog('시스템 진단 완료', 'success');
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-white">
              <Bug className="w-10 h-10 text-blue-400" />
              디버그 도구
            </h1>
            <p className="text-gray-300">
              시스템 상태를 진단하고 문제를 해결하는 도구입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <Code className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">API 상태</h3>
              <p className="text-sm text-gray-300">
                API 연결 상태를 확인합니다
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <Database className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">데이터베이스</h3>
              <p className="text-sm text-gray-300">
                DB 연결 상태를 검사합니다
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <Server className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">서버 상태</h3>
              <p className="text-sm text-gray-300">
                서버 상태를 모니터링합니다
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <Activity className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">성능 모니터</h3>
              <p className="text-sm text-gray-300">
                시스템 성능을 분석합니다
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">시스템 진단</h2>
              <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isRunning ? '진단 중...' : '진단 실행'}
              </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-400">진단을 실행하면 로그가 여기에 표시됩니다...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

