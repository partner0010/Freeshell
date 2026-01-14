/**
 * STEP 2: freeshell 에디터 UI 통합
 * 숏폼 생성 기능을 기존 에디터에 통합
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Film, Loader2, Download, Play } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthRequired from '@/components/AuthRequired';
import EnhancedNavbar from '@/components/EnhancedNavbar';

export default function ShortformStudioPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'realistic' | 'anime' | 'cartoon'>('anime');
  const [duration, setDuration] = useState<15 | 30 | 60>(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <AuthRequired />;
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setJobId(null);
    setJobStatus(null);

    try {
      const response = await fetch('/api/studio/shortform/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: prompt,
          style,
          duration,
          userId: user.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setJobId(data.jobId);
        // 작업 상태 폴링 시작
        pollJobStatus(data.jobId);
      } else {
        alert('생성 실패: ' + (data.error || 'Unknown error'));
        setIsGenerating(false);
      }
    } catch (error: any) {
      alert('생성 중 오류: ' + error.message);
      setIsGenerating(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/studio/shortform/job/${jobId}/status`);
        const status = await response.json();
        
        setJobStatus(status);
        
        if (status.status === 'completed') {
          clearInterval(interval);
          setIsGenerating(false);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setIsGenerating(false);
          alert('생성 실패: ' + (status.error || 'Unknown error'));
        }
      } catch (error) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 2000); // 2초마다 폴링
  };

  const handleDownload = () => {
    if (jobId) {
      window.open(`/api/studio/shortform/job/${jobId}/download`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <EnhancedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Film className="w-10 h-10" />
              숏폼 스튜디오
            </h1>
            <p className="text-gray-300">AI로 쉽고 빠르게 숏폼 영상을 만들어보세요</p>
          </div>

          {/* 생성 폼 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <div className="space-y-4">
              {/* 프롬프트 입력 */}
              <div>
                <label className="block text-white font-medium mb-2">
                  영상 내용을 설명해주세요
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="예: 고양이가 요리를 하는 숏폼"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                />
              </div>

              {/* 스타일 선택 */}
              <div>
                <label className="block text-white font-medium mb-2">
                  스타일
                </label>
                <div className="flex gap-4">
                  {(['realistic', 'anime', 'cartoon'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        style === s
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {s === 'realistic' ? '현실적' : s === 'anime' ? '애니메이션' : '만화'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 길이 선택 */}
              <div>
                <label className="block text-white font-medium mb-2">
                  영상 길이
                </label>
                <div className="flex gap-4">
                  {[15, 30, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d as 15 | 30 | 60)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        duration === d
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {d}초
                    </button>
                  ))}
                </div>
              </div>

              {/* 생성 버튼 */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    영상 생성하기
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 작업 상태 */}
          {jobStatus && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
              <h2 className="text-white font-bold mb-4">생성 상태</h2>
              
              {/* 진행률 */}
              <div className="mb-4">
                <div className="flex justify-between text-white mb-2">
                  <span>{jobStatus.currentStep || '처리 중'}</span>
                  <span>{jobStatus.progress || 0}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${jobStatus.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* 완료 시 다운로드 버튼 */}
              {jobStatus.status === 'completed' && (
                <button
                  onClick={handleDownload}
                  className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  영상 다운로드
                </button>
              )}

              {/* 실패 시 메시지 */}
              {jobStatus.status === 'failed' && (
                <div className="text-red-400">
                  오류: {jobStatus.error || 'Unknown error'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
