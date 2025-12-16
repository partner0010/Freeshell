'use client';

import React, { useState } from 'react';
import { Network, Plus, Play, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { apiBuilder, type APICollection, type APIEndpoint, type HttpMethod } from '@/lib/api/api-builder';
import { useToast } from '@/components/ui/Toast';

export function APIBuilderPanel() {
  const [collections, setCollections] = useState<APICollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<APICollection | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setCollections(apiBuilder.getAllCollections());
  }, []);

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const methodOptions = methods.map((m) => ({ value: m, label: m }));

  const handleCreateCollection = () => {
    if (!collectionName.trim() || !baseUrl.trim()) {
      showToast('warning', '이름과 Base URL을 입력해주세요');
      return;
    }

    const collection = apiBuilder.createCollection(collectionName, baseUrl);
    setCollections([...collections, collection]);
    setSelectedCollection(collection);
    setCollectionName('');
    setBaseUrl('');
    showToast('success', 'API 컬렉션이 생성되었습니다');
  };

  const handleAddEndpoint = (endpoint: Omit<APIEndpoint, 'id'>) => {
    if (!selectedCollection) return;

    apiBuilder.addEndpoint(selectedCollection.id, endpoint);
    setCollections(apiBuilder.getAllCollections());
    setSelectedCollection(apiBuilder.getCollection(selectedCollection.id) || null);
    showToast('success', '엔드포인트가 추가되었습니다');
  };

  const handleTestEndpoint = async (endpoint: APIEndpoint) => {
    if (!selectedCollection) return;

    try {
      const result = await apiBuilder.testEndpoint(endpoint, selectedCollection.baseUrl);
      showToast('success', `테스트 성공: ${JSON.stringify(result)}`);
    } catch (error) {
      showToast('error', '테스트 중 오류가 발생했습니다');
    }
  };

  const handleExport = (format: 'openapi' | 'postman') => {
    if (!selectedCollection) return;

    const exported = apiBuilder.exportCollection(selectedCollection.id, format);
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCollection.name}.${format === 'openapi' ? 'json' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '내보내기가 완료되었습니다');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Network className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">API 빌더</h2>
            <p className="text-sm text-gray-500">API 엔드포인트 설계 및 테스트</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 컬렉션 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 API 컬렉션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="컬렉션 이름"
              />
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="Base URL (예: https://api.example.com)"
              />
              <Button variant="primary" onClick={handleCreateCollection} className="w-full">
                <Plus size={18} className="mr-2" />
                컬렉션 생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 컬렉션 목록 */}
        {collections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>API 컬렉션</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCollection?.id === collection.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCollection(collection)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{collection.name}</h4>
                        <p className="text-xs text-gray-500">{collection.baseUrl}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          엔드포인트: {collection.endpoints.length}개
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport('openapi');
                          }}
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 컬렉션 상세 */}
        {selectedCollection && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedCollection.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('openapi')}
                  >
                    <Download size={14} className="mr-1" />
                    OpenAPI
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('postman')}
                  >
                    <Download size={14} className="mr-1" />
                    Postman
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 엔드포인트 목록 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">엔드포인트</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleAddEndpoint({
                          name: 'New Endpoint',
                          method: 'GET',
                          path: '/api/endpoint',
                        });
                      }}
                    >
                      <Plus size={14} className="mr-1" />
                      추가
                    </Button>
                  </div>
                  {selectedCollection.endpoints.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      엔드포인트가 없습니다
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCollection.endpoints.map((endpoint) => (
                        <div
                          key={endpoint.id}
                          className="p-3 border rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{endpoint.method}</Badge>
                              <span className="font-medium text-gray-800">{endpoint.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{endpoint.path}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestEndpoint(endpoint)}
                          >
                            <Play size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

