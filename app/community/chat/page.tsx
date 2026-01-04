/**
 * 실시간 채팅 페이지
 * 채널별 실시간 채팅 시스템 (기본 구조)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Send, Hash, Users, Bell, BellOff,
  Search, Settings, Smile, Paperclip, X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  channel: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  unread?: number;
}

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels] = useState<Channel[]>([
    { id: 'general', name: '일반', description: '전체 공개 채팅' },
    { id: 'ai-search', name: 'AI-검색', description: 'AI 검색 관련 토론' },
    { id: 'translation', name: 'AI-번역', description: '번역 기능 토론' },
    { id: 'image-search', name: '이미지-검색', description: '이미지 검색 토론' },
    { id: 'qna', name: '질문-답변', description: '빠른 Q&A' },
    { id: 'projects', name: '프로젝트-공유', description: '프로젝트 소개' },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 예시 메시지 (나중에 WebSocket으로 실시간 전송)
  useEffect(() => {
    const exampleMessages: Message[] = [
      {
        id: '1',
        author: '사용자1',
        content: '안녕하세요! AI 검색 기능을 사용해보고 있는데 정말 좋네요.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        channel: 'general',
      },
      {
        id: '2',
        author: '사용자2',
        content: '번역 기능도 정말 빠르고 정확합니다!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        channel: 'general',
      },
    ];
    setMessages(exampleMessages);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      author: '나',
      content: message,
      timestamp: new Date(),
      channel: selectedChannel,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const getTimeString = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  실시간 채팅
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  사용자들과 실시간으로 소통하세요
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-col lg:flex-row h-[600px]">
              {/* 채널 사이드바 */}
              <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Hash size={20} />
                    채널
                  </h2>
                </div>
                <div className="space-y-1">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedChannel === channel.id
                          ? 'bg-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash size={16} />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      {channel.unread && channel.unread > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {channel.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </aside>

              {/* 채팅 영역 */}
              <div className="flex-1 flex flex-col">
                {/* 채널 헤더 */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <Hash size={20} />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {currentChannel?.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentChannel?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Users size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(m => m.channel === selectedChannel)
                    .map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-semibold">
                            {msg.author.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {msg.author}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getTimeString(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {msg.content}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 메시지 입력 */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Paperclip size={20} />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`#${currentChannel?.name}에 메시지 보내기...`}
                        rows={1}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* 안내 */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>참고:</strong> 현재는 기본 구조만 제공됩니다. 실시간 채팅 기능은 WebSocket 또는 Server-Sent Events (SSE)를 통해 구현할 예정입니다.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

