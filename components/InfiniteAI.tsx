'use client';

import { useState, useEffect } from 'react';
import { Infinity, Sparkles, Brain, TrendingUp, Zap, CheckCircle, Star } from 'lucide-react';

export default function InfiniteAI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/infinite-ai');
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
      const res = await fetch('/api/infinite-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.response);
        loadStats();
      }
    } catch (error) {
      console.error('무한 AI 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl p-8 border-2 border-indigo-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Infinity className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900">∞ 무한한 가능성 AI</h2>
              <p className="text-sm text-gray-600">신의 경지에서 스스로 판단하고 개선하는 완전 자율 AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-pink-100 rounded-lg">
            <Star className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">신의 경지 모드</span>
          </div>
        </div>

        {/* 통계 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
              <div className="text-sm text-gray-600 mb-1">진화 사이클</div>
              <div className="text-2xl font-bold text-indigo-600">{stats.evolutionCycles}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
              <div className="text-sm text-gray-600 mb-1">진화 이력</div>
              <div className="text-2xl font-bold text-purple-600">{stats.evolutionHistoryCount}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-pink-200">
              <div className="text-sm text-gray-600 mb-1">자체 지식</div>
              <div className="text-2xl font-bold text-pink-600">{stats.selfKnowledgeCount}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
              <div className="text-sm text-gray-600 mb-1">무한 모드</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.infiniteModeEnabled ? 'ON' : 'OFF'}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
              <div className="text-sm text-gray-600 mb-1">자율 모드</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.autonomousModeEnabled ? 'ON' : 'OFF'}
              </div>
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
              placeholder="무한한 가능성을 가진 AI에게 질문하세요..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none text-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Infinity className="w-5 h-5 animate-spin" />
                  무한 탐색 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  무한 응답 생성
                </>
              )}
            </button>
          </div>
        </form>

        {/* 응답 표시 */}
        {response && (
          <div className="space-y-6">
            {/* 신의 경지 사고 */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                신의 경지 사고
              </h3>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{response.divineLevelThinking}</div>
              </div>
            </div>

            {/* 무한한 가능성 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Infinity className="w-6 h-6 text-blue-600" />
                무한한 가능성
              </h3>
              <ul className="space-y-2">
                {response.infinitePossibilities.map((possibility: string, i: number) => (
                  <li key={i} className="text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 font-bold">{i + 1}.</span>
                    <span>{possibility}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 스스로 생성한 옵션들 */}
            <div className="bg-white rounded-xl p-6 border-2 border-indigo-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-600" />
                스스로 생성한 {response.options.length}가지 구현 옵션
              </h3>
              <div className="space-y-4">
                {response.options.map((option: any, i: number) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border-2 ${
                      option.id === response.selectedOption.id
                        ? 'bg-indigo-50 border-indigo-400'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">
                          {i + 1}. {option.approach}
                          {option.id === response.selectedOption.id && (
                            <span className="ml-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded">
                              선택됨
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{option.reasoning}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">{option.score}</div>
                        <div className="text-xs text-gray-500">점수</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">잠재력:</span>
                        <span className="ml-1 font-semibold text-purple-600">{option.potential}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">실현가능:</span>
                        <span className="ml-1 font-semibold text-blue-600">{option.feasibility}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">혁신성:</span>
                        <span className="ml-1 font-semibold text-pink-600">{option.innovation}%</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-1">강점:</div>
                      <div className="flex flex-wrap gap-1">
                        {option.strengths.map((strength: string, j: number) => (
                          <span key={j} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 스스로 제시한 강점 방향성 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                스스로 제시한 강점 방향성
              </h3>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{response.selfImprovement.improvementDirection}</div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">식별된 강점:</h4>
                <ul className="space-y-1">
                  {response.selfImprovement.identifiedStrengths.map((strength: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 다음 진화 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                다음 진화 단계
              </h3>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{response.selfImprovement.nextEvolution}</div>
              </div>
            </div>

            {/* 자율적 결정 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-600" />
                자율적 결정
              </h3>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{response.autonomousDecision}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

