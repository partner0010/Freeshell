'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Variable,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  Calendar,
  User,
  Globe,
  Clock,
  Hash,
  Link,
} from 'lucide-react';

interface DynamicVariable {
  id: string;
  name: string;
  key: string;
  type: 'text' | 'date' | 'time' | 'user' | 'url' | 'number';
  defaultValue: string;
  description?: string;
}

const builtInVariables: DynamicVariable[] = [
  { id: 'date', name: '현재 날짜', key: '{{date}}', type: 'date', defaultValue: new Date().toLocaleDateString('ko-KR') },
  { id: 'time', name: '현재 시간', key: '{{time}}', type: 'time', defaultValue: new Date().toLocaleTimeString('ko-KR') },
  { id: 'year', name: '연도', key: '{{year}}', type: 'number', defaultValue: new Date().getFullYear().toString() },
  { id: 'url', name: '현재 URL', key: '{{url}}', type: 'url', defaultValue: 'https://example.com' },
  { id: 'visitor_name', name: '방문자 이름', key: '{{visitor_name}}', type: 'user', defaultValue: '방문자' },
];

const typeIcons = {
  text: Hash,
  date: Calendar,
  time: Clock,
  user: User,
  url: Link,
  number: Hash,
};

export default function DynamicContent() {
  const [customVariables, setCustomVariables] = useState<DynamicVariable[]>([
    { id: 'company', name: '회사명', key: '{{company}}', type: 'text', defaultValue: 'GRIP', description: '회사 이름' },
    { id: 'email', name: '이메일', key: '{{email}}', type: 'text', defaultValue: 'support@grip.app', description: '지원 이메일' },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariable, setNewVariable] = useState({
    name: '',
    key: '',
    type: 'text' as const,
    defaultValue: '',
    description: '',
  });

  const addVariable = () => {
    if (!newVariable.name || !newVariable.key) return;
    
    const variable: DynamicVariable = {
      id: Date.now().toString(),
      ...newVariable,
      key: `{{${newVariable.key}}}`,
    };
    
    setCustomVariables([...customVariables, variable]);
    setNewVariable({ name: '', key: '', type: 'text', defaultValue: '', description: '' });
    setShowAddForm(false);
  };

  const removeVariable = (id: string) => {
    setCustomVariables(customVariables.filter(v => v.id !== id));
  };

  const updateVariable = (id: string, updates: Partial<DynamicVariable>) => {
    setCustomVariables(customVariables.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const VariableCard = ({ variable, isBuiltIn = false }: { variable: DynamicVariable; isBuiltIn?: boolean }) => {
    const Icon = typeIcons[variable.type];
    const isEditing = editingId === variable.id;

    return (
      <div className={`p-4 rounded-xl border ${isBuiltIn ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isBuiltIn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={variable.name}
                  onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                  className="font-medium text-gray-800 bg-white border rounded px-2 py-1 w-full"
                />
              ) : (
                <p className="font-medium text-gray-800">{variable.name}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <code className={`px-2 py-0.5 rounded text-xs ${
                  isBuiltIn ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {variable.key}
                </code>
                <button
                  onClick={() => copyKey(variable.key)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="복사"
                >
                  <Copy size={12} />
                </button>
              </div>
              {variable.description && (
                <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
              )}
            </div>
          </div>
          
          {!isBuiltIn && (
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingId(variable.id)}
                    className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => removeVariable(variable.id)}
                    className="p-1 text-red-400 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 기본값 */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">기본값:</span>
            {isEditing ? (
              <input
                type="text"
                value={variable.defaultValue}
                onChange={(e) => updateVariable(variable.id, { defaultValue: e.target.value })}
                className="text-sm bg-white border rounded px-2 py-1"
              />
            ) : (
              <span className="text-sm text-gray-700">{variable.defaultValue}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Variable size={18} />
          동적 콘텐츠
        </h3>
        <p className="text-sm text-gray-500 mt-1">변수를 사용해 동적인 콘텐츠를 만드세요</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 사용법 */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-800 mb-2">💡 사용법</p>
          <p className="text-xs text-gray-600">
            텍스트에 <code className="bg-white px-1 py-0.5 rounded">{'{{변수키}}'}</code>를 입력하면
            실제 값으로 자동 대체됩니다.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            예: &quot;© <code className="bg-white px-1 py-0.5 rounded">{'{{year}}'}</code> <code className="bg-white px-1 py-0.5 rounded">{'{{company}}'}</code>&quot; → &quot;© 2024 GRIP&quot;
          </p>
        </div>

        {/* 내장 변수 */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-3">내장 변수</p>
          <div className="space-y-2">
            {builtInVariables.map((variable) => (
              <VariableCard key={variable.id} variable={variable} isBuiltIn />
            ))}
          </div>
        </div>

        {/* 커스텀 변수 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500">커스텀 변수</p>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1 text-primary-500 hover:bg-primary-50 rounded"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* 추가 폼 */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 rounded-xl mb-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  placeholder="변수 이름"
                  className="px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={newVariable.key}
                  onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value.replace(/[^a-z0-9_]/g, '') })}
                  placeholder="변수 키 (영문)"
                  className="px-3 py-2 border rounded-lg text-sm font-mono"
                />
              </div>
              <input
                type="text"
                value={newVariable.defaultValue}
                onChange={(e) => setNewVariable({ ...newVariable, defaultValue: e.target.value })}
                placeholder="기본값"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                value={newVariable.description}
                onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                placeholder="설명 (선택)"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={addVariable}
                  className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                >
                  취소
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            {customVariables.map((variable) => (
              <VariableCard key={variable.id} variable={variable} />
            ))}
            {customVariables.length === 0 && !showAddForm && (
              <div className="text-center py-8 text-gray-400">
                <Variable size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">커스텀 변수가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 */}
      <div className="p-4 border-t">
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600">
          <Check size={18} />
          변수 저장
        </button>
      </div>
    </div>
  );
}

