'use client';

import React, { useState } from 'react';
import { FileText, Plus, Download, Code, Book } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { documentationGenerator, type APIDocumentation, type APIEndpoint } from '@/lib/docs/documentation-generator';
import { useToast } from '@/components/ui/Toast';

export function DocumentationGeneratorPanel() {
  const [title, setTitle] = useState('API Documentation');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const { showToast } = useToast();

  const handleAddEndpoint = () => {
    setEndpoints([...endpoints, {
      method: 'GET',
      path: '/api/endpoint',
      description: 'New endpoint',
    }]);
  };

  const handleGenerate = (format: 'markdown' | 'openapi' | 'html') => {
    const docs: APIDocumentation = {
      title,
      description,
      version,
      endpoints,
    };

    let content = '';
    let filename = '';

    switch (format) {
      case 'markdown':
        content = documentationGenerator.generateAPIDocs(docs);
        filename = 'api-docs.md';
        break;
      case 'openapi':
        content = documentationGenerator.generateOpenAPI(docs);
        filename = 'openapi.json';
        break;
      case 'html':
        content = documentationGenerator.generateHTML(docs);
        filename = 'api-docs.html';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', message: `${format.toUpperCase()} 문서가 생성되었습니다` });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Book className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">문서화 생성기</h2>
            <p className="text-sm text-gray-500">API 문서 자동 생성</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 문서 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>문서 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="문서 제목"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="문서 설명"
              />
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="버전"
              />
            </div>
          </CardContent>
        </Card>

        {/* 엔드포인트 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API 엔드포인트</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddEndpoint}>
                <Plus size={14} className="mr-1" />
                엔드포인트 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {endpoints.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  엔드포인트가 없습니다
                </div>
              ) : (
                endpoints.map((endpoint, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-semibold">{endpoint.method}</code>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 문서 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>문서 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleGenerate('markdown')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <FileText size={24} />
                Markdown
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerate('openapi')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Code size={24} />
                OpenAPI
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerate('html')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <FileText size={24} />
                HTML
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

