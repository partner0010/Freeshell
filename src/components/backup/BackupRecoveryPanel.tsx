'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  HardDrive,
  Play,
  AlertTriangle,
} from 'lucide-react';
import {
  backupSystem,
  type BackupJob,
  type RestoreJob,
} from '@/lib/backup/recovery-system';

export function BackupRecoveryPanel() {
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [restores, setRestores] = useState<RestoreJob[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    loadBackups();
    loadRestores();
  }, []);

  const loadBackups = () => {
    setBackups(backupSystem.getBackups());
  };

  const loadRestores = () => {
    setRestores(backupSystem.getRestoreJobs());
  };

  const handleRunBackup = async () => {
    setIsRunning(true);
    try {
      const job = await backupSystem.runBackup('daily-full');
      loadBackups();
    } catch (error) {
      alert(`백업 실패: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    setIsRunning(true);
    try {
      const job = await backupSystem.restoreBackup(backupId, '/restore');
      loadRestores();
    } catch (error) {
      alert(`복구 실패: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-green-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      case 'running':
        return <RefreshCw className="text-blue-600 animate-spin" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <HardDrive className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">백업 및 복구</h2>
              <p className="text-sm text-gray-500">데이터 백업 및 재해복구 시스템</p>
            </div>
          </div>
          <button
            onClick={handleRunBackup}
            disabled={isRunning}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                백업 중...
              </>
            ) : (
              <>
                <Download size={16} />
                백업 실행
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 백업 목록 */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-4">백업 이력</h3>
          <div className="space-y-3">
            {backups.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                백업이 없습니다
              </div>
            ) : (
              backups.map((backup) => (
                <div
                  key={backup.id}
                  className="p-4 bg-white border rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(backup.status)}
                    <div>
                      <div className="font-semibold text-gray-800">
                        {new Date(backup.startedAt).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        크기: {formatSize(backup.size)} • 파일: {backup.fileCount || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {backup.status === 'completed' && (
                      <button
                        onClick={() => handleRestore(backup.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                      >
                        <Upload size={14} />
                        복구
                      </button>
                    )}
                    <span className="text-xs text-gray-500">
                      {backup.completedAt && backup.startedAt
                        ? `${((backup.completedAt - backup.startedAt) / 1000).toFixed(1)}s`
                        : '-'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 복구 이력 */}
        {restores.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">복구 이력</h3>
            <div className="space-y-3">
              {restores.map((restore) => (
                <div
                  key={restore.id}
                  className="p-4 bg-white border rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(restore.status)}
                    <div>
                      <div className="font-semibold text-gray-800">
                        {new Date(restore.startedAt).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        대상: {restore.target}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {restore.completedAt && restore.startedAt
                      ? `${((restore.completedAt - restore.startedAt) / 1000).toFixed(1)}s`
                      : '-'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

