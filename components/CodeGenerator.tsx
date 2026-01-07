'use client';

import { useState } from 'react';
import { Code, Sparkles, Copy, Check, Loader2, Terminal } from 'lucide-react';

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [framework, setFramework] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch('/api/ai/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language, framework }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setResult({ error: data.error || '코드 생성 실패' });
      }
    } catch (error: any) {
      setResult({ error: error.message || '코드 생성 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.code) {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI 코드 생성기</h2>
            <p className="text-sm text-gray-600">개발자처럼 코드를 생성하고 설명합니다</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              코드 요구사항
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: React로 사용자 로그인 폼 컴포넌트를 만들어줘"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                프로그래밍 언어
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="react">React</option>
                <option value="nextjs">Next.js</option>
                <option value="nodejs">Node.js</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                프레임워크 (선택사항)
              </label>
              <input
                type="text"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                placeholder="예: React, Express, Django"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                코드 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                코드 생성
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{result.error}</p>
              </div>
            ) : (
              <>
                {/* API 상태 */}
                {result.apiInfo && (
                  <div className={`p-3 rounded-lg border ${
                    result.apiInfo.isRealApiCall 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-2 text-sm">
                      {result.apiInfo.isRealApiCall ? (
                        <>
                          <span className="text-green-600 font-semibold">✅ 실제 AI API 사용</span>
                          <span className="text-gray-500">- 전문 개발자 수준의 코드 생성</span>
                        </>
                      ) : (
                        <>
                          <span className="text-yellow-600 font-semibold">⚠️ 시뮬레이션 모드</span>
                          <span className="text-gray-500">- GOOGLE_API_KEY를 설정하세요</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 생성된 코드 */}
                <div className="bg-gray-900 rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400 font-mono">{result.language}</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          복사
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-gray-100 overflow-x-auto">
                    <code>{result.code}</code>
                  </pre>
                </div>

                {/* 설명 */}
                {result.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      코드 설명
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {result.explanation}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

