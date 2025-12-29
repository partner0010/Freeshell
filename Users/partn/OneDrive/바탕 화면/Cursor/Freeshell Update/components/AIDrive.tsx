'use client';

import { useState } from 'react';
import { Folder, File, Image, Video, FileText, Presentation, Globe, Download, Share2, Trash2, Upload, Search, Grid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DriveItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: 'image' | 'video' | 'document' | 'presentation' | 'website' | 'other';
  size?: string;
  modifiedAt: string;
  url?: string;
}

export default function AIDrive() {
  const [items, setItems] = useState<DriveItem[]>([
    {
      id: '1',
      name: '파리 여행 계획서',
      type: 'file',
      fileType: 'document',
      size: '2.4 MB',
      modifiedAt: '2024-01-15',
      url: '#',
    },
    {
      id: '2',
      name: '제품 소개 비디오',
      type: 'file',
      fileType: 'video',
      size: '15.8 MB',
      modifiedAt: '2024-01-14',
      url: '#',
    },
    {
      id: '3',
      name: '프레젠테이션',
      type: 'file',
      fileType: 'presentation',
      size: '5.2 MB',
      modifiedAt: '2024-01-13',
      url: '#',
    },
    {
      id: '4',
      name: '생성된 웹사이트',
      type: 'file',
      fileType: 'website',
      size: '1.1 MB',
      modifiedAt: '2024-01-12',
      url: '#',
    },
    {
      id: '5',
      name: '프로젝트 폴더',
      type: 'folder',
      modifiedAt: '2024-01-10',
    },
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return FileText;
      case 'presentation': return Presentation;
      case 'website': return Globe;
      default: return File;
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(i => i !== id));
  };

  const handleUpload = () => {
    // 파일 업로드 로직
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        // 파일 업로드 처리
        console.log('Uploading files:', files);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI 드라이브</h2>
              <p className="text-gray-600 dark:text-gray-400">생성된 모든 콘텐츠를 저장하고 관리하세요</p>
            </div>
          </div>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>업로드</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="파일 검색..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="mb-4 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
            <span className="text-primary font-medium">
              {selectedItems.length}개 항목 선택됨
            </span>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>다운로드</span>
              </button>
              <button className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </button>
              <button
                onClick={() => {
                  selectedItems.forEach(id => handleDelete(id));
                  setSelectedItems([]);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>삭제</span>
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const Icon = item.type === 'folder' ? Folder : getFileIcon(item.fileType);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      selectedItems.includes(item.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                    }`}
                    onClick={() => handleSelect(item.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-3 ${
                        item.type === 'folder'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          item.type === 'folder'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <h3 className="font-medium text-sm mb-1 truncate w-full">{item.name}</h3>
                      {item.size && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.size}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {item.modifiedAt}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {item.type === 'file' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // 다운로드 로직
                            }}
                            className="p-1 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // 공유 로직
                            }}
                            className="p-1 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-1 bg-white dark:bg-gray-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.type === 'folder' ? Folder : getFileIcon(item.fileType);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedItems.includes(item.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                    }`}
                    onClick={() => handleSelect(item.id)}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                      item.type === 'folder'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        item.type === 'folder'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.size && <span>{item.size}</span>}
                        <span>{item.modifiedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.type === 'file' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // 다운로드 로직
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // 공유 로직
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>파일이 없습니다. 업로드하거나 생성해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

