'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Download, Sparkles, Loader2 } from 'lucide-react';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'image', prompt }),
      });

      const data = await response.json();
      if (data.image) {
        setGeneratedImages([data.image, ...generatedImages]);
      }
    } catch (error) {
      console.error('이미지 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Image className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">AI 이미지 생성</h2>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="생성할 이미지를 설명하세요..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>생성</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              // 자동 프롬프트 생성
              const autoPrompts = [
                '고품질, 4K, 상세한, 전문적인',
                '예술적, 창의적, 독특한 스타일',
                '사진처럼 현실적인, 자연스러운 조명',
                '디지털 아트, 미래지향적, 혁신적',
              ];
              const randomPrompt = autoPrompts[Math.floor(Math.random() * autoPrompts.length)];
              setPrompt(prompt ? `${prompt}, ${randomPrompt}` : randomPrompt);
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            ✨ 자동 프롬프트 개선
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            AI가 프롬프트를 자동으로 개선하여 고품질 이미지를 생성합니다
          </span>
        </div>

        {generatedImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {generatedImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <img src={image} alt={`Generated ${index + 1}`} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>다운로드</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

