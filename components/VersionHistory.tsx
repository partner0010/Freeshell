/**
 * 버전 관리 컴포넌트
 * 변경 이력 저장 및 복구
 */
'use client';

import { useState, useEffect } from 'react';
import { History, RotateCcw, Trash2, Eye } from 'lucide-react';

interface Version {
  id: string;
  timestamp: Date;
  files: Array<{ name: string; type: string; content: string }>;
  description?: string;
}

interface VersionHistoryProps {
  currentFiles: Array<{ name: string; type: string; content: string }>;
  onRestore: (files: Array<{ name: string; type: string; content: string }>) => void;
}

export default function VersionHistory({ currentFiles, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    // 파일 변경 시 자동으로 버전 저장
    if (currentFiles.length > 0) {
      saveVersion();
    }
  }, [currentFiles]);

  const loadVersions = () => {
    try {
      const saved = localStorage.getItem('editor-versions');
      if (saved) {
        const parsed = JSON.parse(saved);
        setVersions(parsed.map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp),
        })));
      }
    } catch (error) {
      console.error('버전 로드 실패:', error);
    }
  };

  const saveVersion = () => {
    try {
      const newVersion: Version = {
        id: Date.now().toString(),
        timestamp: new Date(),
        files: JSON.parse(JSON.stringify(currentFiles)), // Deep copy
      };

      const updated = [newVersion, ...versions].slice(0, 50); // 최대 50개
      setVersions(updated);
      localStorage.setItem('editor-versions', JSON.stringify(updated));
    } catch (error) {
      console.error('버전 저장 실패:', error);
    }
  };

  const handleRestore = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      onRestore(version.files);
      setSelectedVersion(null);
    }
  };

  const handleDelete = (versionId: string) => {
    const updated = versions.filter(v => v.id !== versionId);
    setVersions(updated);
    localStorage.setItem('editor-versions', JSON.stringify(updated));
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">버전 이력</h3>
        </div>
        <p className="text-xs text-gray-500">최대 50개 버전 저장</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">저장된 버전이 없습니다</p>
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className={`p-3 border rounded-lg transition-all ${
                selectedVersion === version.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">
                    {version.timestamp.toLocaleString()}
                  </p>
                  {version.description && (
                    <p className="text-xs text-gray-500 mt-1">{version.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {version.files.length}개 파일
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRestore(version.id)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="이 버전으로 복구"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(version.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
