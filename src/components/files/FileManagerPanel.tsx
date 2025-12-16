'use client';

import React, { useState } from 'react';
import { Folder, Upload, Search, Image, File, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { fileManager, type FileItem, type FileType } from '@/lib/files/file-manager';
import { useToast } from '@/components/ui/Toast';

export function FileManagerPanel() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    setFiles(fileManager.getAllFiles());
  }, []);

  React.useEffect(() => {
    const results = fileManager.searchFiles(
      searchQuery,
      filterType !== 'all' ? filterType as FileType : undefined
    );
    setFiles(results);
  }, [searchQuery, filterType]);

  const typeOptions = [
    { value: 'all', label: '전체' },
    { value: 'image', label: '이미지' },
    { value: 'video', label: '비디오' },
    { value: 'audio', label: '오디오' },
    { value: 'document', label: '문서' },
    { value: 'archive', label: '압축' },
  ];

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        await fileManager.uploadFile(fileList[i]);
      }
      setFiles(fileManager.getAllFiles());
      showToast('success', '파일이 업로드되었습니다');
    } catch (error) {
      showToast('error', '업로드 중 오류가 발생했습니다');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    fileManager.deleteFile(id);
    setFiles(fileManager.getAllFiles());
    showToast('success', '파일이 삭제되었습니다');
  };

  const getTypeIcon = (type: FileType) => {
    switch (type) {
      case 'image':
        return <Image size={20} className="text-blue-500" />;
      case 'video':
        return <File size={20} className="text-purple-500" />;
      case 'audio':
        return <File size={20} className="text-green-500" />;
      case 'document':
        return <File size={20} className="text-red-500" />;
      case 'archive':
        return <Folder size={20} className="text-orange-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type: FileType) => {
    switch (type) {
      case 'image':
        return 'bg-blue-100 text-blue-700';
      case 'video':
        return 'bg-purple-100 text-purple-700';
      case 'audio':
        return 'bg-green-100 text-green-700';
      case 'document':
        return 'bg-red-100 text-red-700';
      case 'archive':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Folder className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">파일 관리자</h2>
            <p className="text-sm text-gray-500">미디어 라이브러리 및 파일 관리</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 업로드 및 검색 */}
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-600 mb-3">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-base">
                    {isUploading ? '업로드 중...' : '파일 선택'}
                  </span>
                </label>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="파일 검색..."
                    className="pl-10"
                  />
                </div>
                <Dropdown
                  options={typeOptions}
                  value={filterType}
                  onChange={setFilterType}
                  placeholder="유형"
                  className="w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 파일 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>파일 목록 ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                파일이 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div key={file.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getTypeIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{file.name}</h4>
                          <p className="text-xs text-gray-500">
                            {fileManager.formatSize(file.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className={getTypeColor(file.type)} size="sm">
                        {file.type}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Download size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

