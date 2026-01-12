/**
 * 고급 애니메이션 에디터
 * 타임라인, 키프레임 애니메이션 제작
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Plus, Trash2, Settings, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface Keyframe {
  id: string;
  time: number; // 초 단위
  properties: {
    [key: string]: string | number;
  };
}

interface AnimationLayer {
  id: string;
  name: string;
  selector: string;
  keyframes: Keyframe[];
  duration: number; // 초 단위
  easing: string;
}

export default function AnimationEditor() {
  const [layers, setLayers] = useState<AnimationLayer[]>([
    {
      id: '1',
      name: '요소 1',
      selector: '.element-1',
      keyframes: [
        { id: 'k1', time: 0, properties: { opacity: 0, transform: 'translateY(20px)' } },
        { id: 'k2', time: 1, properties: { opacity: 1, transform: 'translateY(0)' } },
      ],
      duration: 1,
      easing: 'ease-in-out',
    },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>('1');
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  const maxDuration = Math.max(...layers.map(l => l.duration), 5);

  const addLayer = () => {
    const newLayer: AnimationLayer = {
      id: Date.now().toString(),
      name: `요소 ${layers.length + 1}`,
      selector: `.element-${layers.length + 1}`,
      keyframes: [
        { id: 'k1', time: 0, properties: { opacity: 0 } },
        { id: 'k2', time: 1, properties: { opacity: 1 } },
      ],
      duration: 1,
      easing: 'ease-in-out',
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const removeLayer = (layerId: string) => {
    setLayers(layers.filter(l => l.id !== layerId));
    if (selectedLayer === layerId) {
      setSelectedLayer(layers.length > 1 ? layers.find(l => l.id !== layerId)?.id || null : null);
    }
  };

  const addKeyframe = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const newKeyframe: Keyframe = {
      id: `k${Date.now()}`,
      time: currentTime,
      properties: { ...layer.keyframes[layer.keyframes.length - 1]?.properties || {} },
    };

    const updatedLayers = layers.map(l =>
      l.id === layerId
        ? {
            ...l,
            keyframes: [...l.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
          }
        : l
    );

    setLayers(updatedLayers);
    setSelectedKeyframe(newKeyframe.id);
  };

  const removeKeyframe = (layerId: string, keyframeId: string) => {
    const updatedLayers = layers.map(l =>
      l.id === layerId
        ? {
            ...l,
            keyframes: l.keyframes.filter(k => k.id !== keyframeId),
          }
        : l
    );
    setLayers(updatedLayers);
    if (selectedKeyframe === keyframeId) {
      setSelectedKeyframe(null);
    }
  };

  const updateKeyframe = (layerId: string, keyframeId: string, property: string, value: string | number) => {
    const updatedLayers = layers.map(l =>
      l.id === layerId
        ? {
            ...l,
            keyframes: l.keyframes.map(k =>
              k.id === keyframeId
                ? {
                    ...k,
                    properties: { ...k.properties, [property]: value },
                  }
                : k
            ),
          }
        : l
    );
    setLayers(updatedLayers);
  };

  const generateCSS = () => {
    let css = '';
    layers.forEach(layer => {
      css += `${layer.selector} {\n`;
      css += `  animation: ${layer.name.replace(/\s/g, '-')} ${layer.duration}s ${layer.easing};\n`;
      css += `}\n\n`;
      css += `@keyframes ${layer.name.replace(/\s/g, '-')} {\n`;
      layer.keyframes.forEach(keyframe => {
        const percentage = (keyframe.time / layer.duration) * 100;
        css += `  ${percentage}% {\n`;
        Object.entries(keyframe.properties).forEach(([prop, value]) => {
          css += `    ${prop}: ${value};\n`;
        });
        css += `  }\n`;
      });
      css += `}\n\n`;
    });
    return css;
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // 실제 애니메이션 재생 로직
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const selectedLayerData = layers.find(l => l.id === selectedLayer);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 툴바 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={handlePause}
            disabled={!isPlaying}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <Pause className="w-5 h-5" />
          </button>
          <button
            onClick={handleStop}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentTime(0)}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentTime.toFixed(2)}s / {maxDuration.toFixed(2)}s
          </span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">{zoom}x</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 레이어 패널 */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>레이어</span>
            </h3>
            <button
              onClick={addLayer}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 space-y-1">
            {layers.map(layer => (
              <div
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedLayer === layer.id
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{layer.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(layer.id);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs opacity-75 mt-1">{layer.selector}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 타임라인 */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-x-auto overflow-y-auto p-4" ref={timelineRef}>
            <div className="space-y-4" style={{ minWidth: `${maxDuration * 100 * zoom}px` }}>
              {layers.map(layer => (
                <div key={layer.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-32 text-sm font-medium">{layer.name}</span>
                    <div className="flex-1 relative h-12 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      {layer.keyframes.map(keyframe => (
                        <div
                          key={keyframe.id}
                          onClick={() => setSelectedKeyframe(keyframe.id)}
                          className={`absolute top-0 w-3 h-full cursor-pointer border-l-2 ${
                            selectedKeyframe === keyframe.id
                              ? 'border-primary bg-primary/20'
                              : 'border-gray-400 bg-gray-300 dark:bg-gray-600'
                          }`}
                          style={{ left: `${(keyframe.time / maxDuration) * 100}%` }}
                          title={`${keyframe.time}s`}
                        />
                      ))}
                      {/* 현재 시간 인디케이터 */}
                      <div
                        className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                        style={{ left: `${(currentTime / maxDuration) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 키프레임 속성 패널 */}
          {selectedLayerData && selectedKeyframe && selectedLayer && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold mb-4">키프레임 속성</h3>
              <div className="space-y-3">
                {Object.entries(
                  selectedLayerData.keyframes.find(k => k.id === selectedKeyframe)?.properties || {}
                ).map(([prop, value]) => (
                  <div key={prop} className="flex items-center space-x-2">
                    <label className="w-32 text-sm">{prop}:</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        if (selectedLayer && selectedKeyframe) {
                          updateKeyframe(selectedLayer, selectedKeyframe, prop, e.target.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    if (selectedLayer) {
                      addKeyframe(selectedLayer);
                    }
                  }}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>키프레임 추가</span>
                </button>
              </div>
            </div>
          )}

          {/* 생성된 CSS */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">생성된 CSS</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateCSS());
                  alert('CSS가 클립보드에 복사되었습니다!');
                }}
                className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                복사
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generateCSS()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
