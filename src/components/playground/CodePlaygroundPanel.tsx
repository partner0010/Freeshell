'use client';

import React, { useState } from 'react';
import { Code, Play, Plus, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { codePlayground, type PlaygroundSession, type Language } from '@/lib/playground/code-playground';
import { useToast } from '@/components/ui/Toast';

export function CodePlaygroundPanel() {
  const [sessions, setSessions] = useState<PlaygroundSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PlaygroundSession | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [isExecuting, setIsExecuting] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    setSessions(codePlayground.getAllSessions());
  }, []);

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'python', label: 'Python' },
    { value: 'react', label: 'React' },
  ];

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      showToast({ type: 'warning', message: '세션 이름을 입력해주세요' });
      return;
    }

    const session = codePlayground.createSession(sessionName, language);
    setSessions([...sessions, session]);
    setSelectedSession(session);
    setSessionName('');
    showToast({ type: 'success', message: '세션이 생성되었습니다' });
  };

  const handleExecute = async () => {
    if (!selectedSession) return;

    setIsExecuting(true);
    try {
      const result = await codePlayground.executeCode(selectedSession);
      selectedSession.output = result.output;
      selectedSession.errors = result.errors;
      setSessions(codePlayground.getAllSessions());
      setSelectedSession({ ...selectedSession });
      showToast({ type: 'success', message: '코드가 실행되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '실행 중 오류가 발생했습니다' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCodeChange = (code: string) => {
    if (!selectedSession) return;
    selectedSession.code = code;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Code className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">코드 플레이그라운드</h2>
            <p className="text-sm text-gray-500">코드를 작성하고 즉시 실행</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 세션 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 플레이그라운드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="세션 이름"
                className="flex-1"
              />
              <Dropdown
                options={languageOptions}
                value={language}
                onChange={(val) => setLanguage(val as Language)}
                className="w-40"
              />
              <Button variant="primary" onClick={handleCreateSession}>
                <Plus size={18} className="mr-2" />
                생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 세션 목록 */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>플레이그라운드 세션</CardTitle>
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
                        <h4 className="font-semibold text-gray-800">{session.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{session.language}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 코드 편집기 */}
        {selectedSession && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedSession.name}</CardTitle>
                <Button
                  variant="primary"
                  onClick={handleExecute}
                  disabled={isExecuting}
                >
                  <Play size={14} className="mr-1" />
                  {isExecuting ? '실행 중...' : '실행'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  value={selectedSession.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full h-64 p-4 border rounded-lg font-mono text-sm"
                  placeholder="코드를 입력하세요..."
                />
                {selectedSession.output && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">출력:</h4>
                    <pre className="text-sm text-green-700 whitespace-pre-wrap">
                      {selectedSession.output}
                    </pre>
                  </div>
                )}
                {selectedSession.errors && selectedSession.errors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">오류:</h4>
                    <pre className="text-sm text-red-700 whitespace-pre-wrap">
                      {selectedSession.errors.join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

