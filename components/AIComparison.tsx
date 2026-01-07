'use client';

import { useState } from 'react';
import { GitCompare, TrendingUp, Award, Zap, Brain, Sparkles, CheckCircle, XCircle, Minus } from 'lucide-react';
import { AVAILABLE_AIS, AIProvider } from '@/lib/ai-comparison';

export default function AIComparison() {
  const [prompt, setPrompt] = useState('');
  const [selectedAIs, setSelectedAIs] = useState<AIProvider[]>(['chatgpt', 'claude', 'gemini', 'cursor', 'our']);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || selectedAIs.length === 0) return;

    setLoading(true);
    setComparison(null);

    try {
      const res = await fetch('/api/ai-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, selectedAIs }),
      });

      const data = await res.json();
      if (data.success) {
        setComparison(data.comparison);
      }
    } catch (error) {
      console.error('AI 비교 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAI = (aiId: AIProvider) => {
    if (selectedAIs.includes(aiId)) {
      setSelectedAIs(selectedAIs.filter(id => id !== aiId));
    } else {
      setSelectedAIs([...selectedAIs, aiId]);
    }
  };

  const getWinnerIcon = (winner: string) => {
    if (winner === 'our') return <Award className="w-5 h-5 text-green-600" />;
    if (winner === 'cursor') return <Award className="w-5 h-5 text-blue-600" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getWinnerText = (winner: string) => {
    if (winner === 'our') return '우리 AI 승리';
    if (winner === 'cursor') return 'Cursor AI 승리';
    return '무승부';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 border-2 border-blue-200">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <GitCompare className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">AI 비교 분석</h2>
            <p className="text-sm text-gray-600">여러 AI를 선택하여 나란히 비교 분석</p>
          </div>
        </div>

        {/* AI 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">비교할 AI 선택:</label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_AIS.map((ai) => {
              const isSelected = selectedAIs.includes(ai.id);
              return (
                <button
                  key={ai.id}
                  type="button"
                  onClick={() => toggleAI(ai.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    isSelected
                      ? `bg-${ai.color}-100 border-${ai.color}-300 text-${ai.color}-700 font-semibold`
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{ai.icon}</span>
                  <span>{ai.name}</span>
                  {isSelected && <CheckCircle className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
          {selectedAIs.length === 0 && (
            <p className="text-sm text-red-600 mt-2">최소 1개 이상의 AI를 선택해주세요.</p>
          )}
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleCompare} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="비교할 질문을 입력하세요..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none text-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Zap className="w-5 h-5 animate-spin" />
                  비교 중...
                </>
              ) : (
                <>
                  <GitCompare className="w-5 h-5" />
                  AI 비교
                </>
              )}
            </button>
          </div>
        </form>

        {/* 비교 결과 */}
        {comparison && (
          <div className="space-y-6">
            {/* 각 AI의 실제 답변 */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                각 AI의 실제 답변
              </h3>
              <div className="space-y-4">
                {comparison.selectedAIs && comparison.selectedAIs.map((aiId: string) => {
                  const response = comparison.responses?.[aiId as AIProvider];
                  const aiInfo = AVAILABLE_AIS.find(a => a.id === aiId);
                  if (!response || !aiInfo) return null;
                  
                  return (
                    <div key={aiId} className={`rounded-lg p-4 border-2 ${
                      aiId === 'our' 
                        ? 'bg-indigo-50 border-indigo-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{aiInfo.icon}</span>
                        <h4 className="font-bold text-gray-900">{aiInfo.name}</h4>
                        <span className="text-xs text-gray-500 ml-auto">
                          응답 시간: {response.responseTime}ms
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 bg-white rounded p-3 border border-gray-200">
                          {response.response}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {comparison.responses?.our && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ 다른 AI들의 답변을 우리 AI에게 학습시켰습니다. 다음번에는 더 나은 답변을 제공할 수 있습니다.
                  </p>
                </div>
              )}
            </div>

            {/* 종합 점수 */}
            <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                종합 점수
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border-2 ${
                  comparison.overallWinner === 'cursor' 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-sm text-gray-600 mb-1">Cursor AI</div>
                  <div className="text-3xl font-bold text-blue-600">{comparison.score.cursor}점</div>
                </div>
                <div className={`p-4 rounded-lg border-2 ${
                  comparison.overallWinner === 'our' 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-sm text-gray-600 mb-1">우리 AI</div>
                  <div className="text-3xl font-bold text-green-600">{comparison.score.our}점</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
                  {getWinnerIcon(comparison.overallWinner)}
                  <span className="font-bold text-gray-900">
                    {getWinnerText(comparison.overallWinner)}
                  </span>
                </div>
              </div>
            </div>

            {/* 항목별 비교 */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                항목별 비교
              </h3>
              <div className="space-y-4">
                {Object.entries(comparison.comparison).map(([key, value]: [string, any]) => (
                  <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 capitalize">{key}</h4>
                      {getWinnerIcon(value.winner)}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cursor AI</span>
                        <span className="font-bold text-blue-600">{value.cursor}{key === 'responseTime' ? 'ms' : '점'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">우리 AI</span>
                        <span className="font-bold text-green-600">{value.our}{key === 'responseTime' ? 'ms' : '점'}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>승자:</span>
                      <span className="font-semibold">{getWinnerText(value.winner)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 강점 비교 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Cursor AI 강점
                </h3>
                <ul className="space-y-2">
                  {comparison.strengths.cursor.map((strength: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  우리 AI 강점
                </h3>
                <ul className="space-y-2">
                  {comparison.strengths.our.map((strength: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 약점 비교 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Cursor AI 약점
                </h3>
                <ul className="space-y-2">
                  {comparison.weaknesses.cursor.map((weakness: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-yellow-600" />
                  우리 AI 약점
                </h3>
                <ul className="space-y-2">
                  {comparison.weaknesses.our.map((weakness: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 고유 기능 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Cursor AI 고유 기능
                </h3>
                <ul className="space-y-2">
                  {comparison.uniqueFeatures.cursor.map((feature: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  우리 AI 고유 기능
                </h3>
                <ul className="space-y-2">
                  {comparison.uniqueFeatures.our.map((feature: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <Brain className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 상세 분석 */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-gray-600" />
                상세 분석
              </h3>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{comparison.detailedAnalysis}</div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

