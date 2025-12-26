/**
 * ChatGPT 스타일 AI 검색 컴포넌트
 * 무료 AI API 연동 (Hugging Face, Cohere 등)
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Copy, Check, Code, Image, FileText, MessageSquare, Mic, Upload, Play, Square } from 'lucide-react';
import { CodeGenerator } from './CodeGenerator';
import { detectLanguage } from '@/lib/ai/code-assistant';
import { generateNanobananaPrompt } from '@/lib/ai/creative-generator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'image' | 'file';
  code?: string;
  imageUrl?: string;
  fileName?: string;
}

export function ChatGPTLikeSearch() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! 저는 SHELL입니다. 🐚✨\n\nFreeshell의 AI 어시스턴트로, 여러분의 다양한 작업을 도와드립니다.\n\n💡 제가 도와드릴 수 있는 것들:\n- 📝 일반 질문 및 답변\n- 💻 코드 생성 및 분석 (JavaScript, TypeScript, Python, React, Next.js 등)\n- 🔍 코드 설명 및 디버깅 도움\n- 🔄 코드 리팩토링 및 최적화\n- 🎨 창의적 콘텐츠 생성\n- 📚 최신 기술 트렌드 정보 제공\n- 🖼️ 이미지 생성\n- 📄 파일 업로드 및 분석\n\n무엇을 도와드릴까요? 궁금한 것이 있으시면 언제든지 물어보세요! 😊',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'code' | 'image'>('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 키보드 단축키 지원 (최신 트렌드)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: 포커스 이동
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape: 입력창 비우기
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setInput('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 음성 인식 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'ko-KR';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    // 코드 생성 모드로 전환 (키워드 감지)
    const lowerInput = currentInput.toLowerCase();
    const codeKeywords = [
      '코드', 'code', '만들', '작성', '프로그래밍', 'programming',
      'javascript', 'typescript', 'react', 'nextjs', 'python', 'java',
      '함수', 'function', '컴포넌트', 'component', 'api', '에러', 'error',
      '디버깅', 'debugging', '리팩토링', 'refactoring'
    ];
    
    // 창의적 콘텐츠 키워드 감지 (나노바나나 스타일)
    const creativeKeywords = [
      '창의적', '독특한', '신기한', '재미있는', '특별한', '아이디어',
      'creative', 'unique', 'funny', 'special', 'amazing', 'idea',
      '나노바나나', 'nanobanana'
    ];
    
    if (codeKeywords.some(keyword => lowerInput.includes(keyword))) {
      setMode('code');
    }
    
    // 창의적 프롬프트 생성
    const enhancedPrompt = creativeKeywords.some(keyword => lowerInput.includes(keyword))
      ? generateNanobananaPrompt(currentInput)
      : currentInput;

    // 스켈레톤 메시지 추가 (로딩 중 표시)
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // 무료 AI API 호출
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: enhancedPrompt,
          conversation: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('AI 응답 실패');
      }

      const data = await response.json();
      
      // 코드 블록 감지 및 처리
      let responseContent = data.response || '죄송합니다. 응답을 생성할 수 없습니다.';
      const detectedLanguage = detectLanguage(currentInput);
      
      // 코드가 포함된 경우 타입 설정
      const hasCode = responseContent.includes('```') || detectedLanguage !== null;
      
      // 로딩 메시지 제거하고 실제 응답으로 교체
      setMessages((prev) => {
        const filtered = prev.filter(m => !m.id.startsWith('loading-'));
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          type: hasCode ? 'code' : 'text',
          code: hasCode ? responseContent : undefined,
        };
        return [...filtered, assistantMessage];
      });
    } catch (error: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `오류가 발생했습니다: ${error.message}. 다시 시도해주세요.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const userMessage: Message = {
        id: `file-${Date.now()}`,
        role: 'user',
        content: `파일 업로드: ${file.name}`,
        timestamp: new Date(),
        type: 'file',
        fileName: file.name,
      };
      setMessages((prev) => [...prev, userMessage]);
      
      // 파일 내용 분석 요청
      handleFileAnalysis(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleFileAnalysis = async (content: string, fileName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `다음 파일을 분석해주세요: ${fileName}\n\n${content.substring(0, 2000)}`,
          conversation: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response || '파일 분석을 완료했습니다.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('파일 분석 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] sm:max-h-[600px] md:max-h-[700px] bg-white rounded-2xl shadow-xl border border-gray-200 w-full overflow-hidden">
      {/* 헤더 */}
      <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-white" size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base truncate">SHELL</h2>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setMode('chat')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'chat' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare size={16} className="inline mr-1" />
              채팅
            </button>
            <button
              onClick={() => setMode('code')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'code' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Code size={16} className="inline mr-1" />
              코드
            </button>
            <button
              onClick={() => setMode('image')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'image' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Image size={16} className="inline mr-1" />
              이미지
            </button>
          </div>
        </div>
      </div>

      {/* 코드 생성 모드 */}
      {mode === 'code' && (
        <div className="flex-1 overflow-y-auto p-4">
          <CodeGenerator />
        </div>
      )}

      {/* 메시지 영역 */}
      {mode === 'chat' && (
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
        <AnimatePresence>
          {messages.map((message) => {
            // 스켈레톤 로딩 메시지 처리
            if (message.id.startsWith('loading-')) {
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={16} />
                  </div>
                  <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 animate-pulse">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              );
            }
            
            return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={14} />
                </div>
              )}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-900 shadow-sm'
                }`}
              >
                {message.type === 'code' && message.code ? (
                  <div className="space-y-2">
                    <div className="whitespace-pre-wrap break-words">
                      {message.content.replace(/```[\s\S]*?```/g, '').trim() || '코드 예제:'}
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm font-mono">
                        <code>{message.code.match(/```[\w]*\n([\s\S]*?)```/)?.[1] || message.code}</code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">{message.content}</div>
                )}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <Copy size={12} />
                    복사
                  </button>
                )}
              </motion.div>
              {message.role === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-gray-600" size={14} />
                </div>
              )}
            </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={16} />
            </div>
            <div className="bg-gray-100 rounded-2xl p-4">
              <Loader2 className="animate-spin text-purple-600" size={20} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
      )}

      {/* 입력 영역 */}
      <div className="p-3 sm:p-4 border-t bg-gray-50 flex-shrink-0">
        <div className="flex gap-1.5 sm:gap-2 mb-2">
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-20 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none max-h-32 text-sm sm:text-base min-w-0"
              rows={1}
            />
            <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex gap-0.5 sm:gap-1">
              <button
                onClick={handleVoiceInput}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="음성 입력"
              >
                <Mic size={16} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                title="파일 업로드"
              >
                <Upload size={16} className="sm:w-5 sm:h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.js,.ts,.tsx,.jsx,.json,.md,.py,.java,.cpp,.c"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            <Send size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
          <p className="text-xs text-gray-500 text-center sm:text-left break-words px-2">
            무료 AI로 질문하고 답변받으세요. 회원가입 없이 사용 가능합니다.
          </p>
          <div className="flex gap-2 text-xs text-gray-500">
            <span>💡 음성 입력</span>
            <span>📁 파일 업로드</span>
            <span>🎨 이미지 생성</span>
          </div>
        </div>
      </div>
    </div>
  );
}

