/**
 * AI 해시태그 생성기 컴포넌트
 */
'use client';

import { useState } from 'react';
import { Hash, Copy, Check, RefreshCw, Loader2, TrendingUp, Sparkles } from 'lucide-react';

type Platform = 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin';

interface HashtagResult {
  trending: string[];
  niche: string[];
  branded: string[];
  suggestions: string[];
  explanation: string;
}

export default function HashtagGenerator() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const platforms = [
    { id: 'instagram' as Platform, name: '인스타그램', icon: Hash },
    { id: 'twitter' as Platform, name: '트위터', icon: Hash },
    { id: 'tiktok' as Platform, name: '틱톡', icon: Hash },
    { id: 'youtube' as Platform, name: '유튜브', icon: Hash },
    { id: 'linkedin' as Platform, name: '링크드인', icon: Hash },
  ];

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('콘텐츠를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/hashtags/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platform,
          topic: topic || undefined,
          targetAudience: targetAudience || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '해시태그 생성 실패');
      }

      const data = await response.json();
      setResult(data.hashtags);
    } catch (err: any) {
      setError(err.message || '해시태그 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllHashtags = () => {
    if (!result) return;
    const allHashtags = [
      ...result.trending,
      ...result.niche,
      ...result.branded,
      ...result.suggestions,
    ].join(' ');
    handleCopy(allHashtags, 'all');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI 해시태그 생성기
          </h2>
          <p className="text-gray-600">
            콘텐츠를 입력하면 최적의 해시태그를 자동으로 생성해드립니다
          </p>
        </div>

        {/* 입력 폼 */}
        <div className="space-y-6">
          {/* 콘텐츠 입력 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              콘텐츠 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="콘텐츠나 게시글 내용을 입력하세요..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900 resize-none"
            />
          </div>

          {/* 플랫폼 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              플랫폼 *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      platform === p.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 mx-auto ${platform === p.id ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div className={`text-xs font-semibold ${platform === p.id ? 'text-purple-900' : 'text-gray-900'}`}>
                      {p.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 추가 정보 (선택사항) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                주제 (선택사항)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 기술, 요리, 여행"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                타겟 독자 (선택사항)
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="예: 20-30대 여성"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900"
              />
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !content.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>해시태그 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>해시태그 생성하기</span>
              </>
            )}
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* 결과 표시 */}
      {result && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* 설명 */}
          {result.explanation && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-sm text-purple-700">{result.explanation}</p>
            </div>
          )}

          {/* 전체 복사 버튼 */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">생성된 해시태그</h3>
            <button
              onClick={copyAllHashtags}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              {copied === 'all' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>전체 복사</span>
                </>
              )}
            </button>
          </div>

          {/* 트렌딩 해시태그 */}
          {result.trending.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold text-gray-900">🔥 트렌딩 해시태그</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.trending.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopy(tag, `trending-${idx}`)}
                    className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-100 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    {copied === `trending-${idx}` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 니치 해시태그 */}
          {result.niche.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">🎯 니치 해시태그</h4>
              <div className="flex flex-wrap gap-2">
                {result.niche.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopy(tag, `niche-${idx}`)}
                    className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    {copied === `niche-${idx}` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 브랜드 해시태그 */}
          {result.branded.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">⭐ 브랜드 해시태그</h4>
              <div className="flex flex-wrap gap-2">
                {result.branded.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopy(tag, `branded-${idx}`)}
                    className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    {copied === `branded-${idx}` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 추가 제안 */}
          {result.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">💡 추가 제안</h4>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopy(tag, `suggestion-${idx}`)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    {copied === `suggestion-${idx}` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 재생성 버튼 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleGenerate}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>다시 생성하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

