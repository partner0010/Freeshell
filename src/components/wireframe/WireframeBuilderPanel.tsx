'use client';

import React, { useState } from 'react';
import { Layout, Plus, Download, Grid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { wireframeBuilder, type Wireframe } from '@/lib/wireframe/wireframe-builder';
import { useToast } from '@/components/ui/Toast';

export function WireframeBuilderPanel() {
  const [wireframeName, setWireframeName] = useState('');
  const [wireframe, setWireframe] = useState<Wireframe | null>(null);
  const { showToast } = useToast();

  const templates = [
    { name: '랜딩 페이지', id: 'landing' },
    { name: '대시보드', id: 'dashboard' },
    { name: '블로그', id: 'blog' },
    { name: '이커머스', id: 'ecommerce' },
  ];

  const handleCreateFromTemplate = (templateId: string) => {
    const templateName = templates.find((t) => t.id === templateId)?.name || templateId;
    const newWireframe = wireframeBuilder.fromTemplate(templateName);
    setWireframe(newWireframe);
    showToast({ type: 'success', message: '와이어프레임이 생성되었습니다' });
  };

  const handleCreateNew = () => {
    if (!wireframeName.trim()) {
      showToast({ type: 'warning', message: '이름을 입력해주세요' });
      return;
    }
    const newWireframe = wireframeBuilder.createWireframe(wireframeName);
    setWireframe(newWireframe);
    setWireframeName('');
    showToast({ type: 'success', message: '와이어프레임이 생성되었습니다' });
  };

  const handleExport = (format: 'json' | 'png' | 'svg') => {
    if (!wireframe) return;
    const filename = wireframeBuilder.exportWireframe(wireframe, format);
    showToast({ type: 'success', message: `${filename} 다운로드 준비됨` });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Layout className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">와이어프레임 빌더</h2>
            <p className="text-sm text-gray-500">30분 만에 전문가급 설계도 제작</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {!wireframe ? (
          <>
            {/* 템플릿 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>템플릿으로 시작</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      onClick={() => handleCreateFromTemplate(template.id)}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                    >
                      <Grid size={24} />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 새로 만들기 */}
            <Card>
              <CardHeader>
                <CardTitle>새 와이어프레임</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={wireframeName}
                    onChange={(e) => setWireframeName(e.target.value)}
                    placeholder="와이어프레임 이름"
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={handleCreateNew}>
                    <Plus size={18} className="mr-2" />
                    생성
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 와이어프레임 편집기 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{wireframe.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('json')}
                    >
                      <Download size={14} className="mr-1" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('png')}
                    >
                      <Download size={14} className="mr-1" />
                      PNG
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('svg')}
                    >
                      <Download size={14} className="mr-1" />
                      SVG
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="relative border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg mx-auto"
                  style={{
                    width: `${(wireframe.width / 1920) * 100}%`,
                    maxWidth: '100%',
                    aspectRatio: `${wireframe.width} / ${wireframe.height}`,
                  }}
                >
                  {wireframe.elements.map((element) => (
                    <div
                      key={element.id}
                      className="absolute border border-gray-400 bg-white/50 flex items-center justify-center text-xs text-gray-600"
                      style={{
                        left: `${(element.x / wireframe.width) * 100}%`,
                        top: `${(element.y / wireframe.height) * 100}%`,
                        width: `${(element.width / wireframe.width) * 100}%`,
                        height: `${(element.height / wireframe.height) * 100}%`,
                      }}
                    >
                      {element.label || element.type}
                    </div>
                  ))}
                  <div className="absolute top-2 right-2 text-xs text-gray-400">
                    {wireframe.width} × {wireframe.height}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  요소: {wireframe.elements.length}개
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              onClick={() => setWireframe(null)}
              className="w-full"
            >
              새 와이어프레임 만들기
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

