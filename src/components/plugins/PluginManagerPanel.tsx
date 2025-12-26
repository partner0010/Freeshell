'use client';

import React, { useState, useEffect } from 'react';
import { Puzzle, Plus, Power, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { pluginSystem, type Plugin } from '@/lib/plugins/plugin-system';
import { useToast } from '@/components/ui/Toast';

export function PluginManagerPanel() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = () => {
    const allPlugins = pluginSystem.getAllPlugins();
    setPlugins(allPlugins);
  };

  const handleToggle = (id: string) => {
    const plugin = pluginSystem.getPlugin(id);
    if (!plugin) return;

    if (plugin.enabled) {
      pluginSystem.deactivatePlugin(id);
      showToast({ type: 'success', message: `"${plugin.name}" 플러그인이 비활성화되었습니다` });
    } else {
      pluginSystem.activatePlugin(id);
      showToast({ type: 'success', message: `"${plugin.name}" 플러그인이 활성화되었습니다` });
    }
    loadPlugins();
  };

  const handleInstall = () => {
    // 플러그인 설치 로직
    showToast({ type: 'info', message: '플러그인 설치 기능은 개발 중입니다' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Puzzle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">플러그인 관리</h2>
              <p className="text-sm text-gray-500">기능 확장 및 커스터마이징</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleInstall}>
            <Plus size={18} className="mr-2" />
            플러그인 설치
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {plugins.length === 0 ? (
          <div className="text-center py-12">
            <Puzzle className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-400 mb-4">설치된 플러그인이 없습니다</p>
            <Button variant="outline" onClick={handleInstall}>
              <Download size={18} className="mr-2" />
              플러그인 마켓플레이스 열기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <Card key={plugin.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{plugin.name}</h4>
                        {plugin.enabled && (
                          <Badge variant="success" size="sm">
                            활성화됨
                          </Badge>
                        )}
                        <Badge variant="outline" size="sm">
                          v{plugin.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
                      <p className="text-xs text-gray-400">작성자: {plugin.author}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant={plugin.enabled ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggle(plugin.id)}
                      >
                        <Power size={14} className="mr-1" />
                        {plugin.enabled ? '비활성화' : '활성화'}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

