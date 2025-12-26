'use client';

import React, { useState } from 'react';
import { HardDrive, Plus, Download, RotateCcw, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { backupRestore, type Backup, type BackupType } from '@/lib/backup/backup-restore';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function BackupRestorePanel() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [activeTab, setActiveTab] = useState<'backups' | 'restore'>('backups');
  const [backupName, setBackupName] = useState('');
  const [backupType, setBackupType] = useState<BackupType>('full');
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    setBackups(backupRestore.getAllBackups());
  }, []);

  const backupTypeOptions = [
    { value: 'full', label: '전체 백업' },
    { value: 'incremental', label: '증분 백업' },
    { value: 'differential', label: '차등 백업' },
  ];

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      showToast({ type: 'warning', message: '백업 이름을 입력해주세요' });
      return;
    }

    setIsCreating(true);
    try {
      const backup = await backupRestore.createBackup(backupName, backupType);
      setBackups(backupRestore.getAllBackups());
      setBackupName('');
      showToast({ type: 'success', message: '백업이 완료되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '백업 중 오류가 발생했습니다' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    try {
      await backupRestore.startRestore(backupId);
      setBackups(backupRestore.getAllBackups());
      showToast({ type: 'success', message: '복원이 완료되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '복원 중 오류가 발생했습니다' });
    }
  };

  const handleDelete = (backupId: string) => {
    backupRestore.deleteBackup(backupId);
    setBackups(backupRestore.getAllBackups());
    showToast({ type: 'success', message: '백업이 삭제되었습니다' });
  };

  const tabs = [
    { id: 'backups', label: '백업' },
    { id: 'restore', label: '복원' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <HardDrive className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">백업 및 복원</h2>
            <p className="text-sm text-gray-500">데이터 백업 및 복원 관리</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'backups' ? (
          <>
            {/* 백업 생성 */}
            <Card>
              <CardHeader>
                <CardTitle>새 백업 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    placeholder="백업 이름"
                  />
                  <Dropdown
                    options={backupTypeOptions}
                    value={backupType}
                    onChange={(val) => setBackupType(val as BackupType)}
                    placeholder="백업 유형"
                  />
                  <Button
                    variant="primary"
                    onClick={handleCreateBackup}
                    disabled={isCreating}
                    className="w-full"
                  >
                    <Plus size={18} className="mr-2" />
                    {isCreating ? '백업 중...' : '백업 생성'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 백업 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>백업 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {backups.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    백업이 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backups.map((backup) => (
                      <div key={backup.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{backup.name}</h4>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span>{backupRestore.formatSize(backup.size)}</span>
                              <span>{backup.fileCount}개 파일</span>
                              <span>
                                <Clock size={12} className="inline mr-1" />
                                {backup.createdAt.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {backup.type === 'full' ? '전체' : backup.type === 'incremental' ? '증분' : '차등'}
                            </Badge>
                            {backup.status === 'completed' && (
                              <Badge variant="success">완료</Badge>
                            )}
                            {backup.status === 'failed' && (
                              <Badge variant="error">실패</Badge>
                            )}
                            {backup.status === 'in-progress' && (
                              <Badge variant="outline">진행 중</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(backup.id)}
                            disabled={backup.status !== 'completed'}
                          >
                            <RotateCcw size={14} className="mr-1" />
                            복원
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Download size={14} className="mr-1" />
                            다운로드
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(backup.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>복원 포인트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                복원 가능한 백업을 선택하세요
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

