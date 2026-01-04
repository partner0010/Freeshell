'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Download, Sparkles, Loader2, X, ExternalLink } from 'lucide-react';

interface GeneratedImage {
  url: string;
  prompt: string;
  id: string;
  createdAt: string;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'image', prompt }),
      });

      if (!response.ok) {
        throw new Error('이미지 생성에 실패했습니다');
      }

      const data = await response.json();
      if (data.image) {
        const newImage: GeneratedImage = {
          url: data.image,
          prompt: data.prompt || prompt,
          id: Date.now().toString(),
          createdAt: data.generatedAt || new Date().toISOString(),
        };
        setGeneratedImages([newImage, ...generatedImages]);
        setPrompt(''); // 생성 후 프롬프트 초기화
      } else {
        setError('이미지 URL을 받지 못했습니다');
      }
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      setError('이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('다운로드 실패:', error);
      // 대체 방법: 새 창에서 이미지 열기
      window.open(imageUrl, '_blank');
    }
  };

  const handleDelete = (id: string) => {
    setGeneratedImages(generatedImages.filter(img => img.id !== id));
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

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">이미지를 생성하고 있습니다...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">잠시만 기다려주세요</p>
          </div>
        )}

        {generatedImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">생성된 이미지 ({generatedImages.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"
                >
                  <div className="aspect-square relative">
                    <img 
                      src={image.url} 
                      alt={`Generated ${index + 1}: ${image.prompt}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('이미지 로드 실패:', image.url);
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/512/333333/ffffff?text=Image+Load+Failed`;
                      }}
                    />
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(image.url, image.prompt, index)}
                        className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>다운로드</span>
                      </button>
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>새 창</span>
                      </a>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {image.prompt}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!isGenerating && generatedImages.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>생성된 이미지가 없습니다. 위에 프롬프트를 입력하고 생성 버튼을 클릭하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

