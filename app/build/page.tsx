'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Send, Sparkles, Code, Download, Eye, Loader2, X, CheckCircle, AlertCircle, RefreshCw, ArrowRight, LayoutTemplate, Edit } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WebsiteEditor from '@/components/WebsiteEditor';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  files?: Array<{ name: string; content: string; type: string }>;
}

interface GeneratedProject {
  id: string;
  name: string;
  description: string;
  files: Array<{ name: string; content: string; type: string }>;
  preview?: string;
  createdAt: Date;
}

export default function BuildPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! 저는 AI 개발자입니다. 어떤 앱이나 웹사이트를 만들고 싶으신가요? 자연어로 설명해주시면 코드를 생성해드리겠습니다.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessedPrompt, setHasProcessedPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'editor'>('chat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // URL 파라미터에서 프롬프트 또는 템플릿 가져오기
  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam && !hasProcessedPrompt) {
      try {
        const templateData = JSON.parse(decodeURIComponent(templateParam));
        if (templateData.files && templateData.files.length > 0) {
          setHasProcessedPrompt(true);
          // 템플릿 파일을 바로 적용
          setGeneratedProject({
            id: Date.now().toString(),
            name: templateData.name || '템플릿',
            description: '',
            files: templateData.files,
            preview: templateData.files.find((f: any) => f.name.includes('html'))?.content || '',
            createdAt: new Date(),
          });
          
          // 에디터 탭으로 자동 전환
          setActiveTab('editor');
          
          // 채팅에 메시지 추가
          const templateMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `${templateData.name} 템플릿이 적용되었습니다! 에디터 탭에서 상세 편집이 가능합니다.`,
            timestamp: new Date(),
            files: templateData.files,
          };
          setMessages((prev) => [...prev, templateMessage]);
          return;
        }
      } catch (error) {
        console.error('템플릿 파싱 실패:', error);
      }
    }

    const prompt = searchParams.get('prompt');
    if (prompt && !hasProcessedPrompt) {
      setHasProcessedPrompt(true);
      setInput(prompt);
      // 자동으로 전송
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }, 500);
    }
  }, [searchParams, hasProcessedPrompt]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          conversation: messages.map(m => m.content).join('\n'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '앱 생성 중 오류가 발생했습니다.');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || '웹사이트/앱이 생성되었습니다!',
        timestamp: new Date(),
        code: data.code,
        files: data.files,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.files && data.files.length > 0) {
        setGeneratedProject({
          id: Date.now().toString(),
          name: data.name || '생성된 앱',
          description: data.description || '',
          files: data.files,
          preview: data.preview,
          createdAt: new Date(),
        });
      }
    } catch (err: any) {
      setError(err.message || '앱 생성 중 오류가 발생했습니다.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `죄송합니다. 오류가 발생했습니다: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedProject) return;

    // ZIP 파일 생성 (간단한 구현)
    const zipContent = generatedProject.files
      .map((file) => `=== ${file.name} ===\n${file.content}\n\n`)
      .join('\n');

    const blob = new Blob([zipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedProject.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '안녕하세요! 저는 AI 개발자입니다. 어떤 앱이나 웹사이트를 만들고 싶으신가요? 자연어로 설명해주시면 코드를 생성해드리겠습니다.',
        timestamp: new Date(),
      },
    ]);
    setGeneratedProject(null);
    setShowPreview(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col pt-20 pb-4">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI로 웹사이트와 앱 만들기
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              자연어로 설명하면 AI가 웹사이트나 웹 앱을 생성해드립니다
            </p>
            <Link
              href="/templates/website"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-all mb-4"
            >
              <Code className="w-5 h-5" />
              <span>템플릿 갤러리에서 선택하기</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>AI 채팅</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'editor'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500'
              }`}
            >
              <Edit className="w-5 h-5" />
              <span>에디터</span>
            </button>
          </div>

          {/* 메인 컨텐츠 영역 */}
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col lg:flex-row gap-6 mb-4">
              {/* 채팅 영역 */}
              <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
              {/* 채팅 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">AI 개발자와 채팅</h2>
                    <p className="text-xs text-gray-600">원하는 앱을 설명해주세요</p>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      {message.files && message.files.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-sm font-semibold mb-2">생성된 파일:</p>
                          <ul className="space-y-1">
                            {message.files.map((file, idx) => (
                              <li key={idx} className="text-sm flex items-center gap-2">
                                <Code className="w-4 h-4" />
                                <span>{file.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">나</span>
                      </div>
                    )}
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-gray-600">앱을 생성하는 중...</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">오류 발생</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="예: 블로그 웹사이트를 만들어줘"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
                    disabled={isGenerating}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span className="hidden sm:inline">전송</span>
                      </>
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  예: &quot;간단한 블로그 웹사이트&quot;, &quot;계산기 앱&quot;, &quot;포트폴리오 사이트&quot; 등
                </p>
              </div>
            </div>

            {/* 생성된 프로젝트 영역 */}
            {generatedProject && (
              <div className="lg:w-96 flex flex-col bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
                {/* 프로젝트 헤더 */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">생성된 프로젝트</h3>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">{generatedProject.name}</p>
                </div>

                {/* 파일 목록 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {generatedProject.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">{file.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{file.type}</p>
                    </div>
                  ))}
                </div>

                {/* 액션 버튼 */}
                <div className="border-t border-gray-200 p-4 space-y-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span>{showPreview ? '코드 보기' : '미리보기'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>다운로드</span>
                  </button>
                </div>
              </div>
            )}

            {/* 미리보기 영역 */}
            {showPreview && generatedProject && (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">미리보기</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="p-6">
                  {generatedProject.files.find((f) => f.name.includes('html') || f.name.includes('index')) ? (
                    <iframe
                      srcDoc={generatedProject.files.find((f) => f.name.includes('html') || f.name.includes('index'))?.content || ''}
                      className="w-full h-96 border border-gray-200 rounded-lg"
                      title="Preview"
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>미리보기를 사용할 수 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          ) : (
            /* 에디터 탭 */
            <div className="flex-1 flex flex-col mb-4">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden flex-1">
                <WebsiteEditor
                  initialFiles={generatedProject?.files || []}
                  onSave={(files) => {
                    if (generatedProject) {
                      setGeneratedProject({ ...generatedProject, files });
                    }
                    alert('저장되었습니다!');
                  }}
                  onDownload={(files) => {
                    const zipContent = files
                      .map((file) => `=== ${file.name} ===\n${file.content}\n\n`)
                      .join('\n');
                    const blob = new Blob([zipContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${generatedProject?.name || 'website'}-files.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
