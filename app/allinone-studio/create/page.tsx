/**
 * 올인원 스튜디오 - 콘텐츠 생성 페이지
 */
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthRequired from '@/components/AuthRequired';
import Navbar from '@/components/Navbar';
import { Sparkles, Loader2, Play, Check, ArrowRight, Layers } from 'lucide-react';

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
        try {
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
            
            // 단계 결과 저장
            setSteps(prev => prev.map((s, idx) => 
              idx === i 
                ? { ...s, status: 'completed', result: data.result }
                : s
            ));

            // 렌더링 단계 완료 시 비디오 URL 생성 (시뮬레이션)
            if (step.id === 'render' && data.result) {
              // 실제로는 렌더링 서버에서 비디오 URL을 받아와야 함
              // 임시로 시뮬레이션 - 실제 구현 시 렌더링 서버 API 호출
              console.log('[AllInOne Studio] 렌더링 완료:', data.result);
              
              // 렌더링 결과에서 비디오 URL 추출 (실제 구현 시)
              const videoUrl = data.result?.videoUrl || data.result?.output?.video || null;
              if (videoUrl) {
                // 프로젝트에 비디오 URL 저장
                const projectId = `project-${Date.now()}`;
                try {
                  await fetch('/api/allinone-studio/project', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: projectId,
                      name: prompt.substring(0, 50) || '새 프로젝트',
                      type,
                      prompt,
                      steps: steps.reduce((acc, s, idx) => {
                        acc[s.id] = {
                          status: idx <= i ? (idx === i ? 'completed' : s.status) : 'pending',
                          result: idx === i ? data.result : s.result,
                        };
                        return acc;
                      }, {} as Record<string, any>),
                      status: 'completed',
                      videoUrl,
                      thumbnail: data.result?.thumbnail || null,
                    }),
                  });
                } catch (e) {
                  console.error('프로젝트 저장 실패:', e);
                }
              }
            }
          } else {
            const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
            console.error('API 오류:', errorData);
            setSteps(prev => prev.map((s, idx) => 
              idx === i ? { ...s, status: 'error' } : s
            ));
            alert(`생성 실패: ${errorData.error || '서버 오류가 발생했습니다.'}`);
            break;
          }
        } catch (fetchError: any) {
          console.error('Fetch 오류:', fetchError);
          setSteps(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'error' } : s
          ));
          alert(`생성 실패: ${fetchError.message || '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'}`);
          break;
        }

        // 다음 단계로 넘어가기 전 약간의 딜레이
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 모든 단계 완료 후 프로젝트 저장 및 페이지로 이동
      const projectId = `project-${Date.now()}`;
      
      // 최종 상태 확인
      const allCompleted = steps.every(s => s.status === 'completed');
      const hasError = steps.some(s => s.status === 'error');
      const finalStatus = hasError ? 'error' : allCompleted ? 'completed' : 'generating';
      
      // 렌더링 결과에서 비디오 URL 추출
      const renderStep = steps.find(s => s.id === 'render');
      const videoUrl = renderStep?.result?.videoUrl || renderStep?.result?.output?.video || null;
      const thumbnail = renderStep?.result?.thumbnail || null;
      
      // 프로젝트 저장
      try {
        const saveResponse = await fetch('/api/allinone-studio/project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: projectId,
            name: prompt.substring(0, 50) || '새 프로젝트',
            type,
            prompt,
            steps: steps.reduce((acc, step) => {
              acc[step.id] = {
                status: step.status,
                result: step.result,
              };
              return acc;
            }, {} as Record<string, any>),
            status: finalStatus,
            videoUrl,
            thumbnail,
          }),
        });

        if (saveResponse.ok) {
          const savedData = await saveResponse.json();
          // 프로젝트 페이지로 이동
          router.push(`/allinone-studio/project/${projectId}`);
        } else {
          // 저장 실패해도 프로젝트 페이지로 이동 (임시 저장)
          router.push(`/allinone-studio/project/${projectId}`);
        }
      } catch (saveError) {
        console.error('프로젝트 저장 실패:', saveError);
        // 저장 실패해도 프로젝트 페이지로 이동
        router.push(`/allinone-studio/project/${projectId}`);
      }
    } catch (error) {
      console.error('생성 오류:', error);
      alert('콘텐츠 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            AI 콘텐츠 생성
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            AI가 자동으로 스토리, 캐릭터, 애니메이션을 생성하는 전문적인 콘텐츠를 만들어보세요
          </p>
        </div>

        {/* 프롬프트 입력 카드 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
          <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            무엇을 만들고 싶으신가요?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 행복한 고양이가 춤추는 숏폼 영상을 만들어주세요"
            className="w-full h-40 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg resize-none transition-all"
            disabled={isGenerating}
          />
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span>AI가 자동으로 스토리, 캐릭터, 장면, 애니메이션을 생성합니다</span>
          </div>
        </div>

        {/* 생성 단계 카드 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            생성 단계
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-5 rounded-xl transition-all ${
                  step.status === 'processing' 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50' 
                    : step.status === 'completed'
                    ? 'bg-green-500/10 border-2 border-green-500/50'
                    : step.status === 'error'
                    ? 'bg-red-500/10 border-2 border-red-500/50'
                    : 'bg-white/5 border-2 border-white/10'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.status === 'completed' && (
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {step.status === 'processing' && (
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  {step.status === 'pending' && (
                    <div className="w-10 h-10 rounded-full border-2 border-gray-500 flex items-center justify-center">
                      <span className="text-gray-400 font-semibold">{index + 1}</span>
                    </div>
                  )}
                  {step.status === 'error' && (
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold">✕</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{step.name}</div>
                  {step.status === 'processing' && (
                    <div className="text-sm text-purple-300 mt-1">AI가 생성 중입니다...</div>
                  )}
                  {step.status === 'completed' && (
                    <div className="text-sm text-green-300 mt-1">완료되었습니다</div>
                  )}
                  {step.status === 'error' && (
                    <div className="text-sm text-red-300 mt-1">오류가 발생했습니다</div>
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
          className="w-full py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl font-bold text-xl hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 disabled:hover:scale-100"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>콘텐츠 생성 중...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span>콘텐츠 생성 시작</span>
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
