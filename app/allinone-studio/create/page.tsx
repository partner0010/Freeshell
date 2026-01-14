/**
 * 올인원 스튜디오 - 콘텐츠 생성 페이지
 */
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthRequired from '@/components/AuthRequired';
import { Sparkles, Loader2, Play, Check } from 'lucide-react';

type ContentType = 'shortform' | 'video' | 'animation' | 'movie';

interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
}

export default function CreateContentPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get('type') || 'shortform') as ContentType;

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'story', name: '스토리 & 스크립트 생성', status: 'pending' },
    { id: 'character', name: '캐릭터 생성', status: 'pending' },
    { id: 'scene', name: '장면 구성', status: 'pending' },
    { id: 'animation', name: '애니메이션 & 표현', status: 'pending' },
    { id: 'voice', name: '음성 & 음악 생성', status: 'pending' },
    { id: 'render', name: '렌더링', status: 'pending' },
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthRequired />;
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      // 각 단계별로 순차 실행
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // 단계 상태 업데이트
        setSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'processing' } : s
        ));

        // API 호출
        const response = await fetch('/api/allinone-studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            prompt,
            step: step.id,
            previousResults: steps.slice(0, i).map(s => s.result).filter(Boolean),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          setSteps(prev => prev.map((s, idx) => 
            idx === i 
              ? { ...s, status: 'completed', result: data.result }
              : s
          ));
        } else {
          setSteps(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'error' } : s
          ));
          break;
        }

        // 다음 단계로 넘어가기 전 약간의 딜레이
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 모든 단계 완료 후 프로젝트 페이지로 이동
      const projectId = `project-${Date.now()}`;
      router.push(`/allinone-studio/project/${projectId}`);
    } catch (error) {
      console.error('생성 오류:', error);
      alert('콘텐츠 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          콘텐츠 생성
        </h1>

        {/* 프롬프트 입력 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <label className="block text-sm font-semibold mb-2">
            무엇을 만들고 싶으신가요?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 행복한 고양이가 춤추는 숏폼 영상을 만들어주세요"
            className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isGenerating}
          />
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span>AI가 자동으로 스토리, 캐릭터, 장면을 생성합니다</span>
          </div>
        </div>

        {/* 생성 단계 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold mb-6">생성 단계</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {step.status === 'completed' && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                  {step.status === 'processing' && (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  )}
                  {step.status === 'pending' && (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-500"></div>
                  )}
                  {step.status === 'error' && (
                    <div className="w-6 h-6 rounded-full bg-red-500"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  {step.status === 'processing' && (
                    <div className="text-sm text-gray-400">처리 중...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              콘텐츠 생성 시작
            </>
          )}
        </button>
      </div>
    </div>
  );
}
