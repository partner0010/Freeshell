/**
 * 플러그인 관리 컴포넌트
 */
'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Settings, Trash2, Power, PowerOff, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  enabled: boolean;
  permissions: any[];
}

export default function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/plugins');
      const data = await response.json();
      
      if (response.ok && data.plugins) {
        setPlugins(data.plugins);
      }
    } catch (error) {
      console.error('플러그인 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: enabled ? 'disable' : 'enable',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setPlugins(plugins.map(p => 
          p.id === pluginId ? { ...p, enabled: !enabled } : p
        ));
        alert(data.message || '플러그인 상태가 변경되었습니다.');
      } else {
        alert(data.error || '플러그인 상태 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('플러그인 상태 변경 오류:', error);
      alert('플러그인 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const removePlugin = async (pluginId: string) => {
    if (!confirm('정말 이 플러그인을 제거하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/plugins/${pluginId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        setPlugins(plugins.filter(p => p.id !== pluginId));
        alert(data.message || '플러그인이 제거되었습니다.');
      } else {
        alert(data.error || '플러그인 제거 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('플러그인 제거 오류:', error);
      alert('플러그인 제거 중 오류가 발생했습니다.');
    }
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Package className="w-6 h-6 text-primary" />
            <span>플러그인 관리</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            확장 기능을 설치하고 관리하세요
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>플러그인 추가</span>
        </button>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="플러그인 검색..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 플러그인 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map((plugin, index) => (
          <motion.div
            key={plugin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {plugin.icon ? (
                  <img src={plugin.icon} alt={plugin.name} className="w-12 h-12 rounded-lg" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{plugin.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">v{plugin.version}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${plugin.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {plugin.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span>작성자: {plugin.author}</span>
              <span>{plugin.permissions.length}개 권한</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => togglePlugin(plugin.id, plugin.enabled)}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  plugin.enabled
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {plugin.enabled ? (
                  <>
                    <PowerOff className="w-4 h-4" />
                    <span>비활성화</span>
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    <span>활성화</span>
                  </>
                )}
              </button>
              <button
                onClick={() => removePlugin(plugin.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? '검색 결과가 없습니다.' : '설치된 플러그인이 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
}
