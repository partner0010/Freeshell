/**
 * 실시간 협업 패널
 * 여러 사용자가 동시에 편집
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Video, 
  UserPlus,
  X,
  Circle
} from 'lucide-react';
import CollaborationClient, { CollaborationUser } from '@/lib/collaboration/websocket';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

export default function CollaborationPanel({
  roomId,
  userId,
  userName,
  onCursorChange,
  onContentChange,
}: {
  roomId: string;
  userId: string;
  userName: string;
  onCursorChange?: (userId: string, cursor: { line: number; column: number }) => void;
  onContentChange?: (userId: string, change: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<CollaborationClient | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !clientRef.current) {
      const client = new CollaborationClient(userId, userName);
      clientRef.current = client;

      client.onUserJoin((user) => {
        setUsers(prev => {
          if (prev.find(u => u.id === user.id)) return prev;
          return [...prev, user];
        });
      });

      client.onUserLeave((userId) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
      });

      client.onMessage((message) => {
        if (message.type === 'chat') {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            userId: message.userId,
            userName: message.data.userName || 'Unknown',
            message: message.data.message,
            timestamp: new Date(message.timestamp),
          }]);
        } else if (message.type === 'cursor' && onCursorChange) {
          onCursorChange(message.userId, message.data.cursor);
        } else if (message.type === 'change' && onContentChange) {
          onContentChange(message.userId, message.data.change);
        }
      });

      client.onError((error) => {
        console.error('협업 오류:', error);
        setIsConnected(false);
      });

      client.connect(roomId);
      setIsConnected(true);
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [isOpen, roomId, userId, userName, onCursorChange, onContentChange]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = () => {
    if (chatInput.trim() && clientRef.current) {
      clientRef.current.sendChat(chatInput);
      setChatInput('');
    }
  };

  const sendCursor = (cursor: { line: number; column: number }) => {
    if (clientRef.current) {
      clientRef.current.sendCursor(cursor);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
        title="협업 시작"
      >
        <Users className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-2xl border-2 border-purple-200 flex flex-col max-h-[600px]">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <h3 className="font-semibold text-gray-900">협업</h3>
          <span className="text-xs text-gray-500">({users.length}명)</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 사용자 목록 */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">참여자</h4>
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="flex items-center gap-2 text-sm">
              <Circle className="w-3 h-3" style={{ color: user.color }} fill={user.color} />
              <span className="text-gray-700">{user.name}</span>
              {user.id === userId && (
                <span className="text-xs text-gray-500">(나)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 채팅 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg ${
              msg.userId === userId
                ? 'bg-blue-50 ml-4'
                : 'bg-gray-50 mr-4'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-700">{msg.userName}</span>
              <span className="text-xs text-gray-500">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-900">{msg.message}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* 채팅 입력 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChat()}
            placeholder="메시지 입력..."
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
          />
          <button
            onClick={sendChat}
            disabled={!chatInput.trim()}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
