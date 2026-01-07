'use client';

import { useState, useEffect } from 'react';
import { Cpu, Brain, Zap, CheckCircle, AlertCircle, Activity } from 'lucide-react';

export default function RealAI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isRealAI, setIsRealAI] = useState(false);

  // 통계 로드
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/real-ai');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/real-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.response);
        setIsRealAI(data.isRealAI);
        loadStats(); // 통계 업데이트
      }
    } catch (error) {
      console.error('실제 AI 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-xl p-8 border-2 border-green-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">⚡ 실제 구동 AI</h2>
              <p className="text-sm text-gray-600">겉할기 식이 아닌 실제로 작동하는 AI 시스템</p>
            </div>
          </div>
          {isRealAI && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">실제 구동 중</span>
            </div>
          )}
        </div>

        {/* 통계 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-1">총 요청</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalRequests}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-1">성공률</div>
              <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-1">학습 패턴</div>
              <div className="text-2xl font-bold text-green-600">{stats.learnedPatternsCount}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-1">학습 반복</div>
              <div className="text-2xl font-bold text-green-600">{stats.learningIterations}</div>
            </div>
          </div>
        )}

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="실제 구동되는 AI에게 질문하세요..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none text-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  구동 중...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  실제 AI 실행
                </>
              )}
            </button>
          </div>
        </form>

        {/* 응답 표시 */}
        {response && (
          <div className="space-y-4">
            {/* 메인 응답 */}
            <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">실제 AI 응답</h3>
                <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  신뢰도: {(response.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{response.text}</div>
              </div>
            </div>

            {/* 추론 과정 */}
            {response.reasoning && (
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  실제 추론 과정
                </h3>
                <div className="whitespace-pre-wrap text-gray-700 text-sm">{response.reasoning}</div>
              </div>
            )}

            {/* 소스 정보 */}
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">실제 모델:</span>
                  <span className="ml-2 font-semibold text-gray-900">{response.actualModel}</span>
                </div>
                <div>
                  <span className="text-gray-600">응답 시간:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {response.responseTime > 0 
                      ? `${response.responseTime.toFixed(2)}초`
                      : '즉시'}
                  </span>
                </div>
                {response.tokensUsed && (
                  <div>
                    <span className="text-gray-600">사용 토큰:</span>
                    <span className="ml-2 font-semibold text-gray-900">{response.tokensUsed}</span>
                  </div>
                )}
                {response.sources && response.sources.length > 0 && (
                  <div>
                    <span className="text-gray-600">소스:</span>
                    <span className="ml-2 font-semibold text-gray-900">{response.sources.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 실제 구동 확인 */}
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  이 응답은 실제 구동되는 AI 시스템을 통해 생성되었습니다.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ollama 설치 안내 */}
        {!isRealAI && (
          <div className="mt-6 bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">Ollama 설치 안내</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  실제 로컬 AI 모델을 사용하려면 Ollama를 설치하세요:
                </p>
                <code className="block bg-yellow-100 p-2 rounded text-xs text-yellow-900 mb-2">
                  # Windows: https://ollama.ai/download<br/>
                  # 설치 후: ollama pull llama2
                </code>
                <p className="text-xs text-yellow-600">
                  Ollama가 없어도 실제 추론 엔진이 작동합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

