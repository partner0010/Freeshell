'use client';

import { useState } from 'react';
import { Trophy, TrendingUp, Zap, Brain, Award, BarChart3 } from 'lucide-react';

export default function AIBenchmark() {
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleBenchmark = async () => {
    setLoading(true);
    setBenchmark(null);

    try {
      const res = await fetch('/api/ai-benchmark');
      const data = await res.json();
      if (data.success) {
        setBenchmark(data.comparison);
      }
    } catch (error) {
      console.error('벤치마크 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-300';
    if (score >= 80) return 'bg-blue-50 border-blue-300';
    if (score >= 70) return 'bg-yellow-50 border-yellow-300';
    return 'bg-red-50 border-red-300';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border-2 border-purple-200">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">AI 벤치마크 및 비교</h2>
            <p className="text-sm text-gray-600">우리 AI vs 다른 AI들 - 종합 성능 비교</p>
          </div>
        </div>

        {/* 벤치마크 실행 버튼 */}
        <button
          onClick={handleBenchmark}
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
        >
          {loading ? (
            <>
              <Zap className="w-5 h-5 animate-spin" />
              벤치마크 실행 중...
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5" />
              AI 벤치마크 실행
            </>
          )}
        </button>

        {/* 벤치마크 결과 */}
        {benchmark && (
          <div className="space-y-6">
            {/* 종합 순위 */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                종합 순위
              </h3>
              <div className="space-y-3">
                {[benchmark.ourAI, ...benchmark.others]
                  .sort((a: any, b: any) => b.score - a.score)
                  .map((ai: any, index: number) => (
                    <div
                      key={ai.aiName}
                      className={`p-4 rounded-lg border-2 ${
                        ai.aiName === benchmark.ourAI.aiName
                          ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-700' :
                            index === 2 ? 'bg-orange-300 text-orange-700' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{ai.aiName}</div>
                            {ai.aiName === benchmark.ourAI.aiName && (
                              <div className="text-xs text-purple-600 font-semibold">우리 AI</div>
                            )}
                          </div>
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(ai.score)}`}>
                          {ai.score}점
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 우리 AI 상세 점수 */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                우리 AI 상세 점수
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(benchmark.ourAI.metrics).map(([key, value]: [string, any]) => (
                  <div key={key} className={`p-4 rounded-lg border-2 ${getScoreBg(value)}`}>
                    <div className="text-sm text-gray-600 mb-1 capitalize">{key}</div>
                    <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                      {Math.round(value)}점
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 항목별 비교 */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                항목별 비교
              </h3>
              <div className="space-y-4">
                {Object.entries(benchmark.comparison.detailedComparison.metrics).map(([key, value]: [string, any]) => (
                  <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 capitalize">{key}</h4>
                      <div className="text-sm text-gray-600">
                        최고: {value.best}점
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">우리 AI</span>
                          <span className={`font-bold ${getScoreColor(value.our)}`}>
                            {Math.round(value.our)}점
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              value.our >= 90 ? 'bg-green-500' :
                              value.our >= 80 ? 'bg-blue-500' :
                              value.our >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${value.our}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 강점 비교 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">우리 AI 강점</h3>
                <ul className="space-y-2">
                  {benchmark.ourAI.strengths.map((strength: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <Award className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">개선 필요 사항</h3>
                <ul className="space-y-2">
                  {benchmark.ourAI.weaknesses.map((weakness: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

