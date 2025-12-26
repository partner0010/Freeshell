'use client';

import React, { useState } from 'react';
import { Key, Plus, RotateCcw, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { secretsManager, type Secret, type SecretType } from '@/lib/secrets/secrets-manager';
import { useToast } from '@/components/ui/Toast';

export function SecretsManagerPanel() {
  const [secrets, setSecrets] = useState<Omit<Secret, 'value'>[]>([]);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [secretName, setSecretName] = useState('');
  const [secretType, setSecretType] = useState<SecretType>('api-key');
  const [secretValue, setSecretValue] = useState('');
  const [secretDescription, setSecretDescription] = useState('');
  const [showValue, setShowValue] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    setSecrets(secretsManager.getAllSecrets());
  }, []);

  const typeOptions = [
    { value: 'api-key', label: 'API Key' },
    { value: 'password', label: 'Password' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'token', label: 'Token' },
    { value: 'ssh-key', label: 'SSH Key' },
    { value: 'other', label: 'Other' },
  ];

  const handleCreateSecret = () => {
    if (!secretName.trim() || !secretValue.trim()) {
      showToast({ type: 'warning', message: '이름과 값을 입력해주세요' });
      return;
    }

    secretsManager.createSecret(secretName, secretType, secretValue, secretDescription);
    setSecrets(secretsManager.getAllSecrets());
    setSecretName('');
    setSecretValue('');
    setSecretDescription('');
    showToast({ type: 'success', message: 'Secret이 생성되었습니다' });
  };

  const handleViewSecret = (id: string) => {
    const secret = secretsManager.getSecret(id);
    if (secret) {
      setSelectedSecret(secret as Secret);
      setShowValue(true);
    }
  };

  const handleRotateSecret = () => {
    if (!selectedSecret) return;

    const newValue = prompt('새로운 값을 입력하세요:');
    if (newValue) {
      secretsManager.rotateSecret(selectedSecret.id, newValue);
      setSecrets(secretsManager.getAllSecrets());
      showToast({ type: 'success', message: 'Secret이 로테이션되었습니다' });
      setSelectedSecret(null);
      setShowValue(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
            <Key className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Secrets 관리</h2>
            <p className="text-sm text-gray-500">비밀 정보 암호화 저장 및 관리</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Secret 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 Secret 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
                placeholder="Secret 이름"
              />
              <Dropdown
                options={typeOptions}
                value={secretType}
                onChange={(val) => setSecretType(val as SecretType)}
                placeholder="Secret 타입"
              />
              <Input
                type="password"
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="Secret 값"
              />
              <Input
                value={secretDescription}
                onChange={(e) => setSecretDescription(e.target.value)}
                placeholder="설명 (선택사항)"
              />
              <Button variant="primary" onClick={handleCreateSecret} className="w-full">
                <Plus size={18} className="mr-2" />
                Secret 생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Secret 목록 */}
        {secrets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Secret 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {secrets.map((secret) => (
                  <div
                    key={secret.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSecret?.id === secret.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleViewSecret(secret.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Lock size={16} className="text-gray-500" />
                          <h4 className="font-semibold text-gray-800">{secret.name}</h4>
                          <Badge variant="outline" size="sm">{secret.type}</Badge>
                          {secret.environment && (
                            <Badge variant="outline" size="sm">{secret.environment}</Badge>
                          )}
                        </div>
                        {secret.description && (
                          <p className="text-sm text-gray-600">{secret.description}</p>
                        )}
                        {secret.lastRotated && (
                          <p className="text-xs text-gray-500 mt-1">
                            마지막 로테이션: {new Date(secret.lastRotated).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSecret(secret.id);
                          }}
                        >
                          {showValue && selectedSecret?.id === secret.id ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 Secret 상세 */}
        {selectedSecret && showValue && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedSecret.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRotateSecret}>
                    <RotateCcw size={14} className="mr-1" />
                    로테이션
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowValue(false);
                      setSelectedSecret(null);
                    }}
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">타입</label>
                  <Badge variant="outline" className="mt-1">{selectedSecret.type}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">값</label>
                  <Input
                    type={showValue ? 'text' : 'password'}
                    value={selectedSecret.value || ''}
                    readOnly
                    className="mt-1 font-mono"
                  />
                </div>
                {selectedSecret.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">설명</label>
                    <p className="text-sm text-gray-600 mt-1">{selectedSecret.description}</p>
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

