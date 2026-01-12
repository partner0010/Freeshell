/**
 * 코드 스니펫 저장 및 관리
 */
'use client';

import { useState, useEffect } from 'react';
import { Save, FolderOpen, X, Plus, Search, Code as CodeIcon } from 'lucide-react';

interface Snippet {
  id: string;
  name: string;
  code: string;
  language: string;
  category: string;
  createdAt: Date;
}

export default function CodeSnippets({ onInsert }: { onInsert: (code: string) => void }) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [snippetName, setSnippetName] = useState('');
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetLanguage, setSnippetLanguage] = useState('html');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = () => {
    const saved = localStorage.getItem('code-snippets');
    if (saved) {
      setSnippets(JSON.parse(saved));
    }
  };

  const saveSnippet = () => {
    if (!snippetName.trim() || !snippetCode.trim()) return;

    const newSnippet: Snippet = {
      id: Date.now().toString(),
      name: snippetName,
      code: snippetCode,
      language: snippetLanguage,
      category: 'custom',
      createdAt: new Date(),
    };

    const updated = [...snippets, newSnippet];
    setSnippets(updated);
    localStorage.setItem('code-snippets', JSON.stringify(updated));
    setShowDialog(false);
    setSnippetName('');
    setSnippetCode('');
  };

  const deleteSnippet = (id: string) => {
    const updated = snippets.filter(s => s.id !== id);
    setSnippets(updated);
    localStorage.setItem('code-snippets', JSON.stringify(updated));
  };

  const filteredSnippets = snippets.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">코드 스니펫</h3>
          <button
            onClick={() => setShowDialog(true)}
            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="새 스니펫 저장"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="스니펫 검색..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CodeIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">저장된 스니펫이 없습니다</p>
          </div>
        ) : (
          filteredSnippets.map(snippet => (
            <div
              key={snippet.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{snippet.name}</h4>
                  <span className="text-xs text-gray-500">{snippet.language}</span>
                </div>
                <button
                  onClick={() => deleteSnippet(snippet.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </div>
              <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2 overflow-x-auto">
                {snippet.code.substring(0, 100)}{snippet.code.length > 100 ? '...' : ''}
              </pre>
              <button
                onClick={() => onInsert(snippet.code)}
                className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                삽입하기
              </button>
            </div>
          ))
        )}
      </div>

      {/* 스니펫 저장 다이얼로그 */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">스니펫 저장</h3>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={snippetName}
                  onChange={(e) => setSnippetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="스니펫 이름"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">언어</label>
                <select
                  value={snippetLanguage}
                  onChange={(e) => setSnippetLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">코드</label>
                <textarea
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={8}
                  placeholder="코드를 입력하세요..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveSnippet}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
