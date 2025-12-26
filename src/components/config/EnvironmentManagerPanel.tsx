'use client';

import React, { useState } from 'react';
import { Settings, Plus, Download, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { environmentManager, type Environment, type EnvironmentVariable, type EnvironmentType } from '@/lib/config/environment-manager';
import { useToast } from '@/components/ui/Toast';

export function EnvironmentManagerPanel() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  React.useEffect(() => {
    setEnvironments(environmentManager.getAllEnvironments());
    if (environments.length > 0 && !selectedEnv) {
      setSelectedEnv(environments[0]);
    }
  }, []);

  const envTypeOptions = [
    { value: 'development', label: 'Development' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' },
  ];

  const variableTypeOptions = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'secret', label: 'Secret' },
  ];

  const handleAddVariable = () => {
    if (!selectedEnv || !newKey.trim() || !newValue.trim()) {
      showToast({ type: 'warning', message: '키와 값을 입력해주세요' });
      return;
    }

    try {
      environmentManager.addVariable(selectedEnv.id, {
        key: newKey,
        value: newValue,
        type: 'string',
      });
      setEnvironments(environmentManager.getAllEnvironments());
      setSelectedEnv(environmentManager.getEnvironment(selectedEnv.id) || null);
      setNewKey('');
      setNewValue('');
      showToast({ type: 'success', message: '변수가 추가되었습니다' });
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '변수 추가 중 오류가 발생했습니다' });
    }
  };

  const handleExport = (format: 'env' | 'json') => {
    if (!selectedEnv) return;

    try {
      const exported = format === 'env'
        ? environmentManager.exportEnvFile(selectedEnv.id)
        : environmentManager.exportJSON(selectedEnv.id);

      const blob = new Blob([exported], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `.env.${selectedEnv.name.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast({ type: 'success', message: '내보내기가 완료되었습니다' });
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '내보내기 중 오류가 발생했습니다' });
    }
  };

  const toggleSecret = (key: string) => {
    const newRevealed = new Set(revealedSecrets);
    if (newRevealed.has(key)) {
      newRevealed.delete(key);
    } else {
      newRevealed.add(key);
    }
    setRevealedSecrets(newRevealed);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Settings className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">환경 변수 관리</h2>
            <p className="text-sm text-gray-500">보안 설정 및 구성 관리</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 환경 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>환경 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {environments.map((env) => (
                <Button
                  key={env.id}
                  variant={selectedEnv?.id === env.id ? 'primary' : 'outline'}
                  onClick={() => setSelectedEnv(env)}
                  className="justify-start"
                >
                  {env.name}
                  <Badge variant="outline" size="sm" className="ml-2">
                    {env.variables.length}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 변수 목록 */}
        {selectedEnv && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedEnv.name} 환경 변수</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('env')}
                    >
                      <Download size={14} className="mr-1" />
                      .env
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('json')}
                    >
                      <Download size={14} className="mr-1" />
                      JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedEnv.variables.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      변수가 없습니다
                    </div>
                  ) : (
                    selectedEnv.variables.map((variable) => (
                      <div key={variable.key} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">{variable.key}</span>
                              <Badge variant="outline" size="sm">{variable.type}</Badge>
                              {variable.type === 'secret' && (
                                <Lock size={12} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {variable.type === 'secret' && !revealedSecrets.has(variable.key)
                                  ? '••••••••'
                                  : variable.value}
                              </code>
                              {variable.type === 'secret' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSecret(variable.key)}
                                >
                                  {revealedSecrets.has(variable.key) ? (
                                    <EyeOff size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 변수 추가 */}
            <Card>
              <CardHeader>
                <CardTitle>변수 추가</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="변수 키 (예: API_KEY)"
                  />
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="변수 값"
                    type="password"
                  />
                  <Button variant="primary" onClick={handleAddVariable} className="w-full">
                    <Plus size={18} className="mr-2" />
                    변수 추가
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

