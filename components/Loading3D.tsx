/**
 * 3D 로딩 화면 컴포넌트
 * 게임, 진행률, 애니메이션 등 다양한 로딩 화면
 */
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Code, Zap, CheckCircle } from 'lucide-react';

interface Loading3DProps {
  progress: number;
  message?: string;
  mode?: 'game' | 'progress' | 'animation' | 'random';
}

export default function Loading3D({ progress, message, mode = 'random' }: Loading3DProps) {
  const [currentMode, setCurrentMode] = useState<'game' | 'progress' | 'animation'>(mode === 'random' ? 'progress' : mode);
  const [gameScore, setGameScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => {
    if (mode === 'random') {
      const modes: ('game' | 'progress' | 'animation')[] = ['game', 'progress', 'animation'];
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      setCurrentMode(randomMode);
    }
  }, [mode]);

  useEffect(() => {
    if (currentMode === 'game' && progress > 10 && progress < 90) {
      setGameActive(true);
    } else {
      setGameActive(false);
    }
  }, [currentMode, progress]);

  // 게임 모드
  if (currentMode === 'game' && gameActive) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">로딩 중...</h2>
            <p className="text-xl text-purple-200 mb-8">{message || '웹사이트를 생성하고 있습니다'}</p>
          </div>
          
          {/* 간단한 클릭 게임 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <p className="text-white mb-4">점수를 올려보세요!</p>
            <div className="text-6xl font-bold text-yellow-400 mb-6">{gameScore}</div>
            <button
              onClick={() => setGameScore(prev => prev + 1)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-lg"
            >
              클릭!
            </button>
          </div>

          {/* 진행률 바 */}
          <div className="mt-8 w-96 mx-auto">
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white mt-2 text-sm">{Math.round(progress)}%</p>
          </div>
        </div>
      </div>
    );
  }

  // 진행률 모드
  if (currentMode === 'progress') {
    const steps = [
      { label: 'AI 분석 중', icon: Sparkles, completed: progress > 20 },
      { label: '템플릿 생성 중', icon: Code, completed: progress > 50 },
      { label: '코드 작성 중', icon: Zap, completed: progress > 80 },
      { label: '최종 확인 중', icon: CheckCircle, completed: progress >= 100 },
    ];

    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="max-w-2xl w-full px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">웹사이트 생성 중</h2>
            <p className="text-xl text-purple-200">{message || '잠시만 기다려주세요...'}</p>
          </div>

          {/* 3D 회전 애니메이션 */}
          <div className="relative mb-12 h-64 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
                <div className="w-full h-full border-4 border-pink-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                  <div className="w-full h-full border-4 border-blue-400 rounded-full animate-spin" style={{ animationDuration: '1s' }}>
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-50" />
                  </div>
                </div>
              </div>
            </div>
            <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
          </div>

          {/* 단계 표시 */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = progress >= (index * 25 + 10);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    step.completed
                      ? 'bg-green-500/20 border-2 border-green-500'
                      : isActive
                      ? 'bg-purple-500/20 border-2 border-purple-500'
                      : 'bg-white/10 border-2 border-white/20'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      step.completed ? 'text-green-400' : isActive ? 'text-purple-400 animate-pulse' : 'text-gray-400'
                    }`}
                  />
                  <span className={`flex-1 font-medium ${step.completed ? 'text-green-300' : isActive ? 'text-white' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  {step.completed && <CheckCircle className="w-6 h-6 text-green-400" />}
                </div>
              );
            })}
          </div>

          {/* 진행률 바 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">진행률</span>
              <span className="text-yellow-400 font-bold text-xl">{Math.round(progress)}%</span>
            </div>
            <div className="h-6 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 transition-all duration-300 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 애니메이션 모드
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
      {/* 3D 파티클 효과 */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-4 border-4 border-pink-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            <div className="absolute inset-8 border-4 border-blue-400 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-yellow-400 animate-spin" />
            </div>
          </div>
          <h2 className="text-5xl font-bold text-white mb-4">생성 중...</h2>
          <p className="text-xl text-purple-200 mb-8">{message || 'AI가 웹사이트를 만들고 있습니다'}</p>
        </div>

        {/* 진행률 */}
        <div className="w-96 mx-auto">
          <div className="h-4 bg-white/20 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white text-2xl font-bold">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
