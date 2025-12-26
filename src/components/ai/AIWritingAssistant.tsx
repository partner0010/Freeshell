'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface WritingAction {
  type: 'rewrite' | 'correct' | 'summarize' | 'expand';
  label: string;
  icon: React.ReactNode;
}

export function AIWritingAssistant() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const actions: WritingAction[] = [
    {
      type: 'rewrite',
      label: '다시 작성',
      icon: <RefreshCw size={18} />,
    },
    {
      type: 'correct',
      label: '교정',
      icon: <CheckCircle2 size={18} />,
    },
    {
      type: 'summarize',
      label: '요약',
      icon: <FileText size={18} />,
    },
    {
      type: 'expand',
      label: '확장',
      icon: <Sparkles size={18} />,
    },
  ];

  const handleAction = async (actionType: WritingAction['type']) => {
    if (!text.trim()) {
      showToast({ type: 'warning', message: '텍스트를 입력해주세요' });
      return;
    }

    setIsProcessing(true);
    try {
      // 실제로는 AI API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let processedText = '';
      switch (actionType) {
        case 'rewrite':
          processedText = `재작성된 텍스트: ${text}`;
          break;
        case 'correct':
          processedText = `교정된 텍스트: ${text}`;
          break;
        case 'summarize':
          processedText = `요약: ${text.substring(0, 50)}...`;
          break;
        case 'expand':
          processedText = `${text}\n\n추가된 내용: 상세한 설명과 예시...`;
          break;
      }

      setResult(processedText);
      showToast({ type: 'success', message: '작업이 완료되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '처리 중 오류가 발생했습니다' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AI 글쓰기 도구</h2>
            <p className="text-sm text-gray-500">텍스트 재작성, 교정, 요약, 확장</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {actions.map((action) => (
            <Button
              key={action.type}
              variant="outline"
              size="sm"
              onClick={() => handleAction(action.type)}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 입력 영역 */}
        <Card>
          <CardHeader>
            <CardTitle>텍스트 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="작성하거나 교정하고 싶은 텍스트를 입력하세요..."
              className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={6}
            />
            <div className="mt-2 text-xs text-gray-500">
              {text.length}자
            </div>
          </CardContent>
        </Card>

        {/* 결과 영역 */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{result}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    showToast({ type: 'success', message: '복사되었습니다' });
                  }}
                >
                  복사
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setText(result);
                    setResult('');
                  }}
                >
                  결과를 입력으로 이동
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

