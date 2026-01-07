'use client';

import { useState } from 'react';
import { Youtube, FileText, Twitter, Instagram, Sparkles, Copy, Download, RefreshCw, Image as ImageIcon, CheckCircle } from 'lucide-react';

type ContentType = 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';

interface ContentResult {
  success: boolean;
  type: string;
  topic: string;
  content: string;
  timestamp: string;
}

export default function AIContentCreator() {
  const [contentType, setContentType] = useState<ContentType>('youtube-script');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('');
  const [length, setLength] = useState('5분');
  const [targetAudience, setTargetAudience] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const contentTypes = [
    { id: 'youtube-script' as ContentType, name: '유튜브 스크립트', icon: Youtube, description: '5분 영상 스크립트 생성' },
    { id: 'blog-post' as ContentType, name: '블로그 포스트', icon: FileText, description: 'SEO 최적화된 블로그 글' },
    { id: 'sns-post' as ContentType, name: 'SNS 게시물', icon: Twitter, description: '페이스북/링크드인 게시물' },
    { id: 'instagram-caption' as ContentType, name: '인스타그램 캡션', icon: Instagram, description: '트렌디한 인스타 캡션' },
    { id: 'twitter-thread' as ContentType, name: '트위터 스레드', icon: Twitter, description: '바이럴 가능한 스레드' },
  ];

  const handleCreate = async () => {
    if (!topic.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch('/api/content/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: contentType,
          topic,
          style: style || undefined,
          length: contentType === 'youtube-script' ? length : undefined,
          targetAudience: targetAudience || undefined,
          additionalInfo: additionalInfo || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || '콘텐츠 생성 실패';
        const details = errorData.details || '';
        throw new Error(details ? `${errorMessage}\n${details}` : errorMessage);
      }

      const data: ContentResult & { apiInfo?: any } = await response.json();
      setResult(data);
      
      // API 상태 로그
      if (data.apiInfo) {
        console.log('[AIContentCreator] API 상태:', {
          isRealApiCall: data.apiInfo.isRealApiCall,
          hasApiKey: data.apiInfo.hasApiKey,
          message: data.apiInfo.message,
        });
        
        // API 키가 있는데도 실패한 경우 에러 표시
        if (!data.apiInfo.isRealApiCall && data.apiInfo.hasApiKey) {
          setError(data.apiInfo.message || 'API 호출에 실패했습니다. API 키를 확인하세요.');
        }
      }
    } catch (err: any) {
      console.error('[AIContentCreator] 콘텐츠 생성 오류:', err);
      let errorMessage = '콘텐츠 생성 중 오류가 발생했습니다.';
      
      if (err.message) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = '네트워크 연결을 확인해주세요.';
        } else if (err.message.includes('timeout')) {
          errorMessage = '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('API 키')) {
          errorMessage = 'API 키 설정이 필요합니다. 관리자 페이지에서 확인하세요.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result?.content) {
      const blob = new Blob([result.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentType}-${topic}-${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
          AI 콘텐츠 생성
        </h2>
        <p className="text-sm text-gray-600">
          유튜브, 블로그, SNS 콘텐츠를 AI로 생성하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 영역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">콘텐츠 설정</h3>

          {/* 콘텐츠 유형 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              콘텐츠 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      contentType === type.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${contentType === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-sm font-semibold text-gray-900">{type.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 주제 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주제 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: AI로 돈 버는 방법"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* 스타일 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              스타일
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="예: 캐주얼하고 친근하게"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* 길이 (유튜브만) */}
          {contentType === 'youtube-script' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                영상 길이
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option>3분</option>
                <option>5분</option>
                <option>10분</option>
                <option>15분</option>
              </select>
            </div>
          )}

          {/* 대상 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대상 독자
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="예: 20-30대 직장인"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* 추가 정보 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가 요구사항
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="예: 키워드 포함, 특정 포인트 강조 등"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleCreate}
            disabled={isLoading || !topic.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>콘텐츠 생성하기</span>
              </>
            )}
          </button>
        </div>

        {/* 결과 영역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">생성된 콘텐츠</h3>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                  title="복사"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                  title="다운로드"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-sm text-blue-700">
                  <div className="font-semibold mb-1">주제: {result.topic}</div>
                  <div>생성 시간: {new Date(result.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {result.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                콘텐츠를 생성하면 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 수익화 팁 */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-xl font-bold mb-4 text-gray-900">💰 수익화 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="font-semibold text-gray-900 mb-2">📺 유튜브</div>
            <p className="text-sm text-gray-600">
              생성된 스크립트로 영상 제작 후 수익화 설정. 조회수 1,000회당 약 $1-3 수익
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="font-semibold text-gray-900 mb-2">📝 블로그</div>
            <p className="text-sm text-gray-600">
              구글 애드센스, 제휴 마케팅으로 수익화. 월 방문자 10,000명당 약 $50-200 수익
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="font-semibold text-gray-900 mb-2">📱 SNS</div>
            <p className="text-sm text-gray-600">
              인플루언서 마케팅, 제품 홍보로 수익화. 팔로워 10,000명당 약 $100-500 수익
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

