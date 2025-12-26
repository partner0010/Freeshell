'use client';

import React, { useState } from 'react';
import { Presentation, Plus, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { aiPresentationBuilder, type Presentation as PresentationType } from '@/lib/presentation/ai-presentation-builder';
import { useToast } from '@/components/ui/Toast';

export function PresentationBuilderPanel() {
  const [topic, setTopic] = useState('');
  const [numSlides, setNumSlides] = useState(10);
  const [presentation, setPresentation] = useState<PresentationType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast({ type: 'warning', message: '주제를 입력해주세요' });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiPresentationBuilder.generatePresentation(topic, numSlides);
      setPresentation(result);
      showToast({ type: 'success', message: '프레젠테이션이 생성되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '생성 중 오류가 발생했습니다' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: 'pdf' | 'pptx' | 'html') => {
    if (!presentation) return;
    const filename = aiPresentationBuilder.exportPresentation(presentation, format);
    showToast({ type: 'success', message: `${filename} 다운로드 준비됨` });
    // 실제 다운로드 로직 구현
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Presentation className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AI 프레젠테이션 빌더</h2>
            <p className="text-sm text-gray-500">주제만 입력하면 자동으로 프레젠테이션 생성</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 생성 폼 */}
        {!presentation && (
          <Card>
            <CardHeader>
              <CardTitle>프레젠테이션 생성</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주제
                  </label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="예: 2025년 웹 개발 트렌드"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    슬라이드 수: {numSlides}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={numSlides}
                    onChange={(e) => setNumSlides(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full"
                >
                  <Sparkles size={18} className="mr-2" />
                  {isGenerating ? '생성 중...' : '프레젠테이션 생성'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 프레젠테이션 결과 */}
        {presentation && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{presentation.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('pdf')}
                    >
                      <Download size={14} className="mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('pptx')}
                    >
                      <Download size={14} className="mr-1" />
                      PPTX
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('html')}
                    >
                      <Download size={14} className="mr-1" />
                      HTML
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-4">
                  총 {presentation.slides.length}개 슬라이드
                </div>
              </CardContent>
            </Card>

            {/* 슬라이드 목록 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {presentation.slides.map((slide, index) => (
                <Card key={slide.id} hover>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-400 mb-2">슬라이드 {index + 1}</div>
                    <h4 className="font-semibold text-gray-800 mb-2">{slide.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{slide.content}</p>
                    <Badge variant="outline" size="sm" className="mt-2">
                      {slide.layout}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setPresentation(null)}
              className="w-full"
            >
              새 프레젠테이션 만들기
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

