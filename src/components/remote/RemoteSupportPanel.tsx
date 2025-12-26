'use client';

import React, { useState } from 'react';
import { Monitor, Plus, Share2, MessageSquare, FileText, Play, Square, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { remoteSupportManager, type RemoteSession, type ChatMessage, type FileTransfer } from '@/lib/remote/remote-support';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function RemoteSupportPanel() {
  const [sessions, setSessions] = useState<RemoteSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<RemoteSession | null>(null);
  const [sessionCode, setSessionCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [fileTransfers, setFileTransfers] = useState<FileTransfer[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    setSessions(remoteSupportManager.getActiveSessions());
  }, []);

  const handleCreateSession = () => {
    setIsCreating(true);
    const session = remoteSupportManager.createSession('current-user');
    setSessions([...sessions, session]);
    setSelectedSession(session);
    setIsCreating(false);
    showToast({ type: 'success', message: `세션이 생성되었습니다. 코드: ${session.sessionCode}` });
  };

  const handleConnect = () => {
    if (!sessionCode.trim()) {
      showToast({ type: 'warning', message: '세션 코드를 입력해주세요' });
      return;
    }

    const session = remoteSupportManager.connectToSession(sessionCode, 'current-user');
    if (session) {
      setSelectedSession(session);
      setSessions([...sessions, session]);
      showToast({ type: 'success', message: '세션에 연결되었습니다' });
    } else {
      showToast({ type: 'error', message: '세션을 찾을 수 없거나 이미 종료되었습니다' });
    }
  };

  const handleEndSession = (sessionId: string) => {
    remoteSupportManager.endSession(sessionId);
    setSessions(remoteSupportManager.getActiveSessions());
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
    showToast({ type: 'success', message: '세션이 종료되었습니다' });
  };

  const handleSendMessage = () => {
    if (!selectedSession || !newMessage.trim()) return;

    remoteSupportManager.addChatMessage(selectedSession.id, 'current-user', newMessage);
    setChatMessages(remoteSupportManager.getChatMessages(selectedSession.id));
    setNewMessage('');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast({ type: 'success', message: '코드가 복사되었습니다' });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStartFileTransfer = () => {
    if (!selectedSession) return;

    const transfer = remoteSupportManager.startFileTransfer(
      selectedSession.id,
      'example-file.txt',
      1024 * 1024, // 1MB
      'upload'
    );
    setFileTransfers(remoteSupportManager.getFileTransfers(selectedSession.id));
    
    // 시뮬레이션: 진행률 업데이트
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      remoteSupportManager.updateFileTransferProgress(transfer.id, progress);
      setFileTransfers(remoteSupportManager.getFileTransfers(selectedSession.id));
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 500);
  };

  React.useEffect(() => {
    if (selectedSession) {
      setChatMessages(remoteSupportManager.getChatMessages(selectedSession.id));
      setFileTransfers(remoteSupportManager.getFileTransfers(selectedSession.id));
    }
  }, [selectedSession]);

  const tabs = [
    { id: 'sessions', label: '세션 관리' },
    { id: 'connect', label: '연결' },
  ];

  const [activeTab, setActiveTab] = useState<'sessions' | 'connect'>('sessions');

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Monitor className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">원격 지원 (ANYSUPPORT 스타일)</h2>
            <p className="text-sm text-gray-500">화면 공유, 원격 제어, 파일 전송, 채팅 지원</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'sessions' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>원격 지원 세션</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="primary" onClick={handleCreateSession} className="w-full" disabled={isCreating}>
                    <Plus size={18} className="mr-2" />
                    {isCreating ? '세션 생성 중...' : '새 세션 생성'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {sessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>활성 세션</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSession?.id === session.id
                            ? 'bg-primary-50 border-primary-300'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800">세션 {session.sessionCode}</h4>
                              <Badge variant={session.status === 'active' ? 'success' : 'outline'}>
                                {session.status === 'active' ? '활성' : session.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>호스트: {session.hostUserId}</span>
                              {session.clientUserId && <span>클라이언트: {session.clientUserId}</span>}
                            </div>
                            {session.duration && (
                              <p className="text-xs text-gray-500 mt-1">
                                지속 시간: {Math.floor(session.duration / 60)}분 {session.duration % 60}초
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(session.sessionCode);
                              }}
                            >
                              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                            </Button>
                            {session.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEndSession(session.id);
                                }}
                              >
                                <Square size={14} className="mr-1" />
                                종료
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedSession && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>권한 설정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">화면 공유</span>
                        <Badge variant={selectedSession.permissions.screenShare ? 'success' : 'outline'}>
                          {selectedSession.permissions.screenShare ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">원격 제어</span>
                        <Badge variant={selectedSession.permissions.remoteControl ? 'success' : 'outline'}>
                          {selectedSession.permissions.remoteControl ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">파일 전송</span>
                        <Badge variant={selectedSession.permissions.fileTransfer ? 'success' : 'outline'}>
                          {selectedSession.permissions.fileTransfer ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">채팅</span>
                        <Badge variant={selectedSession.permissions.chat ? 'success' : 'outline'}>
                          {selectedSession.permissions.chat ? '활성' : '비활성'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>채팅</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className="text-sm">
                            <span className="font-medium text-gray-700">{msg.userId}:</span>{' '}
                            <span className="text-gray-600">{msg.message}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="메시지 입력..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button variant="primary" onClick={handleSendMessage}>
                          <MessageSquare size={18} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>파일 전송</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" onClick={handleStartFileTransfer} className="w-full">
                        <FileText size={18} className="mr-2" />
                        파일 전송 시작 (시뮬레이션)
                      </Button>
                      {fileTransfers.length > 0 && (
                        <div className="space-y-2">
                          {fileTransfers.map((transfer) => (
                            <div key={transfer.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{transfer.fileName}</span>
                                <Badge variant="outline">{transfer.direction}</Badge>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-500 h-2 rounded-full transition-all"
                                  style={{ width: `${transfer.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{transfer.progress}%</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>세션에 연결</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="세션 코드 입력 (예: ABC123)"
                  maxLength={6}
                />
                <Button variant="primary" onClick={handleConnect} className="w-full">
                  <Share2 size={18} className="mr-2" />
                  연결
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

