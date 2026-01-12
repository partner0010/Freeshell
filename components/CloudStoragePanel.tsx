/**
 * 클라우드 저장소 패널
 * Google Drive, Dropbox, GitHub 연동
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw,
  CheckCircle,
  X,
  Folder,
  File
} from 'lucide-react';
import { cloudStorageProviders, CloudStorageProvider } from '@/lib/storage/cloud-storage';
import EnhancedButton from './EnhancedButton';
import EnhancedCard from './EnhancedCard';

export default function CloudStoragePanel({
  files,
  projectName,
  onLoad,
}: {
  files: Array<{ name: string; type: string; content: string }>;
  projectName: string;
  onLoad: (files: Array<{ name: string; type: string; content: string }>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const [savedFiles, setSavedFiles] = useState<Array<{ id: string; name: string; modified: Date; provider: string }>>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSavedFiles();
    }
  }, [isOpen]);

  const connectProvider = async (provider: CloudStorageProvider) => {
    setIsLoading(true);
    try {
      const connected = await provider.connect();
      if (connected) {
        setConnectedProviders(prev => new Set([...prev, provider.id]));
      }
    } catch (error) {
      console.error('연결 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToCloud = async (provider: CloudStorageProvider) => {
    setIsLoading(true);
    try {
      const fileId = await provider.save(files, projectName);
      await loadSavedFiles();
      alert('클라우드에 저장되었습니다!');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromCloud = async (fileId: string, providerId: string) => {
    setIsLoading(true);
    try {
      const provider = cloudStorageProviders.find(p => p.id === providerId);
      if (provider) {
        const loadedFiles = await provider.load(fileId);
        onLoad(loadedFiles);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('로드 실패:', error);
      alert('파일을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedFiles = async () => {
    const allFiles: Array<{ id: string; name: string; modified: Date; provider: string }> = [];
    
    for (const provider of cloudStorageProviders) {
      try {
        const files = await provider.list();
        allFiles.push(...files.map(f => ({ ...f, provider: provider.id })));
      } catch (error) {
        console.error(`${provider.name} 파일 목록 로드 실패:`, error);
      }
    }

    setSavedFiles(allFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime()));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
        title="클라우드 저장소"
      >
        <Cloud className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <EnhancedCard className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">클라우드 저장소</h2>
              <p className="text-sm text-gray-600">프로젝트를 클라우드에 저장하고 불러오기</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* 제공자 목록 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">연동 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cloudStorageProviders.map(provider => {
                const isConnected = connectedProviders.has(provider.id);
                return (
                  <div
                    key={provider.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{provider.icon}</span>
                        <span className="font-semibold text-gray-900">{provider.name}</span>
                      </div>
                      {isConnected ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : null}
                    </div>
                    {!isConnected ? (
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        onClick={() => connectProvider(provider)}
                        loading={isLoading}
                        fullWidth
                      >
                        연결하기
                      </EnhancedButton>
                    ) : (
                      <EnhancedButton
                        variant="gradient"
                        size="sm"
                        onClick={() => saveToCloud(provider)}
                        loading={isLoading}
                        icon={Upload}
                        fullWidth
                      >
                        저장하기
                      </EnhancedButton>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 저장된 파일 목록 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">저장된 프로젝트</h3>
              <button
                onClick={loadSavedFiles}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {savedFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>저장된 프로젝트가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedFiles.map(file => {
                  const provider = cloudStorageProviders.find(p => p.id === file.provider);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{provider?.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.modified.toLocaleString()} • {provider?.name}
                          </p>
                        </div>
                      </div>
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        onClick={() => loadFromCloud(file.id, file.provider)}
                        loading={isLoading}
                        icon={Download}
                      >
                        불러오기
                      </EnhancedButton>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </EnhancedCard>
    </div>
  );
}
