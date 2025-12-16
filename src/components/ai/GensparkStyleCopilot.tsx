'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

interface GensparkStyleCopilotProps {
  onCommand?: (command: string) => void;
}

export function GensparkStyleCopilot({ onCommand }: GensparkStyleCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '안녕하세요! 무엇을 도와드릴까요? 웹사이트를 만들거나, 디자인을 개선하거나, 코드를 생성할 수 있습니다.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateResponse(userMessage.content),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);

      // 명령 실행
      if (onCommand) {
        onCommand(userMessage.content);
      }
    }, 1500);
  };

  const generateResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();

    if (/\b(웹사이트|사이트|페이지)\b/.test(lower)) {
      return '웹사이트를 생성하겠습니다. 어떤 스타일로 만들까요?';
    }

    if (/\b(디자인|스타일|테마)\b/.test(lower)) {
      return '디자인을 개선하겠습니다. 어떤 부분을 개선하고 싶으신가요?';
    }

    if (/\b(코드|프로그램|개발)\b/.test(lower)) {
      return '코드를 생성하겠습니다. 어떤 기능이 필요하신가요?';
    }

    if (/\b(비디오|영상|동영상)\b/.test(lower)) {
      return '비디오를 생성하겠습니다. FREESHELL을 통해 작업을 시작합니다.';
    }

    return '알겠습니다. 작업을 진행하겠습니다.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-50"
      >
        <Sparkles size={24} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed ${
        isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96 h-[600px]'
      } bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 transition-all duration-300`}
    >
      {/* 헤더 */}
      <div className="p-4 border-b bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <span className="font-semibold">AI 코파일럿</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.isLoading && (
                    <div className="mt-2">
                      <Loader2 className="animate-spin" size={16} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="animate-spin text-primary-600" size={16} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                className="flex-1 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                rows={2}
                disabled={isProcessing}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                size="lg"
              >
                <Send size={18} />
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              💡 예: &quot;웹사이트 만들어줘&quot;, &quot;디자인 개선해줘&quot;, &quot;비디오 만들어줘&quot;
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

