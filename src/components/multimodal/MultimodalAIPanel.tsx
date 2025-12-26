'use client';

import React, { useState } from 'react';
import { Image, Video, Mic, FileText, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { multimodalAI, type MediaType } from '@/lib/multimodal/multimodal-ai';
import { useToast } from '@/components/ui/Toast';

export function MultimodalAIPanel() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const tabs = [
    { id: 'text-to-image', label: '텍스트→이미지' },
    { id: 'image-to-text', label: '이미지→텍스트' },
    { id: 'image-to-code', label: '이미지→코드' },
    { id: 'video-summary', label: '비디오요약' },
    { id: 'audio-to-text', label: '음성인식' },
  ];
  const [activeTab, setActiveTab] = useState('text-to-image');

  const handleProcess = async () => {
    if (!text.trim()) {
      showToast({ type: 'warning', message: '입력 내용을 입력해주세요' });
      return;
    }

    setIsProcessing(true);
    try {
      let resultData: string;

      switch (activeTab) {
        case 'text-to-image':
          resultData = await multimodalAI.textToImage(text);
          break;
        case 'image-to-text':
          resultData = await multimodalAI.imageToText(text);
          break;
        case 'image-to-code':
          resultData = await multimodalAI.imageToCode(text);
          break;
        case 'video-summary':
          resultData = await multimodalAI.videoToSummary(text);
          break;
        case 'audio-to-text':
          resultData = await multimodalAI.audioToText(text);
          break;
        default:
          resultData = '처리 완료';
      }

      setResult(resultData);
      showToast({ type: 'success', message: '처리가 완료되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '처리 중 오류가 발생했습니다' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = (tabId: string) => {
    switch (tabId) {
      case 'text-to-image':
        return <Image size={20} />;
      case 'image-to-text':
        return <FileText size={20} />;
      case 'image-to-code':
        return <Code size={20} />;
      case 'video-summary':
        return <Video size={20} />;
      case 'audio-to-text':
        return <Mic size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  const getPlaceholder = (tabId: string) => {
    switch (tabId) {
      case 'text-to-image':
        return '이미지를 생성할 텍스트 설명을 입력하세요...';
      case 'image-to-text':
        return '이미지 URL을 입력하세요...';
      case 'image-to-code':
        return '코드로 변환할 이미지 URL을 입력하세요...';
      case 'video-summary':
        return '요약할 비디오 URL을 입력하세요...';
      case 'audio-to-text':
        return '음성을 인식할 오디오 URL을 입력하세요...';
      default:
        return '입력하세요...';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">멀티모달 AI</h2>
            <p className="text-sm text-gray-500">텍스트, 이미지, 비디오, 오디오 통합 처리</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>변환 타입 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>입력</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={getPlaceholder(activeTab)}
              />
              <Button
                variant="primary"
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full"
              >
                {getIcon(activeTab)}
                <span className="ml-2">
                  {isProcessing ? '처리 중...' : '변환 실행'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg">
                {activeTab === 'text-to-image' ? (
                  <div className="text-center">
                    <img
                      src={result}
                      alt="Generated"
                      className="max-w-full h-auto rounded-lg mx-auto mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-gray-500">
                      이미지 미리보기 (실제 AI 생성 필요)
                    </div>
                    <p className="text-sm text-gray-600 break-all">{result}</p>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">{result}</pre>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    showToast({ type: 'success', message: '복사되었습니다' });
                  }}
                  className="flex-1"
                >
                  복사
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

