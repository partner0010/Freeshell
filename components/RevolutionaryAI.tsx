'use client';

import { useState } from 'react';
import { Sparkles, Lightbulb, Rocket, Brain, Zap } from 'lucide-react';

export default function RevolutionaryAI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'revolutionary' | 'solve' | 'creative'>('revolutionary');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/revolutionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.response);
      }
    } catch (error) {
      console.error('독보적 AI 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl shadow-xl p-8 border-2 border-purple-200">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">🚀 독보적인 AI</h2>
            <p className="text-sm text-gray-600">다른 어떤 AI와도 비교할 수 없는 독특하고 혁신적인 AI</p>
          </div>
        </div>

        {/* 모드 선택 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('revolutionary')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === 'revolutionary'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Rocket className="w-4 h-4 inline mr-2" />
            독보적 응답
          </button>
          <button
            onClick={() => setMode('solve')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === 'solve'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Brain className="w-4 h-4 inline mr-2" />
            문제 해결
          </button>
          <button
            onClick={() => setMode('creative')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === 'creative'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Lightbulb className="w-4 h-4 inline mr-2" />
            창의성
          </button>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="독보적인 AI에게 질문하세요..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Zap className="w-5 h-5 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  독보적 응답
                </>
              )}
            </button>
          </div>
        </form>

        {/* 응답 표시 */}
        {response && (
          <div className="space-y-6">
            {/* 메인 응답 */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: response.text.replace(/\n/g, '<br>') }} />
              </div>
            </div>

            {/* 통찰 */}
            {response.insights && response.insights.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  혁신적 통찰
                </h3>
                <ul className="space-y-2">
                  {response.insights.map((insight: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">{i + 1}.</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 창의적 아이디어 */}
            {response.creativeIdeas && response.creativeIdeas.length > 0 && (
              <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-pink-600" />
                  창의적 아이디어
                </h3>
                <ul className="space-y-2">
                  {response.creativeIdeas.map((idea: string, i: number) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <span className="text-pink-600 font-bold">{i + 1}.</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 독보적 관점 */}
            {response.uniquePerspective && (
              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-purple-600" />
                  독보적인 관점
                </h3>
                <p className="text-gray-700">{response.uniquePerspective}</p>
              </div>
            )}

            {/* 혁신 수준 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-200">
                <div className="text-sm text-gray-600 mb-1">혁신 수준</div>
                <div className="text-3xl font-bold text-purple-600">{response.innovationLevel}%</div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-4 border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">독창성</div>
                <div className="text-3xl font-bold text-blue-600">{response.originality}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

