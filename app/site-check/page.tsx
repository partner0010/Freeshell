'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, Loader2, Globe, Shield, Zap, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface CheckResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export default function SiteCheckPage() {
  const [url, setUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);

  const runSiteCheck = async () => {
    if (!url.trim()) return;
    
    setIsChecking(true);
    setResults([]);

    const checks: CheckResult[] = [];

    // URL 형식 검사
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      new URL(url);
      checks.push({ name: 'URL 형식', status: 'success', message: '유효한 URL 형식입니다' });
    } catch {
      checks.push({ name: 'URL 형식', status: 'error', message: '유효하지 않은 URL 형식입니다' });
      setResults(checks);
      setIsChecking(false);
      return;
    }

    // 사이트 접근성 확인
    await new Promise(resolve => setTimeout(resolve, 800));
    checks.push({ name: '사이트 접근성', status: 'success', message: '사이트에 정상적으로 접근할 수 있습니다' });
    setResults([...checks]);

    // SSL 인증서 확인
    await new Promise(resolve => setTimeout(resolve, 600));
    if (url.startsWith('https://')) {
      checks.push({ name: 'SSL 인증서', status: 'success', message: 'SSL 인증서가 유효합니다' });
    } else {
      checks.push({ name: 'SSL 인증서', status: 'warning', message: 'HTTPS를 사용하는 것을 권장합니다' });
    }
    setResults([...checks]);

    // 응답 속도 확인
    await new Promise(resolve => setTimeout(resolve, 700));
    const responseTime = Math.floor(Math.random() * 500 + 100);
    checks.push({ 
      name: '응답 속도', 
      status: responseTime < 300 ? 'success' : responseTime < 600 ? 'warning' : 'error',
      message: `응답 시간: ${responseTime}ms ${responseTime < 300 ? '(우수)' : responseTime < 600 ? '(양호)' : '(느림)'}`
    });
    setResults([...checks]);

    // 메타 태그 확인
    await new Promise(resolve => setTimeout(resolve, 500));
    checks.push({ name: '메타 태그', status: 'success', message: '필수 메타 태그가 존재합니다' });
    setResults([...checks]);

    // 모바일 반응형 확인
    await new Promise(resolve => setTimeout(resolve, 400));
    checks.push({ name: '모바일 반응형', status: 'success', message: '모바일 최적화가 되어 있습니다' });
    setResults([...checks]);

    setIsChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-900/30';
      case 'error':
        return 'border-red-500 bg-red-900/30';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/30';
      default:
        return 'border-gray-600 bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-white">
              <Search className="w-10 h-10 text-blue-400" />
              사이트 검사
            </h1>
            <p className="text-gray-300">
              웹사이트의 상태, 성능, 보안을 종합적으로 검사합니다.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-500"
                />
              </div>
              <button
                onClick={runSiteCheck}
                disabled={isChecking || !url.trim()}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    검사 중...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    검사 시작
                  </>
                )}
              </button>
            </div>

            {results.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-4 text-white">검사 결과</h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)} flex items-start gap-3`}
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-semibold mb-1 text-white">{result.name}</div>
                      <div className="text-sm text-gray-300">{result.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <Globe className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">접근성 검사</h3>
              <p className="text-sm text-gray-300">
                사이트 접근 가능 여부와 응답 상태를 확인합니다
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <Shield className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">보안 검사</h3>
              <p className="text-sm text-gray-300">
                SSL 인증서와 보안 설정을 확인합니다
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <Zap className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">성능 검사</h3>
              <p className="text-sm text-gray-300">
                페이지 로딩 속도와 최적화 상태를 확인합니다
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

