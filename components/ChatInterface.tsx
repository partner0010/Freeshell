'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, Image, Video, FileText, Sparkles, Loader2 } from 'lucide-react';

type ExpertMode = 'chat' | 'developer' | 'creator' | 'general';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<ExpertMode>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // 사용자 메시지 추가
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          mode,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // 세션 ID 저장
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }

        // AI 응답 추가
        const aiMessage = {
          role: 'assistant' as const,
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMessage]);

        // 히스토리 업데이트
        if (data.history) {
          setMessages(data.history.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })));
        }
      } else {
        throw new Error(data.error || '응답 생성 실패');
      }
    } catch (error: any) {
      const errorMessage = {
        role: 'assistant' as const,
        content: `오류가 발생했습니다: ${error.message}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const modeIcons = {
    chat: Bot,
    developer: Code,
    creator: Sparkles,
    general: FileText,
  };

  const modeLabels = {
    chat: '일반 대화',
    developer: '개발자 모드',
    creator: '창작자 모드',
    general: '일반 모드',
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI 대화</h2>
              <p className="text-sm text-white/80">ChatGPT처럼 자연스러운 대화</p>
            </div>
          </div>
          
          {/* 모드 선택 */}
          <div className="flex gap-2">
            {(['chat', 'developer', 'creator', 'general'] as ExpertMode[]).map((m) => {
              const Icon = modeIcons[m];
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    mode === m
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {modeLabels[m]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">안녕하세요! 무엇을 도와드릴까요?</p>
            <p className="text-sm text-gray-500">
              {mode === 'developer' && '개발자 모드: 코드 작성 및 분석을 도와드립니다.'}
              {mode === 'creator' && '창작자 모드: 영상, 이미지, 글 제작을 도와드립니다.'}
              {mode === 'chat' && '일반 대화 모드: 자연스러운 대화를 나눕니다.'}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {msg.content}
                </div>
                <div className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'developer' 
                ? '코드 작성, 분석, 개선 요청...'
                : mode === 'creator'
                ? '영상, 이미지, 글 제작 요청...'
                : '메시지를 입력하세요...'
            }
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                전송
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

