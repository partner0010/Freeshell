'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, Minimize2, Maximize2 } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';

interface AnimationConfig {
  type: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'rotate';
  duration: number;
  delay: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

const animationTypes = [
  { id: 'none', name: '없음', icon: null },
  { id: 'fade', name: '페이드', icon: Sparkles },
  { id: 'slide-up', name: '위로 슬라이드', icon: ArrowUp },
  { id: 'slide-down', name: '아래로 슬라이드', icon: ArrowDown },
  { id: 'slide-left', name: '왼쪽으로 슬라이드', icon: ArrowLeft },
  { id: 'slide-right', name: '오른쪽으로 슬라이드', icon: ArrowRight },
  { id: 'scale', name: '확대', icon: Maximize2 },
  { id: 'rotate', name: '회전', icon: RotateCw },
] as const;

const easingOptions = [
  { id: 'ease', name: 'Ease' },
  { id: 'ease-in', name: 'Ease In' },
  { id: 'ease-out', name: 'Ease Out' },
  { id: 'ease-in-out', name: 'Ease In Out' },
  { id: 'linear', name: 'Linear' },
];

export function AnimationPanel() {
  const { selectedBlockId, getBlockById, updateBlock } = useEditorStore();
  const selectedBlock = selectedBlockId ? getBlockById(selectedBlockId) : null;

  const [config, setConfig] = useState<AnimationConfig>({
    type: 'fade',
    duration: 0.5,
    delay: 0,
    easing: 'ease-out',
  });

  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const handlePlayPreview = () => {
    setIsPreviewPlaying(true);
    setTimeout(() => setIsPreviewPlaying(false), (config.duration + config.delay) * 1000 + 100);
  };

  const getAnimationVariants = () => {
    const baseTransition = {
      duration: config.duration,
      delay: config.delay,
      ease: config.easing,
    };

    switch (config.type) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: baseTransition,
        };
      case 'slide-up':
        return {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: baseTransition,
        };
      case 'slide-down':
        return {
          initial: { opacity: 0, y: -30 },
          animate: { opacity: 1, y: 0 },
          transition: baseTransition,
        };
      case 'slide-left':
        return {
          initial: { opacity: 0, x: 30 },
          animate: { opacity: 1, x: 0 },
          transition: baseTransition,
        };
      case 'slide-right':
        return {
          initial: { opacity: 0, x: -30 },
          animate: { opacity: 1, x: 0 },
          transition: baseTransition,
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: baseTransition,
        };
      case 'rotate':
        return {
          initial: { opacity: 0, rotate: -10 },
          animate: { opacity: 1, rotate: 0 },
          transition: baseTransition,
        };
      default:
        return {
          initial: {},
          animate: {},
          transition: baseTransition,
        };
    }
  };

  const handleApplyToBlock = () => {
    if (selectedBlock) {
      updateBlock(selectedBlock.id, {
        styles: {
          ...selectedBlock.styles,
          animation: config,
        } as any,
      });
    }
  };

  if (!selectedBlock) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-pastel-lavender rounded-2xl flex items-center justify-center mb-4">
          <Sparkles className="text-primary-500" size={32} />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">블록을 선택하세요</h3>
        <p className="text-sm text-gray-500">
          블록에 애니메이션을 적용하려면 먼저 캔버스에서 블록을 선택해주세요
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 선택된 블록 정보 */}
      <div className="bg-gradient-to-r from-primary-100 to-pastel-sky rounded-xl p-3 mb-4">
        <p className="text-sm text-primary-600 font-medium">선택된 블록</p>
        <p className="text-lg font-semibold text-gray-800 capitalize">{selectedBlock.type}</p>
      </div>

      {/* 애니메이션 타입 선택 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">애니메이션 타입</h4>
        <div className="grid grid-cols-4 gap-2">
          {animationTypes.map((anim) => {
            const IconComponent = anim.icon;
            return (
              <button
                key={anim.id}
                onClick={() => setConfig({ ...config, type: anim.id })}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                  transition-all text-xs
                  ${config.type === anim.id
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {IconComponent ? <IconComponent size={18} /> : <span className="w-[18px] h-[18px]" />}
                <span className="truncate w-full text-center">{anim.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 지속 시간 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">지속 시간</h4>
          <span className="text-sm text-gray-500">{config.duration}s</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={config.duration}
          onChange={(e) => setConfig({ ...config, duration: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-500"
        />
      </div>

      {/* 지연 시간 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">지연 시간</h4>
          <span className="text-sm text-gray-500">{config.delay}s</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={config.delay}
          onChange={(e) => setConfig({ ...config, delay: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-500"
        />
      </div>

      {/* 이징 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">이징</h4>
        <div className="flex flex-wrap gap-2">
          {easingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setConfig({ ...config, easing: option.id as AnimationConfig['easing'] })}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${config.easing === option.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* 미리보기 */}
      <div className="flex-1 bg-gray-100 rounded-xl p-4 flex items-center justify-center">
        <motion.div
          key={isPreviewPlaying ? 'playing' : 'idle'}
          {...(isPreviewPlaying ? getAnimationVariants() : {})}
          className="w-32 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-lg flex items-center justify-center"
        >
          <span className="text-white font-medium text-sm">미리보기</span>
        </motion.div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-4 space-y-2">
        <button
          onClick={handlePlayPreview}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Play size={18} />
          미리보기 재생
        </button>
        <button
          onClick={handleApplyToBlock}
          className="btn-primary w-full"
        >
          블록에 적용
        </button>
      </div>
    </div>
  );
}

